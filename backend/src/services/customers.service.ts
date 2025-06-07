import { PrismaClient, Status, Prisma } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

export interface CustomerDTO {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  status?: Status;
}

export type SortField = 'name' | 'createdAt' | 'lastLogin';
export type SortOrder = 'asc' | 'desc';

export interface CustomerFilters {
  status?: Status;
  startDate?: Date;
  endDate?: Date;
  lastLoginStart?: Date;
  lastLoginEnd?: Date;
  search?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

export class CustomersService {

  async getAllCustomers(page = 1, limit = 10, filters?: CustomerFilters) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.CustomerWhereInput = {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.startDate && { createdAt: { gte: filters.startDate } }),
      ...(filters?.endDate && { createdAt: { lte: filters.endDate } }),
      ...(filters?.lastLoginStart && { lastLogin: { gte: filters.lastLoginStart } }),
      ...(filters?.lastLoginEnd && { lastLogin: { lte: filters.lastLoginEnd } }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' as const } },
          { email: { contains: filters.search, mode: 'insensitive' as const } }
        ]
      })
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: filters?.sortBy 
          ? { [filters.sortBy]: filters.sortOrder || 'desc' as const }
          : { createdAt: 'desc' as const },
        include: {
          addresses: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.customer.count({ where })
    ]);

    return {
      customers,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      hasNextPage: skip + limit < total,
      hasPreviousPage: page > 1
    };
  }

  async getCustomerById(id: number) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        reviews: true,
      },
    });
  }

  async updateCustomer(id: number, data: CustomerDTO) {
    const { password, ...updateData } = data;
    
    const hashedPassword = password ? await hash(password, 10) : undefined;

    return prisma.customer.update({
      where: { id },
      data: {
        ...updateData,
        ...(hashedPassword && { password: hashedPassword }),
      },
    });
  }

  async toggleCustomerStatus(id: number) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new Error('Cliente no encontrado');

    return prisma.customer.update({
      where: { id },
      data: {
        status: customer.status === Status.active ? Status.inactive : Status.active,
      },
    });
  }

  async resetCustomerPassword(id: number) {
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hash(tempPassword, 10);

    await prisma.customer.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return tempPassword;
  }

  async getCustomerActivityLog(id: number) {
    return prisma.activityLog.findMany({
      where: {
        user: { id },
        entityType: 'CUSTOMER',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getCustomerStats(id: number) {
    const [orders, reviews] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: id },
        select: {
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.review.findMany({
        where: { customerId: id },
        select: {
          rating: true,
          status: true,
        },
      }),
    ]);

    const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return {
      totalOrders: orders.length,
      totalSpent,
      averageRating,
      totalReviews: reviews.length,
      orderStatusDistribution: this.calculateOrderStatusDistribution(orders),
      lastOrderDate: orders[0]?.createdAt,
      lastLoginDate: (await prisma.customer.findUnique({ where: { id } }))?.lastLogin,
    };
  }

  private calculateOrderStatusDistribution(orders: any[]) {
    const distribution: Record<string, number> = {};
    orders.forEach(order => {
      distribution[order.status] = (distribution[order.status] || 0) + 1;
    });
    return distribution;
  }
} 