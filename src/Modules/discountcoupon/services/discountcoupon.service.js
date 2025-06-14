//import { coupon } from "../../../db/model/discountcoupon.model.js";
import { coupon } from "../../../DB/Models/discountcoupon.model.js"
import {UserModel} from "../../../DB/Models/user.model.js"
import {Product} from "../../../DB/Models/product.model.js";
export const addcoupon=async(req,res,next)=>{
    try{
    let Coupon=new coupon(req.body)
    await Coupon.save()
    res.status(201).json({message:"the order after discount"})
    }catch(error)
    {
    res.status(500).json({message:"coupon invalid"})
    }
}
export const getalldiscoutcoupon=async(req,res,next)=>{
    try{
        const coupons=await coupon.find()
        res.json({message:"this is all discount coupon",coupons})
    }catch(error){
        res.status(500).json({message:"Internal Server Error"})
    }
}
export const getsinglediscountcoupon=async(req,res,next)=>{
    let onecoupon=await coupon.findById(req.params.id)
    res.json({message:"this is one coupon",onecoupon})
}
export const updatediscountcoupon=async(req,res,next)=>{
let updatedcoupon= await coupon.findByIdAndUpdate(req.params.id,req.body,{new:true})
if(!updatedcoupon)
{
   return res.status(404).json({message:"there is no coupon"})
}
res.json({message:"coupon updated",updatedcoupon})
}
export const deletediscountcoupon=async(req,res,next)=>{
    let deletedcoupon=await coupon.findByIdAndDelete(req.params.id)
    if(!deletedcoupon)
    {
        return res.status(404).json({message:"coupon not found"})
    }
    res.json({message:"the coupon is deleted"})
}
// filepath: c:\Users\eng abdo essam\OneDrive\سطح المكتب\graduation ecommerce (4)\graduation ecommerce\ecommerce-recommendation-system\src\Modules\discountcoupon\services\discountcoupon.service.js
import axios from 'axios';

/*
export const getCollaborativeRecommendations = async (req, res, next) => {
  const { user_id } = req.params;
  if (!user_id) {
    return res.status(400).json({ message: "user_id is required" });
  }
  const apiUrl = ` https://488e-197-63-194-136.ngrok-free.app/hybrid?user_id=${encodeURIComponent(user_id)}`;
  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recommendations", error: error.message });
  }
};
*/



export const getCollaborativeRecommendations = async (req, res, next) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ message: "user_id is required" });
  }

  try {
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(user.cart) || user.cart.length === 0) {
      return res.status(200).json({
        collaborative: [],
        hybrid: [],
        message: "Cart is empty. No recommendations can be generated.",
      });
    }

    
    const userCartProducts = await Product.find({
      _id: { $in: user.cart },
    });

    if (!userCartProducts || userCartProducts.length === 0) {
      return res.status(200).json({
        collaborative: [],
        hybrid: [],
        message: "No valid products found in cart to generate recommendations.",
      });
    }

    const firstProductId = userCartProducts[0]._id;

    const baseUrl = process.env.RECOMMENDER_BASE_URL || "https://bf06-197-63-194-136.ngrok-free.app";
    const collaborativeUrl = `${baseUrl}/content?product_id=${firstProductId}`;
    const hybridUrl = `${baseUrl}/hybrid?user_id=${user_id}`;

    const [collaborativeRes, hybridRes] = await Promise.allSettled([
      axios.get(collaborativeUrl),
      axios.get(hybridUrl),
    ]);

    return res.status(200).json({
      collaborative: collaborativeRes.status === "fulfilled" ? collaborativeRes.value.data : [],
      hybrid: hybridRes.status === "fulfilled" ? hybridRes.value.data : [],
      message:
        collaborativeRes.status === "fulfilled" && hybridRes.status === "fulfilled"
          ? "Recommendations fetched successfully"
          : "Fetched with partial results due to an error in one or both services",
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    return res.status(500).json({
      message: "Error fetching recommendations",
      error: error.message,
    });
  }
};
