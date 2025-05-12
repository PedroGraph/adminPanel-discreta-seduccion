import { CouponData } from 'prisma/interfaces/schema.js';
import prisma from '../lib/prisma.js';
import { handlePrismaError } from '../utils/handleErrors.js';

export class CouponService {
    async createNewCoupon(couponData: Omit<CouponData, 'id'>) {
        try {
            await this.validateCouponData(couponData);

            const couponInput: any = {
                code: couponData.code,
                type: couponData.type,
                value: couponData.value,
                minPurchase: couponData.minPurchase,
                maxUses: couponData.maxUses,
                usedCount: couponData.usedCount,
                startDate: new Date(couponData.startDate),
                endDate: new Date(couponData.endDate),
                status: couponData.status,
                appliesTo: couponData.appliesTo,
                createdBy: {
                    connect: { id: couponData.createdById }
                },
                products: couponData.products ? { connect: couponData.products } : { connect: [] },
                categories: couponData.categories ? { connect: couponData.categories } : { connect: [] }
            };

            if (couponData.appliesTo !== 'all') {
                const applicabilityData = this.prepareApplicabilityData(couponData);
                if (applicabilityData.length > 0) {
                    couponInput.applicability = {
                        create: applicabilityData
                    };
                }
            }

            const coupon = await prisma.coupon.create({
                data: couponInput,
                include: {
                    applicability: true
                }
            });
            return coupon;
        } catch (error) {
            throw handlePrismaError(error);
        }
    }

    async validateCoupon(code: string, orderAmount: number) {
        try {
            const coupon = await prisma.coupon.findUnique({
                where: { code },
                include: { applicability: true }
            });

            if (!coupon) {
                throw ({status: 404, message: 'Cupón no encontrado', coupon: false});
            }

            if (coupon.status !== 'active') {
                throw ({status: 400, message: 'Cupón no activo', coupon: false});
            }

            // Validar compra mínima
            if (coupon.minPurchase && orderAmount < Number(coupon.minPurchase)) {
                throw ({status: 400, message: 'Compra no alcanza el mínimo requerido', coupon: false});
            }

            // Validar usos máximos
            if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
                throw ({status: 400, message: 'Cupón no disponible', coupon: false});
            }

            // Validar fechas
            const now = new Date();
            if (now < coupon.startDate || now > coupon.endDate) {
                throw ({status: 400, message: 'Cupón no disponible', coupon: false});
            }

            return {message: "Cupón valido", coupon: true};
        } catch (error) {
            throw handlePrismaError(error);
        }
    }

    async applyCouponToOrder(couponId: number, orderId: number, orderAmount: number) {
        const coupon = await prisma.coupon.findUnique({
            where: { id: couponId },
            include: { applicability: true }
        });

        if (!coupon) {
            throw new Error('Cupón no encontrado');
        }

        // Actualizar contador de usos
        await prisma.coupon.update({
            where: { id: couponId },
            data: {
                usedCount: { increment: 1 }
            }
        });

        // Calcular descuento
        let discountAmount = 0;
        if (coupon.type === 'percentage') {
            discountAmount = orderAmount * (Number(coupon.value) / 100);
        } else {
            discountAmount = Number(coupon.value);
        }

        return discountAmount;
    }

    async getActiveCoupons() {
        const now = new Date();
        const coupons = await prisma.coupon.findMany({
            where: {
                status: 'active',
                startDate: { lte: now },
                endDate: { gte: now },
                OR: [
                    { maxUses: null },
                    { usedCount: { lt: prisma.coupon.fields.maxUses } }
                ]
            },
            include: {
                applicability: true
            }
        });
        return coupons.length > 0 ? { message: "Cupones activos", status: true, coupons } : { message: "No hay cupones activos", status: false };
    }

    async updateCouponStatus(couponId: number, status: 'active' | 'inactive' | 'expired') {
        if(status !== 'active' && status !== 'inactive' && status !== 'expired') {
            throw ({message: 'Status inválido', status: false});
        }

        const coupon = await prisma.coupon.update({
            where: { id: couponId },
            data: { status }
        });

        return { message: "Cupón actualizado", status: true, coupon };
    }

    private async validateCouponData(couponData: Omit<CouponData, 'id'>) {
        try {
            const existingCoupon = await prisma.coupon.findUnique({
                where: { code: couponData.code }
            });

            if (existingCoupon) {
                throw ({status: 400, message: 'El código del cupón ya existe'});
            }

            if (couponData.endDate <= couponData.startDate) {
                throw ({status: 400, message: 'La fecha de fin debe ser posterior a la fecha de inicio'});
            }

            if (Number(couponData.value) <= 0) {
                throw ({status: 400, message: 'El valor del cupón debe ser mayor a 0'});
            }

            if (couponData.maxUses && couponData.maxUses <= 0) {
                throw ({status: 400, message: 'El número máximo de usos debe ser mayor a 0'});
            }

            if (couponData.appliesTo === 'products' && (!couponData.products || couponData.products?.length === 0)) {
                throw ({status: 400, message: 'Debe especificar al menos un producto para este tipo de cupón'});
            }
            if (couponData.appliesTo === 'categories' && (!couponData.categories || couponData.categories?.length === 0)) {
                throw ({status: 400, message: 'Debe especificar al menos una categoría para este tipo de cupón'});
            }
        } catch (error) {
            throw handlePrismaError(error);
        }
    }

    private prepareApplicabilityData(couponData: Omit<CouponData, 'id'>) {
        const applicabilityData = [];

        if (couponData.appliesTo === 'products' && Array.isArray(couponData.products)) {
            applicabilityData.push(...couponData.products.map(product => ({
                entityType: 'product',
                entityId: product.id
            })));
        }

            if (couponData.appliesTo === 'categories' && Array.isArray(couponData.categories)) {
            applicabilityData.push(...couponData.categories.map(category => ({
                entityType: 'category',
                entityId: category.id
            })));
        }

        return applicabilityData;
    }
}

