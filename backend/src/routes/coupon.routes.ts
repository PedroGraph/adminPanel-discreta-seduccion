import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();
const couponController = new CouponController();

router.post('/validate', couponController.validateCoupon);
router.post('/', auth, couponController.createCoupon);
router.get('/active', auth, couponController.getActiveCoupons);
router.patch('/:couponId/status', auth, couponController.updateCouponStatus);

export default router;
