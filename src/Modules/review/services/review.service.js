//import { review } from "../../../db/model/review.model.js";
import { review } from "../../../DB/Models/review.model.js"
export const addreview =async(req,res,next)=>{
  try{
    const addreview= new review(req.body)
    await addreview.save()
    res.status(201).json({message:"review added"})
  }catch(error)
  {
    res.status(500).json({error:error.message})
  }
}
export const getaallreview=async(req,res,next)=>{
  let allreviews = await review.find()
    res.status(201).json({message:"reviews gets successfly",allreviews})
}
export const getsinglereview=async(req,res,next)=>{
    let singlereview = await review.findById(req.params.id)
    if(!singlereview)
        {
            res.status(404).json({message:"review not found"})
        }
      res.status(201).json({message:"reviews get successfly",singlereview})
  }
  export const updatereview=async(req,res,next)=>{
    let updatedreview=await review.findByIdAndUpdate(req.params.id,req.body,{new:true})
    if(!updatedreview) 
        {
   return res.json({message:"review not found"}) 
        }
    res.json({message:"review updated successfly",updatedreview})
  }
export const deletereview=async(req,res,next)=>{
    let deletereview=await review.findByIdAndDelete(req.params.id)
    if(!deletereview) 
        {
  return res.json({message:"review not found"}) 
        }
    res.json({message:"review deleted successfly",deletereview})
}     