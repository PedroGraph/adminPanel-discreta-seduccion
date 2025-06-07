import { Request, Response } from 'express';
import { ReturnService } from '../services/return.service.js';
import { ReviewStatus, RefundStatus } from '@prisma/client';

export class ReturnController {
  private returnService: ReturnService;

  constructor() {
    this.returnService = new ReturnService();
  }

  getAllReturns = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const filters = {
        status: req.query.status as ReviewStatus,
        refundStatus: req.query.refundStatus as RefundStatus,
        customerId: req.query.customerId ? parseInt(req.query.customerId as string) : undefined,
        orderId: req.query.orderId ? parseInt(req.query.orderId as string) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
        maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      const result = await this.returnService.getAllReturns(page, limit, filters);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  };

  getReturnById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const return_ = await this.returnService.getReturnById(id);
      
      if (!return_) {
        return res.status(404).json({ error: 'Devolución no encontrada' });
      }

      res.status(200).json(return_);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  };

  createReturn = async (req: Request, res: Response) => {
    try {
      const return_ = await this.returnService.createReturn(req.body);
      res.status(201).json(return_);
    } catch (error: any) {
      res.status(error.status || 400).json({ error: error.message });
    }
  };

  updateReturn = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const return_ = await this.returnService.updateReturn(id, req.body);
      res.status(200).json(return_);
    } catch (error: any) {
      res.status(error.status || 400).json({ error: error.message });
    }
  };

  getReturnStats = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const stats = await this.returnService.getReturnStats(id);
      res.status(200).json(stats);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  };
} 