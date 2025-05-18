//import { Product } from "../../../db/model/product.model.js";
//import { Product } from "../../../DB/Models/product.model.js"
import { nanoid } from "nanoid";
import cloudinary from "../../../utils/fileUploading/cloudinaryConfig.js";
import {Product} from "../../../DB/Models/product.model.js"
import { UserModel } from "../../../DB/Models/user.model.js";
import { roleType } from "../../../DB/Models/user.model.js";
import * as dbService from "../../../DB/dbService.js"

export const addproduct = async (req, res, next) => {
    const { name , price , stock } = req.body;
    const { category } = req.params
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
    let customId = nanoid(5)

    const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path,{
        folder: `product/${customId}/${name}`,
    })

    const product = await Product.create({
        name,
        price,
        stock,
        Images: {
            secure_url,
            public_id
        },
        category:category

    });

    res.status(201).json({ message: "Product created successfully" , product });
}
export const getproduct=async(req,res,next)=>{
    let product =await Product.findById(req.params.id)
    res.json({message:"product gets successfly",product})
    if(!product)
    {
        res.status(404).json({message:"product not found"})
    }
}
export const getallproduct=async(req,res,next)=>{
    let products =await Product.find()
    res.json({message:"product gets successfly",products})
}
export const deleteproduct=async(req,res,next)=>{
    let product=await Product.findByIdAndDelete(req.params.id)
    if(!product)
    {
        res.status(404).json({message:"product not found"})
    }
   res.json({message:"product deleted",product})
}
export const updateproduct=async(req,res,next)=>{
    let product =await Product.findByIdAndUpdate(req.params.id,req.body,{new:true})
    if(!product)
    {
        res.json({message:"product not found"})
    }
    res.json({message:"product udated",product})
}