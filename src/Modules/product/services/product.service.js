//import { Product } from "../../../db/model/product.model.js";
//import { Product } from "../../../DB/Models/product.model.js"
import { nanoid } from "nanoid";
import cloudinary from "../../../utils/fileUploading/cloudinaryConfig.js";
import {Product} from "../../../DB/Models/product.model.js"
import { UserModel } from "../../../DB/Models/user.model.js";
import { roleType } from "../../../DB/Models/user.model.js";
import * as dbService from "../../../DB/dbService.js"
import categorymodel from "../../../DB/Models/category.model.js";

export const addproduct = async (req, res, next) => {
    const { name , price , stock , categoryName} = req.body;
    
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
    const checkCategory= await dbService.findOne({
        model: categorymodel,
        filter: { name: categoryName },
    })
    if(!checkCategory) return next(new Error("Category not found",{cause: 404}))

    const product = await Product.create({
        name,
        price,
        stock,
        Images: {
            secure_url,
            public_id
        },
        category:categoryName,
        createdBy: req.user._id,

    });    

    res.status(201).json({ message: "Product created successfully" , product });
}
export const getproductById=async(req,res,next)=>{
    const product =await Product.findById(req.params.id)
    if(!product)
    {
        res.status(404).json({message:"product not found"})
    }
    res.json({message:"product gets successfly",product})
}
export const getproductbyName=async(req,res,next)=>{
    const {name}=req.body
    let product =await dbService.findOne({model:Product,filter:{name:name}})
    if(!product)
    {
        res.status(404).json({message:"product not found"})
    }
    res.json({message:"product gets successfly",product})
}
export const getproductsbycategory=async(req,res,next)=>{
    const {category}=req.body

    const checkCategory= await dbService.findOne({
        model: categorymodel,
        filter: { name: category },
    })
    if(!checkCategory) return next(new Error("Category not found",{cause: 404}))

    const products =await dbService.find({model:Product,filter:{category:category}})
    if(!products)
    {
        res.status(404).json({message:"product not found"})
    }
    res.json({message:"product gets successfly",products})
}
/*
export const getallproduct=async(req,res,next)=>{
    const products =await Product.find()
    if(!products)
    {
        res.status(404).json({message:"product not found"})
    }
    res.json({message:"product gets successfly",products})
}*/
export const getallproduct=async(req,res,next)=>{
    const page =req.query.page *1||1;
    const limit=req.query.limit1||20;
    const skip=(page-1)*limit;
    let products =await Product.find().skip(skip).limit(limit)
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