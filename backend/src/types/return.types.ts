import { ReviewStatus, RefundStatus } from '@prisma/client';

export interface ReturnFilters {
  status?: ReviewStatus;
  refundStatus?: RefundStatus;
  customerId?: number;
  orderId?: number;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

export type SortField = 'createdAt' | 'totalAmount' | 'refundAmount';
export type SortOrder = 'asc' | 'desc';

export interface ReturnItemDTO {
  orderItemId: number;
  quantity: number;
  reason?: string;
}

export interface ReturnDTO {
  orderId: number;
  customerId: number;
  reason: string;
  items: ReturnItemDTO[];
  notes?: string;
}

export interface ReturnUpdateDTO {
  status?: ReviewStatus;
  refundStatus?: RefundStatus;
  refundMethod?: string;
  refundAmount?: number;
  notes?: string;
} 