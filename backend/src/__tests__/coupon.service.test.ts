import { CouponService } from '../services/coupon.service.js';
import { CouponData } from '../../prisma/interfaces/schema.js';
import prisma from '../lib/prisma.js';

jest.mock('../lib/prisma.js', () => ({
  coupon: {
    create: jest.fn().mockImplementation(() => ({
      mockResolvedValueOnce: jest.fn()
    })),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn()
  }
}));

const mockCouponData: CouponData = {
  code: 'TESTCOUPON',
  type: 'percentage',
  value: 10,
  status: 'active',
  products: { 
    connect: [{ id: 1 }] 
  },
  appliesTo: 'products',
  minPurchase: 50,
  maxUses: 100,
  usedCount: 0,
  startDate: new Date('2025-03-21'),
  endDate: new Date('2025-03-29'),
  createdById: 1,
};

const couponService = new CouponService();

describe('CouponService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNewCoupon', () => {
    it('debería crear un nuevo cupón', async () => {
      (prisma.coupon.create as jest.Mock).mockResolvedValueOnce(mockCouponData);

      const result = await couponService.createNewCoupon(mockCouponData);

      expect(prisma.coupon.create).toHaveBeenCalledWith({
        data: expect.objectContaining(mockCouponData),
        include: { applicability: true }
      });
      expect(result).toEqual(mockCouponData);
    });
  });

  describe('validateCoupon', () => {
    it('debería validar un cupón activo', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce(mockCouponData);

      const result = await couponService.validateCoupon('TESTCOUPON', 100);

      expect(result).toEqual(mockCouponData);
    });

    it('debería lanzar error si el cupón no existe', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(couponService.validateCoupon('INVALID', 100))
        .rejects
        .toThrow('Cupón no encontrado');
    });

    it('debería lanzar error si el cupón está inactivo', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockCouponData,
        status: 'inactive'
      });

      await expect(couponService.validateCoupon('TESTCOUPON', 100))
        .rejects
        .toThrow('Cupón no está activo');
    });

    it('debería lanzar error si la compra es menor al mínimo requerido', async () => {
      await expect(couponService.validateCoupon('TESTCOUPON', 30))
        .rejects
        .toThrow('La compra mínima debe ser de 50');
    });
  });

  describe('applyCouponToOrder', () => {
    it('debería aplicar un cupón porcentual correctamente', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce(mockCouponData);
      (prisma.coupon.update as jest.Mock).mockResolvedValueOnce({
        ...mockCouponData,
        usedCount: 1
      });

      const result = await couponService.applyCouponToOrder(1, 1, 150);

      expect(result).toBe(15); // 10% de 150
      expect(prisma.coupon.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          usedCount: { increment: 1 }
        }
      });
    });

    it('debería aplicar un cupón de valor fijo correctamente', async () => {
      const fixedCoupon = {
        ...mockCouponData,
        type: 'fixed',
        value: 10
      };

      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce(fixedCoupon);
      (prisma.coupon.update as jest.Mock).mockResolvedValueOnce({
        ...fixedCoupon,
        usedCount: 1
      });

      const result = await couponService.applyCouponToOrder(1, 1, 150);

      expect(result).toBe(10);
    });
  });

  describe('getActiveCoupons', () => {
    it('debería obtener cupones activos', async () => {
      (prisma.coupon.findMany as jest.Mock).mockResolvedValueOnce([mockCouponData]);

      const result = await couponService.getActiveCoupons();

      expect(result).toEqual([mockCouponData]);
      expect(prisma.coupon.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: 'active'
        }),
        include: {
          applicability: true
        }
      });
    });

    it('debería retornar un array vacío si no hay cupones activos', async () => {
      (prisma.coupon.findMany as jest.Mock).mockResolvedValueOnce([]);

      const result = await couponService.getActiveCoupons();

      expect(result).toEqual([]);
    });
  });

  describe('updateCouponStatus', () => {
    it('debería actualizar el estado de un cupón', async () => {
      (prisma.coupon.update as jest.Mock).mockResolvedValueOnce({ ...mockCouponData, status: 'inactive' });

      const result = await couponService.updateCouponStatus(1, 'inactive');

      expect(prisma.coupon.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'inactive' }
      });
      expect(result.status).toBe('inactive');
    });
  });
}); 