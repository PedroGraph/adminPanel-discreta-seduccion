import { Request, Response } from "express";
import { ProductService } from "../services/products.service.js";
import { setActivityToLog } from "../middleware/log.js";
import { set } from "zod";

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  getAllProducts = async (req: Request, res: Response) => {
    try {
      const products = await this.productService.getAllProducts();
      res.status(200).json(products);
    } catch (error: any) {
      res.status(error.status).json({ error: `${error.message}` });
    }
  };

  getProductById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(Number(id));
      res.status(200).json(product);
    } catch (error: any) {
      res.status(error.status).json({ error: `${error.message}` });
    }
  };

  createProduct = async (req: Request, res: Response) => {
    let success = false;
    let newProduct = null;
    let errorMessage = null;
  
    try {
      const product = req.body;
      newProduct = await this.productService.createProduct(product);
      success = true;
      res.status(201).json(newProduct);
    } catch (error: any) {
      errorMessage = error;
      res.status(500).json({ error: errorMessage });
    } finally {
      await setActivityToLog(req, {
        action: "create",
        entityType: "product",
        description: success 
          ? `Producto creado - ${newProduct?.name}`
          : `Error al crear el producto | ${errorMessage.message}`,
      });
    }
  };

  updateProduct = async (req: Request, res: Response) => {

    let success = false;
    let errorMessage = null;
    let productUpdated = null;
    let reason = null;

    try {
      const { id } = req.params;
      const product = req.body;
      const updatedProduct = await this.productService.updateProduct(
        Number(id),
        product
      );
      success = true;
      productUpdated = updatedProduct;
      reason = product?.reason;
      res.status(200).json(updatedProduct);

    } catch (error: any) {
      errorMessage = error;
      res.status(error.status).json({ error: `${error.message}` });

    }finally {
      setActivityToLog(req, {
        action: "update",
        entityType: "product",
        entityId: Number(req.params.id), 
        description: success 
          ? `Producto actualizado - ${productUpdated?.name} ${reason ? '| Motivo: ' + reason : ''}`
          : `Error al actualizar el producto con id: ${req.params.id} | ${errorMessage.message}`,
      })

    }
  };

  deleteProduct = async (req: Request, res: Response) => {

    let success = false;
    let errorMessage = null;
    let productDeleted = null;

    try {
      const { id } = req.params;
      const deletedProduct = await this.productService.deleteProduct(
        Number(id)
      );
      success = true;
      productDeleted = deletedProduct;

      res.status(200).json(deletedProduct);
    } catch (error: any) {
      errorMessage = error;
      res.status(error.status).json({ error: `${error.message}` });
    }finally{
      setActivityToLog(req, {
        action: "delete",
        entityType: "product",
        entityId: Number(req.params.id), 
        description: success 
          ? `Producto eliminado - ${productDeleted?.id}`
          : `Error al eliminar el producto con id: ${req.params.id} | ${errorMessage.message}`,
      })
    }
  };
}
