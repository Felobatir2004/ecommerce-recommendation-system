import { Router } from "express";
import { allowTo, authentication } from "../../middlewares/auth.middleware.js";
import * as cart from './services/cart.service.js'
const router=Router()
router.post('/addtocart',authentication(),cart.addProductToCart)
router.delete('/deletefromcart/:id',authentication(),cart.removeProductFromCart)
router.delete('/deleteAllinCart',authentication(),cart.clearUserCart)
router.get('/getusercart',authentication(),cart.getUserCart)
export default router