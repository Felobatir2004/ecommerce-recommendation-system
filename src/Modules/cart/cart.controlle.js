import { Router } from "express";
import { authentication } from "../../middlewares/auth.middleware.js";
import * as cart from './services/cart.service.js'
const router=Router()
router.post('/addtocart',cart.addProductToCart)
router.delete('/deletefromcart/:id',authentication(),cart.removeProductFromCart)
router.delete('/deleteAllinCart',authentication(),cart.clearUserCart)
router.get('/getusercart',authentication(),cart.getUserCart)
router.get('/getallsimilarproducts',authentication(),cart.getSimilarProductsFromCart)
router.patch("/checkout",authentication(),cart.checkout)
export default router