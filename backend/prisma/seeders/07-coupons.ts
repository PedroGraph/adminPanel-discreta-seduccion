import { CouponAppliesTo, CouponStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCoupons(): Promise<void> {
  const coupons = [
    {
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      minPurchase: 500,
      maxUses: 100,
      usedCount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      status: 'active',
      appliesTo: 'all',
    },
    {
      code: 'SUMMER20',
      type: 'percentage',
      value: 20,
      minPurchase: 1000,
      maxUses: 200,
      usedCount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 días
      status: 'active',
      appliesTo: 'all',
    },
    {
      code: 'FIXED50',
      type: 'fixed',
      value: 50,
      minPurchase: 200,
      maxUses: 50,
      usedCount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días
      status: 'active',
      appliesTo: 'all',
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {
        type: coupon.type as 'percentage' | 'fixed',
        value: coupon.value,
        minPurchase: coupon.minPurchase,
        maxUses: coupon.maxUses,
        usedCount: coupon.usedCount,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        status: coupon.status as CouponStatus,
        appliesTo: coupon.appliesTo as CouponAppliesTo,
      },
      create: {
        code: coupon.code,
        type: coupon.type as 'percentage' | 'fixed',
        value: coupon.value,
        minPurchase: coupon.minPurchase,
        maxUses: coupon.maxUses,
        usedCount: coupon.usedCount,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        status: coupon.status as CouponStatus,
        appliesTo: coupon.appliesTo as CouponAppliesTo,
      },
    });
  }

  console.log('✅ Cupones sembrados exitosamente');
}
