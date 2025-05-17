import mongoose,{Types}from "mongoose";
const schema=new mongoose.Schema({
  user:{type:Types.ObjectId,ref:'user'},
  cartItems:[
    {
      product:{type:Types.ObjectId,ref:'Product'},
      quantity:{type:Number,default:1},
      price:Number
    }
  ],
  totalCartPrice:Number,
  discount:Number,
  productQuintity:{type:Number,default:1},
  totalCartPriceAfterdiscount:Number
},{timestamps:true});
export const cartModel=mongoose.model('cart',schema);
