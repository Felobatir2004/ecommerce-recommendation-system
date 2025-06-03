import { UserModel } from "../../../DB/Models/user.model.js";
import { Product } from './../../../DB/Models/product.model.js';
export const addtowithlist=async(req,res,next)=>{
let withlist= await UserModel.findByIdAndUpdate(req.user._id,
    {$addToSet:{withlist:req.body.Product}},{new:true})
    if(!withlist)
        {
            res.json({message:"withlist not found"})
        }
        res.json({message:"withlist",withlist})
}

    export const removefromwithlist=async(req,res,next)=>{
        let withlist= await UserModel.findByIdAndUpdate(req.user._id,
            {$pull:{withlist:req.params.id}},{new:true})
            if(!withlist)
                {
                    res.json({message:"withlist not found"})
                }
                res.json({message:"withlist",withlist})
            }
            export const getallinwithlist=async(req,res,next)=>{
                let withlist= await UserModel.findById(req.user._id)
                    if(!withlist)
                        {
                            res.json({message:"withlist not found"})
                        }
                        res.json({message:"withlist",withlist})
                    }