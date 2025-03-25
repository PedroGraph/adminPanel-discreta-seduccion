import { Request, Response } from 'express';
import { CouponService } from '../services/coupon.service.js';

const couponService = new CouponService();

export class CouponController {
    async createCoupon(req: Request, res: Response) {
        try {
            const couponData = req.body;
            const newCoupon = await couponService.createNewCoupon(couponData);
            res.status(201).json(newCoupon);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async validateCoupon(req: Request, res: Response) {
        try {
            const { code, orderAmount } = req.body;
            const discountAmount = await couponService.validateCoupon(code, orderAmount);
            res.json({ discountAmount });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getActiveCoupons(req: Request, res: Response) {
        try {
            const coupons = await couponService.getActiveCoupons();
            res.json(coupons);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateCouponStatus(req: Request, res: Response) {
        try {
            const { couponId } = req.params;
            const { status } = req.body;
            
            if(status !== 'active' && status !== 'inactive' && status !== 'expired') {
                return res.status(400).json({ error: 'Status inválido' });
            }

            const updatedCoupon = await couponService.updateCouponStatus(
                Number(couponId),
                status
            );
            res.json(updatedCoupon);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

