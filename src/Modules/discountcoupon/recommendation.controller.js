import { Router } from "express";
import * as coupons from './services/recommendation.service.js'
const router=Router()

router.get('/collaborative/:user_id', coupons.getCollaborativeRecommendations);
export default router