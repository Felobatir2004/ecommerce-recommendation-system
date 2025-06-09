import { OTPType, roleType, UserModel } from "../../DB/Models/user.model.js";
import * as dbService from "../../DB/dbService.js"
import { emailEmitter } from "../../utils/email/email.event.js"
import { compareHash, hash } from "../../utils/hashing/hash.js";
import { generateToken } from "../../utils/token/token.js"
import axios from "axios";
import jwt from "jsonwebtoken"
/*
export const register = async  (req,res,next)=>{
    const {userName , email , password }= req.body

    const user = await dbService.findOne({model: UserModel , filter: {email}})
    if(user) return next (new Error("User already exists",{cause: 409}))

    const newUser = await dbService.create({
        model: UserModel,
        data:{
        userName , 
        email , 
        password,
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
*/
/*
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
*/

export const signUp = async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;

    const existingUser = await dbService.findOne({ model: UserModel, filter: { email } });
    if (existingUser) {
      const error = new Error("User already exists");
      error.status = 409;
      return next(error);
    }

    const newUser = await dbService.create({
      model: UserModel,
      data: {
        userName,
        email,
        password,
        isVerified: true, 
      },
    });


emailEmitter.emit("sendWelcomeEmail", email, newUser.userName);


    const access_token = generateToken({
      payload: { id: newUser._id },
      signature: process.env.USER_ACCESS_TOKEN,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRESS },
    });

    const refresh_token = generateToken({
      payload: { id: newUser._id },
      signature: process.env.USER_ACCESS_TOKEN,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRESS },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully and logged in",
      tokens: {
        access_token,
        refresh_token,
        roleId: 2, 
      },
      user: {
        id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
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
