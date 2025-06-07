import { Request, Response } from 'express';
import { CustomersService, CustomerFilters, SortField, SortOrder } from '../services/customers.service.js';
import { Status } from '@prisma/client';

export class CustomersController {
  private customersService: CustomersService;

  constructor() {
    this.customersService = new CustomersService();
  }

  getAllCustomers = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const filters: CustomerFilters = {
        status: req.query.status as Status,
        search: req.query.search as string,
        sortBy: req.query.sortBy as SortField,
        sortOrder: req.query.sortOrder as SortOrder,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        lastLoginStart: req.query.lastLoginStart ? new Date(req.query.lastLoginStart as string) : undefined,
        lastLoginEnd: req.query.lastLoginEnd ? new Date(req.query.lastLoginEnd as string) : undefined,
      };

      const result = await this.customersService.getAllCustomers(page, limit, filters);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  };

  getCustomerById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await this.customersService.getCustomerById(id);
      
      if (!customer) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      res.status(200).json(customer);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  };

  updateCustomer = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const customer = await this.customersService.updateCustomer(id, updateData);
      res.status(200).json(customer);
    } catch (error: any) {
      res.status(error.status || 400).json({ error: error.message });
    }
  };

  toggleCustomerStatus = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await this.customersService.toggleCustomerStatus(id);
      res.status(200).json(customer);
    } catch (error: any) {
      res.status(error.status || 400).json({ error: error.message });
    }
  };

  resetCustomerPassword = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const tempPassword = await this.customersService.resetCustomerPassword(id);
      res.status(200).json({ message: 'Contraseña reseteada exitosamente', tempPassword });
    } catch (error: any) {
      res.status(error.status || 400).json({ error: error.message });
    }
  };

  getCustomerActivityLog = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const activityLog = await this.customersService.getCustomerActivityLog(id);
      res.status(200).json(activityLog);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  };

  getCustomerStats = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const stats = await this.customersService.getCustomerStats(id);
      res.status(200).json(stats);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message });
    }
  };
} 