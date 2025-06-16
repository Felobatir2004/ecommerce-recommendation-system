import { Router } from "express";
import * as wishlist from './services/withlist.service.js'
const router=Router()

router.patch('/addtowishlist',wishlist.addToWishlist)
router.delete('/removefromwishlist/:userId',wishlist.removeFromWishlist)
router.get('/getallinwishlist/:userId',wishlist.getAllInWishlist)

export default router
