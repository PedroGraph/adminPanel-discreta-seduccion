import { Router } from 'express';
import { CustomersController } from '../controllers/customers.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();
const customersController = new CustomersController();
router.use(auth);

router.get('/', customersController.getAllCustomers);
router.get('/:id', customersController.getCustomerById);
router.put('/:id', customersController.updateCustomer);
router.patch('/:id/toggle-status', customersController.toggleCustomerStatus);
router.post('/:id/reset-password', customersController.resetCustomerPassword);
router.get('/:id/activity-log', customersController.getCustomerActivityLog);
router.get('/:id/stats', customersController.getCustomerStats);

export default router; 