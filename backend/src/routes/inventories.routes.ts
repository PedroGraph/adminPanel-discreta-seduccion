import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller.js';
import { InventoryMovementController } from '@/controllers/inventoryMovement.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();
const inventoryController = new InventoryController();
const inventoryMovementController = new InventoryMovementController();


router.get('/inventory/all', auth, inventoryController.getAllInventories);
router.get('/inventory/:id', auth, inventoryController.getInventoryById);
router.put('/inventory/:id', auth, inventoryController.updateInventory);

router.get('/inventory-movement/all', auth, inventoryMovementController.getAllInventories);
router.get('/inventory-movement/:id', auth, inventoryMovementController.getInventoryMovements);
router.put('/inventory-movement/:id', auth, inventoryMovementController.updateInventory);

export default router;
