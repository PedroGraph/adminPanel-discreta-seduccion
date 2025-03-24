import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive('El valor debe ser positivo'),
  minPurchaseAmount: z.number().positive('El monto mínimo de compra debe ser positivo').optional(),
  maxDiscountAmount: z.number().positive('El monto máximo de descuento debe ser positivo').optional(),
  startsAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  usageLimit: z.number().int().positive().optional(),
  usageLimitPerUser: z.number().int().positive().optional(),
  status: z.enum(['active', 'inactive', 'expired']).default('active'),
  appliesTo: z.enum(['all', 'categories', 'products']).default('all'),
  applicableIds: z.array(z.number().int().positive()).optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export const couponQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive()).default('10'),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'expired']).optional(),
  type: z.enum(['percentage', 'fixed']).optional(),
  sortBy: z.enum(['code', 'value', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}); 