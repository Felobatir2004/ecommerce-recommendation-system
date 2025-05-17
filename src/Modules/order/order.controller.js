import { Router } from "express";
import { allowTo, authentication } from "../../middlewares/auth.middleware.js";
import * as order from './services/order.service.js';
const router = Router();
router.post('/addorder', authentication(), order.addOrder);
router.get('/getallorders', authentication(), order.getAllOrders);
router.get('/getorder/:id', authentication(), order.getOrder);
router.put('/updateorder/:id', authentication(), order.updateOrder);
router.delete('/deleteorder/:id', authentication(), order.deleteOrder);
router.patch('/markpaid/:id', authentication(), order.markAsPaid);
router.patch('/markdelivered/:id', authentication(), order.markAsDelivered);

export default router;
