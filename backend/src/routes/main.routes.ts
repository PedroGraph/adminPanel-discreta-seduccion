import { Router } from 'express';
import productsRoutes from './products.routes.js';
import authRoutes from './auth.routes.js';
import couponRoutes from './coupon.routes.js';

const router = Router();

router.use('/products', productsRoutes);
router.use('/auth', authRoutes);
router.use('/coupons', couponRoutes);
export default router;

