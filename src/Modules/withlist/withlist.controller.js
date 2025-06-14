import { Router } from "express";
import * as wishlist from './services/withlist.service.js'
import { authentication } from "../../middlewares/auth.middleware.js";
const router=Router()
<<<<<<< HEAD
router.patch('/addtowithlist',authentication(),wishlist.addtowithlist)
router.delete('/removefromwithlist/:id',authentication(),wishlist.removefromwithlist)
router.get('/getallinwithlist',authentication(),wishlist.getallinwithlist)
export default router

 
=======
router.patch('/addtowithlist',wishlist.addToWishlist)
router.delete('/removefromwithlist/:userId',wishlist.removeFromWishlist)
router.get('/getallinwithlist/:userId',wishlist.getAllInWishlist)
export default router
>>>>>>> bad2a7adb36df5bce35fc5b2ab258d04d5835f1a
