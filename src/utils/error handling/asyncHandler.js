export const asyncHandler = (fn)=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(error=>{
            if(Object.keys(error) === 0){
                return next(new Error(error.message,{ cause: 500 }))
            }
            return next(error)
        })
    }

}

export const globalErrorHandler = (error,req,res,next)=>{
    const status = error.cause || 500
    return res 
        .status(status)
        .json({success:false , message:error.message, stack: error.stack})
}

export const notFoundHandler = (req,res,next)=>{
    return res.status(404).json({success: false,message:"not found"})
}