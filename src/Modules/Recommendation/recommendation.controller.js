import { Router } from "express";
import * as recommendation from './services/recommendation.service.js'
const router=Router()

router.get('/collaborative/:user_id', recommendation.getCollaborativeRecommendations);
export default router