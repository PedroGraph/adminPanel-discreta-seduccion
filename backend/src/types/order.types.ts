import { OrderStatus, PaymentStatus } from '@prisma/client';

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  customerId?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface OrderControllerFilters {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  customerId?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: {
    status: OrderStatus;
    _count: number;
  }[];
  ordersByPaymentStatus: {
    paymentStatus: PaymentStatus;
    _count: number;
  }[];
  recentOrders: {
    id: number;
    orderNumber: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: Date;
    customer: {
      name: string;
    };
  }[];
} 