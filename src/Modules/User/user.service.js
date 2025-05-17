import { UserModel } from "../../DB/Models/user.model.js";
import * as dbService from "../../DB/dbService.js";
import { decodedToken, tokenTypes } from "../../middlewares/auth.middleware.js";
import { compareHash, hash } from "../../utils/hashing/hash.js";

export const updateUser = async (req,res,next)=>{
    const {userName , email , mobileNumber , gender}= req.body
    const user = await dbService.findOne({model:UserModel , filter:{_id:req.user._id}})
    if(!user) return next(new Error("User not found",{cause: 404}))
    if(!user.isVerified) return next(new Error("email not verified",{cause: 401}))
    const updateEmail = await dbService.findOne({model:UserModel , filter:{email}})
    if(updateEmail) return next(new Error("email already exists",{cause: 409}))
    const userupdate  = await dbService.UpdateOne({
        model:UserModel,
        filter:{_id:user._id},
        data:{
            userName , 
            email , 
            mobileNumber , 
            gender,
            updatedBy:user._id
        }
    })
    return res.status(200).json({ success: true, message: "user updated successfully" });
}

export const getProfile = async (req, res, next) => {    
    const { userId } = req.params;

    const user = await dbService.findOne({
        model: UserModel,
        filter: { _id: userId },
        select: "userName mobileNumber email gender -_id",
    });
    if (!user) return next(new Error("User not found", { cause: 404 }));
    return res.status(200).json({ success: true, data: { user:{
        userName:user.userName,
        mobileNumber:user.mobileNumber,
        email:user.email,
        gender:user.gender
    } } });
};

export const getLoginUserData = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return next(new Error("Authorization header is missing", { cause: 401 }));
    }

    const user = await decodedToken({
        authorization,
        tokenType: tokenTypes.access,
        next
    });
  if (!user) {
    return next(new Error('User not found', { cause: 404 }));
  }


  res.status(200).json({
    success: true,
    data: {user},
  });
};

export const updatePassword = async (req,res,next) =>{
    const {oldPassword , password} =req.body;

    if(!compareHash({plainText: oldPassword,hash:req.user.password}))
    return next(new Error("In-valid password",{cause:400}))

    const user= await dbService.UpdateOne({
        model:UserModel,
        filter:{_id: req.user._id},
        data:{
            password:hash({plainText:password}),
            changeCredentials:Date.now(),
            updatedBy:req.user._id
        }
    })

    return res.status(200).json({success:true,message:"password updated successfully"})

}

export const softDelete = async (req, res, next) => {
    const {userId} = req.params;

    const deleteuser = await dbService.findById({
        model:UserModel,
        id:{_id:userId }
    });
    if(!deleteuser) return next(new Error("user not found",{cause:404}))
    console.log(req.user._id);
    console.log(deleteuser._id);
    
    if(deleteuser._id.toString() === req.user._id.toString() ||req.user.role === roleType.Admin) 
    {
        deleteuser.isDeleted = true;
        deleteuser.deletedAt = Date.now();
        await deleteuser.save()
        return res.status(200).json({success:true , data:{deleteuser}})
    }
    else{
        return next(new Error("You are not authorized to delete this user",{cause:401}))
    }

}