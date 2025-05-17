import { Router } from "express";
const router= Router()
import * as reviews from './services/review.service.js'
router.post('/addreview',reviews.addreview)
router.get('/getallreview',reviews.getaallreview)
router.get('/getsinglereview/:id',reviews.getsinglereview)
router.put('/updatedreview/:id',reviews.updatereview)
router.delete('/deletereview/:id',reviews.deletereview)
export default router