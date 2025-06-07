import { Router } from 'express';
import { ReturnController } from '../controllers/return.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();
const returnController = new ReturnController();

// Rutas protegidas que requieren autenticación
router.use(authenticateToken);

// Obtener todas las devoluciones con filtros
router.get('/', returnController.getAllReturns);

// Obtener una devolución por ID
router.get('/:id', returnController.getReturnById);

// Crear una nueva devolución
router.post('/', returnController.createReturn);

// Actualizar una devolución
router.put('/:id', returnController.updateReturn);

// Obtener estadísticas de una devolución
router.get('/:id/stats', returnController.getReturnStats);

export default router; 