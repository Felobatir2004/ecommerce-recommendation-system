//import { coupon } from "../../../db/model/discountcoupon.model.js";
import { coupon } from "../../../DB/Models/discountcoupon.model.js"
import {UserModel} from "../../../DB/Models/user.model.js"
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
    const user = await UserModel.findById(user_id)
      .populate("cart")
      .populate("withlist");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Use raw IDs
    const cartIds = user.cart.map(id => id.toString());
    const wishlistIds = user.withlist.map(id => id.toString());
    const productIds = cartIds.join(",");

    // Build URLs
    const collaborativeUrl = `https://488e-197-63-194-136.ngrok-free.app/content?product_id=${encodeURIComponent(productIds)}`;
    const hybridUrl = `https://488e-197-63-194-136.ngrok-free.app/hybrid?user_id=${encodeURIComponent(user_id)}`;

    // Fetch from AI API
    const [collaborativeRes, hybridRes] = await Promise.all([
      axios.get(collaborativeUrl),
      axios.get(hybridUrl)
    ]);

    const collaborativeProducts = Array.isArray(collaborativeRes.data) ? collaborativeRes.data : [];
    const hybridProducts = Array.isArray(hybridRes.data) ? hybridRes.data : [];

    // Filter out existing items
    const allExistingIds = new Set([...cartIds, ...wishlistIds]);

    const filterOutExisting = (products) =>
      products.filter(prod => prod._id && !allExistingIds.has(prod._id));

    const filteredCollaborative = filterOutExisting(collaborativeProducts);
    const filteredHybrid = filterOutExisting(hybridProducts);

    return res.json({
      collaborative: filteredCollaborative,
      hybrid: filteredHybrid
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error fetching recommendations",
      error: error.message
    });
  }
};