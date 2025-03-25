import { CouponData } from 'prisma/interfaces/schema.js';
import prisma from '../lib/prisma.js';

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
                startDate: couponData.startDate,
                endDate: couponData.endDate,
                status: couponData.status,
                appliesTo: couponData.appliesTo,
                createdById: couponData.createdById
            };

            // Manejo de aplicabilidad a productos o categorías
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
            throw error;
        }
    }

    async validateCoupon(code: string, orderAmount: number) {
        const coupon = await prisma.coupon.findUnique({
            where: { code },
            include: { applicability: true }
        });

        if (!coupon) {
            throw new Error('Cupón no encontrado');
        }

        // Validar estado
        if (coupon.status !== 'active') {
            throw new Error('Cupón no está activo');
        }

        // Validar fechas


        // Validar compra mínima
        if (coupon.minPurchase && orderAmount < Number(coupon.minPurchase)) {
            throw new Error(`La compra mínima debe ser de ${coupon.minPurchase}`);
        }

        // Validar usos máximos
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            throw new Error('Cupón ha alcanzado su límite de usos');
        }

        // Validar fechas
        const now = new Date();
        if (now < coupon.startDate || now > coupon.endDate) {
            throw new Error('Cupón fuera de fecha válida');
        }

        return coupon;
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
        return prisma.coupon.findMany({
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
    }

    async updateCouponStatus(couponId: number, status: 'active' | 'inactive' | 'expired') {
        return prisma.coupon.update({
            where: { id: couponId },
            data: { status }
        });
    }

    private async validateCouponData(couponData: Omit<CouponData, 'id'>) {

        const existingCoupon = await prisma.coupon.findUnique({
            where: { code: couponData.code }
        });

        if (existingCoupon) {
            throw new Error('El código del cupón ya existe');
        }

        if (couponData.endDate <= couponData.startDate) {
            throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }

        if (Number(couponData.value) <= 0) {
            throw new Error('El valor del cupón debe ser mayor a 0');
        }

        if (couponData.maxUses && couponData.maxUses <= 0) {
            throw new Error('El número máximo de usos debe ser mayor a 0');
        }

        if (couponData.appliesTo === 'products' && (!couponData.products || couponData.products.length === 0)) {
            throw new Error('Debe especificar al menos un producto para este tipo de cupón');
        }
        if (couponData.appliesTo === 'categories' && (!couponData.categories || couponData.categories.length === 0)) {
            throw new Error('Debe especificar al menos una categoría para este tipo de cupón');
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

