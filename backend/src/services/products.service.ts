import { CreateProductData } from '../interfaces/product.interface.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class ProductService {
    
  async getAllProducts() {
    try {
      const products = await prisma.product.findMany({
        include: {
          attributes: true,
          category: true,
          images: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      });

      return products;
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      throw error;
    }
  }

  async createProduct(productData: Omit<CreateProductData, 'categoryId'> & { categoryId?: number }) {
    try {

      const productInput: any = {
        sku: productData.sku,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        costPrice: productData.costPrice,
        slug: productData.slug,
        status: productData.status,
        ...(productData.attributes && { attributes: productData.attributes }),
        ...(productData.images && { images: productData.images }),
        ...(productData.createdById && { 
          createdBy: { connect: { id: productData.createdById } } 
        })
      };
  
      if (productData.categoryId) 
        productInput.category = { connect: { id: productData.categoryId } };
      else if (productData.category) 
        productInput.category = productData.category;
      
      const newProduct = await prisma.product.create({
        data: productInput,
        include: {
          attributes: true,
          category: true,
          images: true
        }
      });
      
      return newProduct;
    } catch (error) {
      console.error('Error al crear el producto:', error);
      throw error;
    }
  }

  async updateProduct(id: number, productData: Partial<CreateProductData> & { categoryId?: number }) {
    try {
     
      const updateInput: any = {
        sku: productData.sku,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        costPrice: productData.costPrice,
        slug: productData.slug,
        status: productData.status,
      };
  
      
      Object.keys(updateInput).forEach(key => {
        if (updateInput[key] === undefined) {
          delete updateInput[key];
        }
      });
  
    
      if (productData.attributes) {
        // Primero eliminar los atributos actuales
        await prisma.productAttribute.deleteMany({
          where: { productId: id }
        });
        
   
        updateInput.attributes = productData.attributes;
      }
  
      if (productData.images) {
        await prisma.productImage.deleteMany({
          where: { productId: id }
        });
        
        updateInput.images = productData.images;
      }
  
      if (productData.categoryId) {
        updateInput.category = { connect: { id: productData.categoryId } };
      } else if (productData.category) {
        updateInput.category = productData.category;
      }
  
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: updateInput,
        include: {
          attributes: true,
          category: true,
          images: true
        }
      });
      
      return updatedProduct;
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      throw error;
    }
  }

  async deleteProduct(id: number) {
    try {

      await prisma.productAttribute.deleteMany({
        where: {
          productId: id
        }
      });

      await prisma.productImage.deleteMany({
        where: {
          productId: id
        }
      });
        
      await prisma.product.delete({
        where: { id },
      });
      
      return "Producto eliminado exitosamente";
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      throw error;
    }
  }

  async getProductById(id: number) {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          attributes: true,
          category: true,
          images: true
        }
      });
      
      if (!product) {
        throw new Error(`Producto con ID ${id} no encontrado`);
      }
      
      return product;
    } catch (error) {
      console.error(`Error al obtener el producto con ID ${id}:`, error);
      throw error;
    }
  }
}