//import { coupon } from "../../../db/model/discountcoupon.model.js";
import { coupon } from "../../../DB/Models/discountcoupon.model.js"
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
    let coupons=await coupon.find()
    res.json({message:"this is all discount coupon",coupons})
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
