import { Request, Response } from "express";
import { InventoryMovementService } from "../services/inventoryMovement.service.js";
export class InventoryMovementController {
 
    private inventoryMovementService: InventoryMovementService;
    constructor() {
      this.inventoryMovementService = new InventoryMovementService();
    }

    getAllInventories = async (req: Request, res: Response) => {
      try {
        const inventories = await this.inventoryMovementService.getAllInventoryMovements();
        res.status(200).json(inventories);
      } catch (error: any) {
        res.status(error.status).json({ error: `${error.message}` });
      }
    }

    getInventoryMovements = async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const inventory = await this.inventoryMovementService.searchInventoryMovementByAnyField("id", String(Number(id)));
        res.status(200).json(inventory);
      } catch (error: any) {
        res.status(error.status || 404).json({ error: `${error.message}` });
      }
    }

    updateInventory = async (req: Request, res: Response) => { 
      try { 
        const { id } = req.params;
        const inventoryData = req.body;
        const updatedInventory = await this.inventoryMovementService.updateInventoryMovement(Number(id), inventoryData, req);
        res.status(200).json(updatedInventory); 
      } catch (error: any) {
        res.status(error.status || 404).json({ error: `${error.message}` });
      }
    }

}