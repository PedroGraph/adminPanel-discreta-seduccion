import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();
const orderController = new OrderController();
router.get('/', auth, orderController.getOrders);
router.get('/:id', auth, orderController.getOrderById);
router.get('/stats/summary', auth, orderController.getOrderStats);

export default router; 