import { Request, Response } from 'express';
import { ProductService } from '../services/products.service.js';
import { setActivityToLog } from '../middleware/log.js';

export class ProductController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
    }

    getAllProducts = async (req: Request, res: Response) => {
        try {
            const products = await this.productService.getAllProducts();
            res.status(200).json(products);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Error al obtener los productos' });
        }
    }   

    getProductById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const product = await this.productService.getProductById(Number(id));
            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el producto' });
        }
    }   

    createProduct = async (req: Request, res: Response) => {
        try {
            const product = req.body;
            const newProduct = await this.productService.createProduct(product);
            await setActivityToLog(req, {action: 'create', entityType: 'product', description: `Producto creado - ${newProduct.name}`});
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(500).json({ error: 'Error al crear el producto' });
        }
    }

    updateProduct = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const product = req.body;
            const updatedProduct = await this.productService.updateProduct(Number(id), product);
            await setActivityToLog(req, {action: 'update', entityType: 'product', description: `Producto actualizado - ${updatedProduct.name}`});
            res.status(200).json(updatedProduct);
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el producto' });
        }
    }

    deleteProduct = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const deletedProduct = await this.productService.deleteProduct(Number(id));
            await setActivityToLog(req, {action: 'delete', entityType: 'product', description: `Producto eliminado - ${deletedProduct.id}`});
            res.status(200).json(deletedProduct);
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar el producto' });
        }
    }
}   
