import { Router } from 'express';
import productsRoutes from './products.routes.js';
import authRoutes from './auth.routes.js';
import couponRoutes from './coupon.routes.js';
import Inventories from './inventories.routes.js';
import emailTemplates from './emailTemplates.routes.js';
import customersRoutes from './customers.routes.js';

const router = Router();

router.use('/products', productsRoutes);
router.use('/auth', authRoutes);
router.use('/coupons', couponRoutes);
router.use('/inventories', Inventories);
router.use('/email-templates', emailTemplates);
router.use('/customers', customersRoutes);

export default router;

