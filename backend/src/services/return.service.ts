import { PrismaClient, ReviewStatus, RefundStatus, Prisma } from '@prisma/client';
import { ReturnFilters, ReturnDTO, ReturnUpdateDTO } from '../types/return.types.js';

const prisma = new PrismaClient();

export class ReturnService {
  async getAllReturns(page = 1, limit = 10, filters?: ReturnFilters) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.ReturnWhereInput = {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.refundStatus && { refundStatus: filters.refundStatus }),
      ...(filters?.customerId && { customerId: filters.customerId }),
      ...(filters?.orderId && { orderId: filters.orderId }),
      ...(filters?.startDate && { createdAt: { gte: filters.startDate } }),
      ...(filters?.endDate && { createdAt: { lte: filters.endDate } }),
      ...(filters?.minAmount && { totalAmount: { gte: filters.minAmount } }),
      ...(filters?.maxAmount && { totalAmount: { lte: filters.maxAmount } }),
      ...(filters?.search && {
        OR: [
          { returnNumber: { contains: filters.search, mode: 'insensitive' as const } },
          { reason: { contains: filters.search, mode: 'insensitive' as const } }
        ]
      })
    };

    const [returns, total] = await Promise.all([
      prisma.return.findMany({
        where,
        skip,
        take: limit,
        orderBy: filters?.sortBy 
          ? { [filters.sortBy]: filters.sortOrder || 'desc' as const }
          : { createdAt: 'desc' as const },
        include: {
          customer: true,
          order: true,
          items: {
            include: {
              product: true,
              orderItem: true
            }
          }
        }
      }),
      prisma.return.count({ where })
    ]);

    return {
      returns,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      hasNextPage: skip + limit < total,
      hasPreviousPage: page > 1
    };
  }

  async getReturnById(id: number) {
    return prisma.return.findUnique({
      where: { id },
      include: {
        customer: true,
        order: true,
        items: {
          include: {
            product: true,
            orderItem: true
          }
        }
      }
    });
  }

  async createReturn(data: ReturnDTO) {
    // Verificar que la orden existe y pertenece al cliente
    const order = await prisma.order.findFirst({
      where: {
        id: data.orderId,
        customerId: data.customerId
      },
      include: {
        items: true
      }
    });

    if (!order) {
      throw new Error('Orden no encontrada o no pertenece al cliente');
    }

    // Generar número de devolución único
    const returnNumber = `RET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Calcular el monto total de la devolución
    let totalAmount = 0;
    const returnItems = [];

    for (const item of data.items) {
      const orderItem = order.items.find(oi => oi.id === item.orderItemId);
      if (!orderItem) {
        throw new Error(`Item de orden ${item.orderItemId} no encontrado`);
      }

      if (item.quantity > orderItem.quantity) {
        throw new Error(`Cantidad a devolver mayor que la comprada para el item ${orderItem.id}`);
      }

      const itemTotal = Number(orderItem.unitPrice) * item.quantity;
      totalAmount += itemTotal;

      returnItems.push({
        orderItemId: item.orderItemId,
        productId: orderItem.productId,
        quantity: item.quantity,
        unitPrice: orderItem.unitPrice,
        totalPrice: itemTotal,
        reason: item.reason
      });
    }

    // Crear la devolución con sus items
    return prisma.return.create({
      data: {
        orderId: data.orderId,
        customerId: data.customerId,
        returnNumber,
        reason: data.reason,
        totalAmount,
        notes: data.notes,
        items: {
          create: returnItems
        }
      },
      include: {
        customer: true,
        order: true,
        items: {
          include: {
            product: true,
            orderItem: true
          }
        }
      }
    });
  }

  async updateReturn(id: number, data: ReturnUpdateDTO) {
    const return_ = await prisma.return.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!return_) {
      throw new Error('Devolución no encontrada');
    }

    // Si se está procesando el reembolso
    if (data.refundStatus === RefundStatus.processed && !return_.refundAmount) {
      data.refundAmount = return_.totalAmount;
    }

    return prisma.return.update({
      where: { id },
      data: {
        status: data.status,
        refundStatus: data.refundStatus,
        refundMethod: data.refundMethod,
        refundAmount: data.refundAmount,
        notes: data.notes
      },
      include: {
        customer: true,
        order: true,
        items: {
          include: {
            product: true,
            orderItem: true
          }
        }
      }
    });
  }

  async getReturnStats(id: number) {
    const return_ = await prisma.return.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!return_) {
      throw new Error('Devolución no encontrada');
    }

    return {
      totalItems: return_.items.length,
      totalAmount: return_.totalAmount,
      refundAmount: return_.refundAmount,
      status: return_.status,
      refundStatus: return_.refundStatus,
      items: return_.items.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        reason: item.reason
      }))
    };
  }
}
