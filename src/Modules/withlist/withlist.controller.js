import { Router } from "express";
import * as wishlist from './services/withlist.service.js'
import { authentication } from "../../middlewares/auth.middleware.js";
const router=Router()
router.patch('/addtowithlist',wishlist.addtowithlist)
router.delete('/removefromwithlist/:id',authentication(),wishlist.removefromwithlist)
router.get('/getallinwithlist',authentication(),wishlist.getallinwithlist)
export default router