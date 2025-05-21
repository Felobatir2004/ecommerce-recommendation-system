import categorymodel from "../../../DB/Models/category.model.js";
import { roleType, UserModel } from "../../../DB/Models/user.model.js";
import { nanoid } from "nanoid";
import cloudinary from "../../../utils/fileUploading/cloudinaryConfig.js";
import * as dbService from "../../../DB/dbService.js"
export const addcategory = async (req, res, next) => {
        const { name } = req.body;
        
       const user = await dbService.findOne({
               model: UserModel,
               filter: { _id: req.user._id },
           });
       
           if (!user) {
               return res.status(404).json({ message: "User not found" });
           }
       
           if (user.role !== roleType.Admin) {
               return res.status(401).json({ message: "You are not authorized to add product" });
           }

        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "Please upload an image file (JPEG, JPG, PNG)" 
            });
        }

        const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path,{
        folder: `categories/${name}`,
        })

        // 4. Create category
        const category = await categorymodel.create({
            name,
            createdBy: req.user._id,
            Images: {
                secure_url: secure_url,
                public_id: public_id
            }
        });

        return res.status(201).json({ 
            success: true, 
            data: { 
                category,
                message: "Category created successfully with image" 
            }
        });
}
export const getcategory=async(req,res,next)=>{
   let categorys =await categorymodel.findById(req.params.id)
   res.json({message:"Category gets success",categorys});
}                                          
/*
export const getallcategory=async(req,res,next)=>{
   let category=await categorymodel.find()   
   res.json({message:"Categorys gets success",category});
}
   */
export const getallcategory=async(req,res,next)=>{
    const page =req.query.page *1||1;
    const limit=req.query.limit1||20;
    const skip=(page-1)*limit;
   let category=await categorymodel.find().skip(skip).limit(limit)
   res.json({message:"Categorys gets success",category});
}
export const updatecategory=async(req,res,next)=>{
    let category=await categorymodel.findByIdAndUpdate(req.params.id,req.body,{new:true})
    if(!category){
        return res.status(404).json({message:"category not found"});
    }
    res.json({message:"Categorys updated successfly",category});
}
export const deletecategory=async(req,res,next)=>{
let category=await categorymodel.findByIdAndDelete(req.params.id)
if(!category){
    return res.status(404).json({message:"category not found"});
}
    res.json({message:"category deleted succesfly",category})
}

