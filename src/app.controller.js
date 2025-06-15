import connectDB from "./DB/connection.js"
import authRouter from "./Modules/Auth/auth.controller.js"
import userRouter from "./Modules/User/user.controller.js"
import { globalErrorHandler, notFoundHandler } from "./utils/error handling/asyncHandler.js"
import morgan from "morgan"
import cors from "cors"
import deleteExpiredOTPs from "./utils/cronJobs/cronJobs.js";
import categorycontroller from './Modules/category/category.controller.js'
import productcontroller from './Modules/product/prouduct.controller.js'
import reviewcontroller from './Modules/review/review.controller.js'
import recommendationController from './Modules/Recommendation/recommendation.controller.js'
import withlistcontroller from './Modules/withlist/withlist.controller.js'
import cartcontroller from './Modules/cart/cart.controlle.js'
import ordercontroller from './Modules/cart/cart.controlle.js'



const bootstrap = async (app, express)=>{
    await connectDB()
    app.use(cors())

    app.use(morgan("dev"));
    deleteExpiredOTPs();
    app.use(express.json());
    app.get("/",(req,res)=> res.send("Hello world"))
    app.use("/auth",authRouter)
    app.use("/user",userRouter)
    app.use('/category',categorycontroller)
    app.use('/product',productcontroller)
    app.use('/review',reviewcontroller)
    app.use('/recommendation',recommendationController)
    app.use('/withlist',withlistcontroller)
    app.use('/cart',cartcontroller)
    app.use('/order',ordercontroller)
    app.all("*",notFoundHandler)
    app.use(globalErrorHandler)
}

export default bootstrap