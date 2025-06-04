  import mongoose,{Schema,model,Types} from "mongoose";
  //import { ObjectId } from '../../../node_modules/bson/src/objectid';
  const reviewschema=new Schema({
  comment:String,
  user:{
      type:Types.ObjectId,
      ref:"user",
    //  required:true
  },
    rate:{
      type:Number,
      min:0,
      max:5,
     // required:true   
    },
    product:{
    type:Types.ObjectId,
     ref:"product",
     // required:true
    },
    review:{
      type:String,
      required:true
    }
  })
  export const review =mongoose.models.review ||model("review",reviewschema)
