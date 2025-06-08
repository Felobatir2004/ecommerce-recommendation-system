import { OTPType, roleType, UserModel } from "../../DB/Models/user.model.js";
import * as dbService from "../../DB/dbService.js"
import { emailEmitter, otp } from "../../utils/email/email.event.js"
import { compareHash, hash } from "../../utils/hashing/hash.js";
import { generateToken } from "../../utils/token/token.js"

export const register = async  (req,res,next)=>{
    const {userName , email , password ,mobileNumber}= req.body

    const user = await dbService.findOne({model: UserModel , filter: {email}})
    if(user) return next (new Error("User already exists",{cause: 409}))

    const newUser = await dbService.create({
        model: UserModel,
        data:{
        userName , 
        email , 
        password,
        mobileNumber,
        OTP:[{
            OTPtype:OTPType.confirmEmail,
            code:hash({plainText:otp}),
            expiresIn:Date.now() + 5 * 60 * 1000,
        }],
    }
    })

    emailEmitter.emit("sendEmail",email,newUser.userName,newUser._id)
    return res.status(200).json({success:true , message :"user Registered successfully", newUser})
}

export const verifyEmail = async (req, res, next) => {
        const { code, email } = req.body;

        const user = await dbService.findOne({ model: UserModel, filter: { email } });

        if (!user) return next(new Error("User not found", { cause: 404 }));

        if (user.isVerified) {
            return next(new Error("Email already verified", { cause: 409 }));
        }

        if (!Array.isArray(user.OTP) || user.OTP.length === 0) {
            return next(new Error("Invalid or expired OTP", { cause: 400 }));
        }

        const otpEntry = user.OTP.find(entry => entry.OTPtype === OTPType.confirmEmail);
        if (!otpEntry) {
            return next(new Error("Invalid or expired OTP type", { cause: 400 }));
        }

        const currentTime = new Date();
        if (otpEntry.expiresAt < currentTime) {
            return next(new Error("OTP has expired", { cause: 400 }));
        }

        if (!compareHash({plainText:code, hash:otpEntry.code})) {
            return next(new Error("Invalid OTP code", { cause: 400 }));
        }

        await dbService.UpdateOne({
            model: UserModel,
            filter: { email },
            data: { isVerified: true, OTP: [] }
        });

        return res.status(200).json({ success: true, message: "Email verified successfully" });
};

export const login = async (req,res,next)=>{
    const {email , password} =req.body;

    const user =await dbService.findOne({model:UserModel , filter: {email}})
    if(!user) return next(new Error("user not found",{cause: 404}))
    
    if(!user.isVerified)
        return next (new Error("email not verified",{cause: 401}))
    
    if(!compareHash({plainText: password, hash: user.password}))
        return next (new Error("invalid password",{cause: 400}))

    const access_token = generateToken({
        payload:{id:user._id},
        signature: user.role === roleType.User
          ? process.env.USER_ACCESS_TOKEN 
          : process.env.ADMIN_ACCESS_TOKEN,
        options:{expiresIn: process.env.ACCESS_TOKEN_EXPIRESS}
    })

    const refresh_token = generateToken({
        payload:{id:user._id},
        signature: user.role === roleType.User
          ? process.env.USER_ACCESS_TOKEN 
          : process.env.ADMIN_ACCESS_TOKEN,
        options:{expiresIn: process.env.REFRESH_TOKEN_EXPIRESS}

    })
     let roleId 
    if (user.role === roleType.Admin)
    {
         roleId = 1
    }
    if (user.role === roleType.User)
    {
        roleId = 2
    }
    return res.status(200).json({
        success: true,
         tokens: {
            access_token,
            refresh_token,
            roleId
         }
    })
}
/*
export const auth0Login = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new Error("Email is required", { cause: 400 }));
    }

    // 1. شوف إذا فيه يوزر بالإيميل ده
    let user = await dbService.findOne({ model: UserModel, filter: { email } });

    // 2. لو مفيش يوزر → اعمله تسجيل تلقائي
    if (!user) {
      user = await dbService.create({
        model: UserModel,
        data: {
          email,
          password: "auth0_user", // باسورد وهمي - مش هيستخدمه
          isVerified: true,        // لأن Auth0 بالفعل موثّق
          role: roleType.User
        }
      });
    }

    // 3. طلعله التوكنات زي ما في login العادي
    const access_token = generateToken({
      payload: { id: user._id },
      signature: user.role === roleType.User
        ? process.env.USER_ACCESS_TOKEN
        : process.env.ADMIN_ACCESS_TOKEN,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRESS }
    });

    const refresh_token = generateToken({
      payload: { id: user._id },
      signature: user.role === roleType.User
        ? process.env.USER_ACCESS_TOKEN
        : process.env.ADMIN_ACCESS_TOKEN,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRESS }
    });

    let roleId = user.role === roleType.Admin ? 1 : 2;

    return res.status(200).json({
      success: true,
      tokens: {
        access_token,
        refresh_token,
        roleId
      }
    });

  } catch (err) {
    return next(new Error("Server Error", { cause: 500 }));
  }
};
*/

export const auth0_callback = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) return next(new Error("Authorization code is required", { cause: 400 }));

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.AUTH0_CLIENT_ID);
    params.append('client_secret', process.env.AUTH0_CLIENT_SECRET);
    params.append('code', code);
    params.append('redirect_uri', 'https://ecommerce-recommendation-system.vercel.app/auth/auth0/callback');

    const tokenRes = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, params, {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });

    const { id_token } = tokenRes.data;
    const decoded = jwt.decode(id_token);
    const { sub: auth0Id, email, name } = decoded;

    if (!email) return next(new Error("Email not found in token", { cause: 400 }));

    let user = await dbService.findOne({ model: UserModel, filter: { auth0Id } });

    if (!user) {
      user = await dbService.create({
        model: UserModel,
        data: { auth0Id, email, name, password: 'auth0_user', isVerified: true, role: roleType.User },
      });
    } else {
      await dbService.update({ model: UserModel, filter: { auth0Id }, data: { email, name } });
    }

    const access_token = jwt.sign({ id: user._id }, process.env.USER_ACCESS_TOKEN, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    });

    const refresh_token = jwt.sign({ id: user._id }, process.env.USER_ACCESS_TOKEN, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    });

    const roleId = user.role === roleType.Admin ? 1 : 2;

    return res.status(200).json({
      success: true,
      tokens: { access_token, refresh_token, roleId },
      user: { id: user._id, email, name, auth0Id },
    });
  } catch (error) {
    console.error('Auth0 callback error:', error);
    return next(new Error('Server Error', { cause: 500 }));
  }
};


export const auth0SignupOrLogin = async (req, res, next) => {
  const { email, name } = req.body;

  if (!email) {
    return next(new Error("Email is required", { cause: 400 }));
  }

  let user = await dbService.findOne({ model: UserModel, filter: { email } });

  if (!user) {
    // First-time signup
    user = await dbService.create({
      model: UserModel,
      data: {
        email,
        name,
        password: "auth0", // dummy value, won't be used
        isVerified: true,
        role: roleType.User,
      },
    });
  }

  const access_token = generateToken({
    payload: { id: user._id },
    signature: process.env.USER_ACCESS_TOKEN,
    options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRESS }
  });

  const refresh_token = generateToken({
    payload: { id: user._id },
    signature: process.env.USER_ACCESS_TOKEN,
    options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRESS }
  });

  const roleId = user.role === roleType.Admin ? 1 : 2;

  return res.status(200).json({
    success: true,
    tokens: {
      access_token,
      refresh_token,
      roleId
    }
  });
};


export const forget_password = async (req,res,next)=>{

    const { email } =req.body

    const user = await dbService.findOne({model:UserModel , filter: {email}})
    if(!user) return next(new Error("User Not Found", {cause: 404}))
    
    const updateUser = await dbService.UpdateOne({
        model:UserModel,
        filter:{email},
        data:{
            OTP:[{
                OTPtype:OTPType.forgetPassword,
                code:hash({plainText:otp}),
                expiresIn:Date.now() + 5 * 60 * 1000,
            }]
        }
    })
    emailEmitter.emit("forgetPasssword",email,user.userName,user._id)
    return res.status(200).json({
        success: true,
        message:"email sent successfully"
    })
}

export const reset_password = async (req, res, next) => {
    const { email, password, code } = req.body;

    const user = await dbService.findOne({ model: UserModel, filter: { email } });
    if (!user) return next(new Error("User Not Found", { cause: 404 }));

    // Ensure OTP exists
    if (!Array.isArray(user.OTP) || user.OTP.length === 0) {
        return next(new Error("Invalid or expired OTP", { cause: 400 }));
    }

    // Find the correct OTP
    const otpEntry = user.OTP.find(entry => entry.OTPtype === OTPType.forgetPassword);
    if (!otpEntry) {
        return next(new Error("Invalid or expired OTP type", { cause: 400 }));
    }

    // Check if OTP is expired
    if (otpEntry.expiresAt < new Date()) {
        return next(new Error("OTP has expired", { cause: 400 }));
    }

    // Compare OTP code correctly
    if (!compareHash({ plainText: code, hash: otpEntry.code })) {
        return next(new Error("Invalid OTP code", { cause: 400 }));
    }

    // Update password and clear OTP
    await dbService.UpdateOne({
        model: UserModel,
        filter: { email },
        data: {
            password: hash({ plainText: password }),
            $unset: { OTP: "" }
        }
    });

    return res.status(200).json({
        success: true,
        message: "Password updated successfully"
    });
};
