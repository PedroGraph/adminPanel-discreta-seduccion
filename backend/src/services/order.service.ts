import { PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';
import { OrderFilters, OrderControllerFilters } from '../types/order.types.js';

export class OrderService {
  private prisma: PrismaClient;
  private defaultInclude = {
    customer: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    items: {
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    },
    shippingAddress: true,
    billingAddress: true,
    coupon: true,
  };

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getOrders(controllerFilters: OrderControllerFilters) {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      customerId,
      orderBy = 'createdAt',
      orderDirection = 'desc',
    } = controllerFilters;

    const filters: OrderFilters = {
      page,
      limit,
      status: status as OrderStatus,
      paymentStatus: paymentStatus as PaymentStatus,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      customerId,
      orderBy,
      orderDirection,
    };

    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
    if (filters.customerId) where.customerId = filters.customerId;

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.totalAmount = {};
      if (filters.minAmount !== undefined) where.totalAmount.gte = filters.minAmount;
      if (filters.maxAmount !== undefined) where.totalAmount.lte = filters.maxAmount;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: this.defaultInclude,
        orderBy: { [orderBy]: orderDirection },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrderById(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        ...this.defaultInclude,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
              },
            },
          },
        },
        shipments: true,
        returns: {
          include: {
            items: true,
          },
        },
        reviews: true,
      },
    });
  }

  async getOrderStats() {
    const [totalOrders, totalRevenue, ordersByStatus, ordersByPaymentStatus, recentOrders] = 
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.aggregate({
          _sum: { totalAmount: true },
        }),
        this.prisma.order.groupBy({
          by: ['status'],
          _count: true,
        }),
        this.prisma.order.groupBy({
          by: ['paymentStatus'],
          _count: true,
        }),
        this.prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: { name: true },
            },
          },
        }),
      ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      ordersByStatus,
      ordersByPaymentStatus,
      recentOrders,
    };
  }
} 