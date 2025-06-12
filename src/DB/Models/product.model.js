/*
import { Types } from "mongoose";
import mongoose,{model, Schema} from "mongoose";
//const{Schema,model}=mongoose;
const productSchema=new Schema(
  {
    name:{
      type:String,
      required:true,
      trim:true,
    },
    price:{
      type:Number,
      required:true,
      min:50,
    },
    stock:{
      type:Number,
      required:true,
      min: 10,
    },
    rating:{
      type:Number,
      min:0,
      max:5,
      default:0,
    },
    Images:{
        secure_url:{
            type:String,
            required:true,
        },
        public_id:{
            type:String,
            required:true,
        },
    },
    category:{
        type:String,
        ref:"Category",
    },
    createdBy:{
      type:Types.ObjectId,
       ref:"user",
    },
  },
  {timestamps:true}
);
export const Product=mongoose.models.Product||model("Product",productSchema);
*/
import mongoose, { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    /*
  Images: [
    {
        type: String,
        required: true,
    },
  ],
*/
    imageURLs: [
    {
        type: String,
        required: true,
    },
  ],



    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    rate: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    categories: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || model("Product", productSchema);
