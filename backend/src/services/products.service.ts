import prisma from '../lib/prisma.js';
import { CreateProductData } from '../interfaces/product.interface.js';

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

      if (!productData.sku) throw new Error('El campo SKU es obligatorio');
      if (!productData.name) throw new Error('El campo nombre es obligatorio');
      if (productData.price == null) throw new Error('El campo precio es obligatorio');
      if (productData.costPrice == null) throw new Error('El campo precio de costo es obligatorio');
      if (!productData.slug) throw new Error('El campo slug es obligatorio');
      if (!productData.status) throw new Error('El campo estado es obligatorio');

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
    } catch (error: any) {
      console.error('Error al crear el producto:', error);
      throw error;
    }
  }

  async updateProduct(id: number, productData: Partial<CreateProductData> & { categoryId?: number }) {
    try {

      if(!id) throw new Error('El campo ID es obligatorio');
     
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

      if (!updatedProduct) {
        throw new Error(`Producto con ID ${id} no encontrado`);
      }
      
      return updatedProduct;
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      throw error;
    }
  }

  async deleteProduct(id: number) {
    try {
      if (!id) throw new Error('El campo ID es obligatorio');

      const product = await prisma.product.findUnique({
        where: { id },
      });

      console.log(product);

      if (!product) {
        throw new Error(`Producto con ID ${id} no encontrado`);
      }

      const attributesExist = prisma.productAttribute ? await prisma.productAttribute.findMany({
        where: { productId: id }
      }) : [];

      const imagesExist = prisma.productImage ? await prisma.productImage.findMany({
        where: { productId: id }
      }) : [];

      if (attributesExist.length > 0) {
        await prisma.productAttribute.deleteMany({
          where: { productId: id }
        });
      }

      if (imagesExist.length > 0) {
        await prisma.productImage.deleteMany({
          where: { productId: id }
        });
      }

      const deletedProduct = await prisma.product.delete({
        where: { id },
      });

      return { message: "Producto eliminado exitosamente", id };
      
    } catch (error: any) {
      console.error('Error al eliminar el producto:', error);
      throw new Error(`Error al eliminar el producto con ID ${id}: ${error.message}`);
    }
  }

  async getProductById(id: number) {
    try {
      if(!id) throw new Error('El campo ID es obligatorio');

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
    } catch (error: any) {
      console.error(`Error al obtener el producto con ID ${id}:`, error);
      throw error;
    }
  }
}