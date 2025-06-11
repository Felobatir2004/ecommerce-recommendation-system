import { Router } from "express";
import { authentication } from "../../middlewares/auth.middleware.js";
import * as cart from './services/cart.service.js'
const router=Router()
router.post('/addtocart/:userId',cart.addProductToCart)
router.delete('/deletefromcart/:id',authentication(),cart.removeProductFromCart)
router.delete('/deleteAllinCart',authentication(),cart.clearUserCart)
router.get('/getusercart/:userId',cart.getUserCart)
router.get('/getallsimilarproducts',authentication(),cart.getSimilarProductsFromCart)
router.patch("/checkout/:userId",cart.checkout)
router.patch('/increaseQuantity/:userId',cart.increaseCartItemQuantity)
router.patch('/decreaseQuantity/:userId',cart.decreaseCartItemQuantity)

export default router