import mongoose,  {Schema , Types, model} from "mongoose";
import { hash } from "../../utils/hashing/hash.js";

export const genderType= {
    male: "male",
    female: "female"
}

export const roleType= {
    User: "User",
    Admin: "Admin"
}
export const OTPType = {
  confirmEmail:"confirmEmail",
  forgetPassword:"forgetPassword"
}

const userSchema = new Schema({
   userName: {
    type:String,
    required:true,
    minLength:[3,"name must be at least 3 characters long"],
    maxLength:[20,"name must be at most 20 characters long"],
    trim : true,
   },
   email:{
    type:String,
    required:[true,"email is required"],
    unique:[true,"email must be unique"],
    lowercase:true,
    trim : true,
   },
   password: {
    type:String,
    minLength:[6,"password must be at least 6 characters long"],
    required:[true,"password is required"],
   },
   gender:{
    type:String,
    enum:Object.values(genderType),
   },
  mobileNumber:String,
  role:{
    type:String,
    enum:Object.values(roleType),
    default:roleType.User
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt:Date,
  updatedBy:{
    type:Types.ObjectId,
    ref:"User"
  },

withlist:[{type:Types.ObjectId,ref:'Product'}],
cart:[{type:Types.ObjectId,ref:'Product'}]

   
},{timestamps:true})
userSchema.pre("save",function(next){
  if(this.isModified("password")) 
  {
      this.password = hash({plainText:this.password})
  }
  return next()
})
export const UserModel = mongoose.models.User || model("User",userSchema)