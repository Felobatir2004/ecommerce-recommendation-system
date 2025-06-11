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
  name:String,
  email:String,
  phoneNumber:String,
  address:String,
  cardNumber:String,
  cvv:String,
  expiryDate:String,
  paymenttype:{
    type:String,
    enum:['cash','visa'],
    default:'cash'
  },
}, {timestamps:true});

export const Order = mongoose.model("Order", schema);
