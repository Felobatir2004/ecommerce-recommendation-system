import { UserModel } from "../../../DB/Models/user.model.js";
import { Product } from './../../../DB/Models/product.model.js';
export const addToWishlist = async (req, res, next) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "userId and productId are required" });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { withlist: productId } },
      { new: true }
    ).populate("withlist"); // Optional: populate product details

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Product added to wishlist", wishlist: user.withlist });
  } catch (error) {
    console.error("Error in addToWishlist:", error);
    next(error); // Let error middleware handle it
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