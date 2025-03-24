import { z } from 'zod';

export const createOrderSchema = z.object({
  customerId: z.number().int().positive(),
  shippingAddressId: z.number().int().positive(),
  billingAddressId: z.number().int().positive(),
  shippingMethodId: z.number().int().positive(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })).min(1, 'La orden debe tener al menos un producto'),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
});

export const orderQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive()).default('10'),
  search: z.string().optional(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  customerId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['orderNumber', 'totalAmount', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createReturnSchema = z.object({
  orderId: z.number().int().positive(),
  reason: z.string().min(1, 'La razón es requerida'),
  items: z.array(z.object({
    orderItemId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    reason: z.string().min(1, 'La razón es requerida'),
  })).min(1, 'La devolución debe tener al menos un producto'),
  notes: z.string().optional(),
}); 