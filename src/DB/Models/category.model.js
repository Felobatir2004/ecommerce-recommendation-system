import mongoose,{Schema,Types,model} from 'mongoose';
const categorySchema=new Schema(
  {
    name:{
      type:String,
      required:true,
      trim:true,
      unique:true,
    },
   createdBy:{
    type: Types.ObjectId,
     ref:"user",
    },
    /*
    Images:{
      secure_url:{
        type: String,
        required:true,
      },
      public_id:{
        type:String,
       required:true,
      },
    },*/
    
  },
  {timestamps:true}
);
categorySchema.virtual('products', {
    ref: 'Product',
    localField: 'name',
    foreignField: 'category'
});
categorySchema.set('toObject', { virtuals: true });
categorySchema.set('toJSON', { virtuals: true });
const categorymodel = mongoose.models.Category || model("Category", categorySchema);
export default categorymodel;