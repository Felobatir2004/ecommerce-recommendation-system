import { Router } from "express";
import * as coupons from './services/discountcoupon.service.js'
const router=Router()
router.post('/addcoupon',coupons.addcoupon)
router.get('/getalldiscountcoupon',coupons.getalldiscoutcoupon)
router.get('/getsinglediscountcoupon/:id',coupons.getsinglediscountcoupon)
router.put('/updatediscountcoupon/:id',coupons.updatediscountcoupon)
router.delete('/deletediscountcoupon/:id',coupons.deletediscountcoupon)
export default router