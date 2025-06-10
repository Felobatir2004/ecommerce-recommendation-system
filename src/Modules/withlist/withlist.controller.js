import { Router } from "express";
import * as wishlist from './services/withlist.service.js'
import { authentication } from "../../middlewares/auth.middleware.js";
const router=Router()
router.patch('/addtowithlist',wishlist.addToWishlist)
router.delete('/removefromwithlist/:id',wishlist.removeFromWishlist)
router.get('/getallinwithlist',wishlist.getAllInWishlist)
export default router