import { Router } from "express";
import * as wishlist from './services/withlist.service.js'
const router=Router()
router.patch('/addtowithlist',wishlist.addtowithlist)
router.delete('/removefromwithlist/:id',wishlist.removefromwithlist)
router.get('/getallinwithlist',wishlist.getallinwithlist)
export default router