import { UserModel } from "../../../DB/Models/user.model.js";
import { Product } from './../../../DB/Models/product.model.js';
import mongoose from "mongoose";
const { Types } = mongoose;

export const addToWishlist = async (req, res, next) => {
  try {
    const { userId, productId } = req.body;

    // ✅ التحقق من الحقول المطلوبة
    if (!userId || !productId) {
      return res.status(400).json({ message: "userId and productId are required" });
    }

    // ✅ التحقق من صحة ObjectId يدويًا
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    // ✅ تحويل userId إلى ObjectId يدويًا
    const userObjectId = new Types.ObjectId(userId);

    const user = await UserModel.findByIdAndUpdate(
      userObjectId,
      { $addToSet: { withlist: productId } },
      { new: true }
    ).populate("withlist"); // Optional: populate product details

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
    ).populate("wishlist");

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


