import { UserModel } from "../../../DB/Models/user.model.js";
import { Product } from './../../../DB/Models/product.model.js';
import mongoose from "mongoose";
const { Types } = mongoose;

export const addToWishlist = async (req, res, next) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "userId and productId are required" });
    }

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    const userObjectId = new Types.ObjectId(userId);

    const user = await UserModel.findByIdAndUpdate(
      userObjectId,
      { $addToSet: { withlist: productId } },
      { new: true }
    ).populate("withlist"); 
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Product added to wishlist", wishlist: user.withlist });
  } catch (error) {
    console.error("Error in addToWishlist:", error);
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid or missing userId" });
    }

    if (!productId || !Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid or missing productId" });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { withlist: productId } },
      { new: true }
    ).populate("withlist");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: user.withlist,
    });
  } catch (error) {
    console.error("Error in removeFromWishlist:", error);
    next(error);
  }
};


export const getAllInWishlist = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid or missing userId" });
    }

    const user = await UserModel.findById(userId).populate("withlist");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const wishlistWithFirstImage = user.withlist.map((product) => {
      const { Images, ...rest } = product._doc; 
      return {
        ...rest,
        image: Images?.[0] || null, 
      };
    });

    res.status(200).json({
      success: true,
      message: "Wishlist retrieved successfully",
      wishlist: wishlistWithFirstImage,
    });
  } catch (error) {
    console.error("Error in getAllInWishlist:", error);
    next(error);
  }
};


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
                    import { Router } from "express";

const router = Router();

