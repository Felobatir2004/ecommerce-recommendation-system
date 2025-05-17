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
  shippingaddress:{
    city:String,
    street:String,
    phone:String
  },
  paymenttype:{
    type:String,
    enum:['cash','card'],
    default:'cash'
  },
  ispaid:{
    type:Boolean,
    default:false
  },
  isdeliverd:{
    type:Boolean,
    default:false
  },
  deliverdat:Date
}, {timestamps:true});

export const Order = mongoose.model("Order", schema);
