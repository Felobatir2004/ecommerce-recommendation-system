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
    const { userId } = req.body;
    const productId = req.params.id;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid or missing userId" });
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

    const wishlistWithImages = user.withlist.map((product) => {
      const raw = product._doc;

      let imageURLs = [];

      if (raw.Images && typeof raw.Images === "string") {
        imageURLs = raw.Images.split(',').map(url => url.trim());
      } else if (Array.isArray(raw.Images)) {
        imageURLs = raw.Images;
      }

      return {
        ...raw,
        imageURLs: imageURLs.filter(url => url), // تأكد إنها مش فاضية
      };
    });

    res.status(200).json({
      success: true,
      message: "Wishlist retrieved successfully",
      wishlist: wishlistWithImages,
    });
  } catch (error) {
    console.error("Error in getAllInWishlist:", error);
    next(error);
  }
};
