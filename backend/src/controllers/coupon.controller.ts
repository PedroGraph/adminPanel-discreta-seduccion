import { Request, Response } from 'express';
import { CouponService } from '../services/coupon.service.js';
import { setActivityToLog } from '../middleware/log.js';

const couponService = new CouponService();

export class CouponController {

    async createCoupon(req: Request, res: Response) {
        try {
            const couponData = req.body;
            const newCoupon = await couponService.createNewCoupon(couponData);
            await setActivityToLog(req, {action: 'create', entityType: 'coupon', description: `Cupón creado - ${newCoupon.code}. Descuento: ${newCoupon.discountAmount}%. Estado: ${newCoupon.status} - ${newCoupon.endDate}`});
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

            await setActivityToLog(req, {action: 'update', entityType: 'coupon', description: `Cupón actualizado - ${updatedCoupon.code}. Estado: ${updatedCoupon.status} - ${updatedCoupon.endDate}`});
            res.json(updatedCoupon);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

