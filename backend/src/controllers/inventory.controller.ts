import { Request, Response } from "express";
import { InventoryService } from "../services/inventory.service.js";
export class InventoryController {
 
    private inventoryService: InventoryService;
    constructor() {
      this.inventoryService = new InventoryService();
    }

    getAllInventories = async (req: Request, res: Response) => {
      try {
        const inventories = await this.inventoryService.getAllInventories();
        res.status(200).json(inventories);
      } catch (error: any) {
        res.status(error.status).json({ error: `${error.message}` });
      }
    }

    getInventoryById = async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const inventory = await this.inventoryService.getInventoryById(Number(id));
        res.status(200).json(inventory);
      } catch (error: any) {
        res.status(error.status).json({ error: `${error.message}` });
      }
    }

    updateInventory = async (req: Request, res: Response) => { 
      try { 
        const { id } = req.params;
        const inventoryData = req.body;
        const updatedInventory = await this.inventoryService.updateInventory(Number(id), inventoryData, req);
        res.status(200).json(updatedInventory); 
      } catch (error: any) {
        res.status(error.status).json({ error: `${error.message}` });
      }
    }

}