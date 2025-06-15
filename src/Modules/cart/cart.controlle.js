import { Router } from "express";
import { authentication } from "../../middlewares/auth.middleware.js";
import * as cart from './services/cart.service.js'
const router=Router()
router.post('/addtocart/:userId',cart.addProductToCart)
router.delete('/deletefromcart/:userId',cart.removeProductFromCart)
router.delete('/deleteAllinCart',authentication(),cart.clearUserCart)
router.get('/getusercart/:userId',cart.getUserCart)
router.get('/getallsimilarproducts/:userId',cart.getSimilarProductsFromCart)
router.patch("/checkout/:userId",cart.checkoutAndCreateOrder)
router.patch('/increaseQuantity/:userId',cart.increaseCartItemQuantity)
router.patch('/decreaseQuantity/:userId',cart.decreaseCartItemQuantity)
router.patch("/makeOrder/:userId",cart.addOrder)
export default router