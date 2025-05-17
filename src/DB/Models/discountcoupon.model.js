import mongoose,{model, Schema} from "mongoose";
const coupondiscountschema=new Schema({
    code:String,
    endDate:Date,
discountpercentage:Number,
},
    {timestamps:true})
    export const coupon=mongoose.models.coupon||model("coupon",coupondiscountschema)