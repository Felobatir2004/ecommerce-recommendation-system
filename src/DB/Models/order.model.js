import mongoose, { Types } from "mongoose";
const schema=new mongoose.Schema({
  user:{type:Types.ObjectId, ref:"User" },
  orderItems:[
    {
      product:{type:Types.ObjectId,ref:"Product" },
      quantity:Number,
      price:Number
    }
  ],
  totalorderprice:Number,
  Name:String,
  Email:String,
  Phone:String,
  Address:String,
  card:String,
  cvv:String,
  expiry:String,
  paymentMethod:{
    type:String,
    enum:['cash','visa'],
    default:'cash'
  },
}, {timestamps:true});

export const Order = mongoose.model("Order", schema);
