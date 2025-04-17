import { Request, Response } from "express";
import { ProductService } from "@/services/products.service.js";
import { InventoryService } from "@/services/inventory.service.js";
import { InventoryMovementService } from "@/services/inventoryMovement.service.js";

export class ProductController {
  private productService: ProductService;
  private inventoryService: InventoryService;
  private inventoryMovementService: InventoryMovementService;

  constructor() {
    this.productService = new ProductService();
    this.inventoryService = new InventoryService();
    this.inventoryMovementService = new InventoryMovementService();
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
    let inventoryData;
    try {
      let { product, inventory, user } = req.body;
      const newProduct = await this.productService.createProduct(product, req);
      if(newProduct) {
        inventory.productId = newProduct.id;
        inventoryData = await this.inventoryService.createInventory(inventory, req);
      }
      if(inventoryData && user) {
        inventory.productId = newProduct.id;
        inventory.performedById = user.id;
        await this.inventoryMovementService.createInventoryMovement(inventory, req);
      }
      res.status(201).json({ message: `El producto ${newProduct.name} ha sido creado. Al ser un nuevo producto, se ha creado un inventario para este producto.`});
    } catch (error: any) {
      res.status(404).json({ error: error.message});
    } 
  };

  updateProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = req.body;
      const updatedProduct = await this.productService.updateProduct(Number(id), product, req);
      res.status(200).json(updatedProduct);
    } catch (error: any) {
      res.status(error.status || 404).json({ error: `${error.message}` });
    }
  };

  deleteProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deletedProduct = await this.productService.deleteProduct(Number(id), req);
      res.status(200).json(deletedProduct);
    } catch (error: any) {
      console.log(error)
      res.status(404).json({ error: `${error.message}` });
    }
  };
}
