import { Router } from 'express';
import { ProductController } from '../controllers/products.controller.js';
import { auth } from '../middleware/auth.js';
import { createProductValidation, updateProductValidation } from '../validations/product.schema.js';

const router = Router();
const productController = new ProductController();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', auth, createProductValidation, productController.createProduct);
router.put('/:id', auth, updateProductValidation, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

export default router;

