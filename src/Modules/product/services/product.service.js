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
    const { brand, imageURL, name, price, rate, categories } = req.body;

    if (!brand || !imageURL || !name || !price || !categories) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    // تحقق من وجود الكاتيجوري
    let category = await categorymodel.findOne({ name: categories });

    // لو مش موجودة، أضفها
    if (!category) {
      category = await categorymodel.create({ name: categories });
      console.log(`Category '${categories}' created.`);
    } else {
      console.log(`Category '${categories}' already exists.`);
    }

    const product = new Product({
      brand,
      Images: [imageURL],
      name,
      price,
      rate: rate || 0,
      categories: category.name,
    });

    await product.save();

    return res.status(201).json({
      message: "Product added successfully",
      product,
    });

};

export const getproductById=async(req,res,next)=>{
    const product =await Product.findById(req.params.id)
    if(!product)
    {
        res.status(404).json({message:"product not found"})
    }
    res.json({message:"product gets successfly",product})
}
export const getProductsByName = async (req, res, next) => {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Invalid or missing product name" });
    }

    const products = await dbService.find({
      model: Product,
      filter: {
        name: { $regex: name, $options: "i" } // بحث جزئي بدون حساسية لحالة الحروف
      }
    });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json({
      message: "Products retrieved successfully",
      products
    });
};


export const getproductsbycategory = async (req, res, next) => {
        const { category } = req.body;

        const checkCategory = await dbService.findOne({
            model: categorymodel,
            filter: { name: category },
        });

        if (!checkCategory) {
            return next(new Error("Category not found", { cause: 404 }));
        }

        let products = await Product.find({ categories: category });

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "product not found" });
        }

        products = products.map(product => {
            const productObj = product.toObject();
            if (typeof productObj.imageURLs === 'string') {
                productObj.imageURLs = productObj.imageURLs.split(',').map(url => url.trim());
            }
            return productObj;
        });

        return res.json({ message: "Products retrieved successfully", products });
    
    }




export const getallproduct=async(req,res,next)=>{
    let products =await Product.find()
    if(!products)
    {
        res.status(404).json({message:"product not found"})
    }
        products = products.map(product => {
      const productObj = product.toObject();
      if (typeof productObj.imageURLs === 'string') {
        productObj.imageURLs = productObj.imageURLs.split(',').map(url => url.trim());
      }
      return productObj;
    });
    res.json({message:"product gets successfly",products})
}
/*
export const getallproduct=async(req,res,next)=>{
    const page =req.query.page *1||1;
    const limit=req.query.limit1||20;
    const skip=(page-1)*limit;
    let products =await Product.find().skip(skip).limit(limit)
    res.json({message:"product gets successfly",products})
}
    */
export const deleteproduct=async(req,res,next)=>{
    const {productName , price}=req.body
    let product=await Product.findOneAndDelete({name:productName,price:price})
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