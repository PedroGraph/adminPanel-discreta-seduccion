import { Request, Response } from 'express';
import { OrderService } from '../services/order.service.js';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  getOrders = async (req: Request, res: Response) => {
    try {
      const filters = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        status: req.query.status ? req.query.status as string : undefined,
        paymentStatus: req.query.paymentStatus ? req.query.paymentStatus as string : undefined,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
        maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
        customerId: req.query.customerId ? Number(req.query.customerId) : undefined,
        orderBy: req.query.orderBy as string,
        orderDirection: req.query.orderDirection as 'asc' | 'desc',
      };

      const result = await this.orderService.getOrders(filters);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  };

  getOrderById = async (req: Request, res: Response) => {
    try {
      const order = await this.orderService.getOrderById(Number(req.params.id));
      
      if (!order) {
        return res.status(404).json({ error: 'Orden no encontrada' });
      }

      res.status(200).json(order);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  };

  getOrderStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.orderService.getOrderStats();
      res.status(200).json(stats);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  };
} 