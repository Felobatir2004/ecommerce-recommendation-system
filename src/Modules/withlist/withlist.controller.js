import { Router } from "express";
import * as wishlist from './services/withlist.service.js'
import { authentication } from "../../middlewares/auth.middleware.js";
const router=Router()
router.patch('/addtowithlist',wishlist.addToWishlist)
router.delete('/removefromwithlist/:userId',wishlist.removeFromWishlist)
router.get('/getallinwithlist/:userId',wishlist.getAllInWishlist)
export default router