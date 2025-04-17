import prisma from "../lib/prisma.js";
import { CreateProductData } from "../interfaces/product.interface.js";
import { setActivityToLog } from "@/middleware/log.js";
import { Request } from "express";

export class ProductService {
  async getAllProducts() {
    try {
      const products = await prisma.product.findMany({
        include: {
          attributes: true,
          category: true,
          images: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });
      if (!products)
        throw { status: 404, message: "No se encontraron productos" };
      return products;
    } catch (error) {
      throw error;
    }
  }

  async createProduct(productData: Omit<CreateProductData, "categoryId"> & { categoryId?: number }, req: Request) {

    let information: object = {
      status: 0,
      message: ``,
    };

    try {

      const validationError = await productValidations(productData, 'create');
      if (validationError) throw validationError;

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
          createdBy: { connect: { id: productData.createdById } },
        }),
        ...(productData.categoryId && { category: { connect: { id: productData.categoryId } } }),
        ...(productData.category && { category: productData.category }),
      };

      const newProduct = await prisma.product.create({
        data: productInput,
        include: {
          attributes: true,
          category: true,
          images: true,
        },
      });

      information = { status: 200, message: `Producto ${newProduct.name} creado exitosamente` };
      return newProduct;
    } catch (error: any) {
      information = { status: 400, message: `No se pudo crear el producto ${productData.name}` };
      throw error;
    } finally {
      setActivityToLog(req, {
        action: "create",
        entityType: "product",
        description: (information as { message: string }).message,
      });
    }
  }

  async updateProduct(id: number, productData: Partial<CreateProductData> & { categoryId?: number }, req: Request) {

    if (!id) throw({ status: 400, message: "El campo ID es obligatorio" });

    let information: object = {
      status: 0,
      message: ``,
    };

    try {

      const validationError = await productValidations({...productData, id}, 'update');
      if (validationError) throw validationError;
      
      const updateInput: any = {
        sku: productData.sku,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        costPrice: productData.costPrice,
        slug: productData.slug,
        status: productData.status,
      };

      Object.keys(updateInput).forEach((key) => {
        if (updateInput[key] === undefined || key === "reason") {
          delete updateInput[key];
        }
      });

      if (productData.attributes) {
        await prisma.productAttribute.deleteMany({
          where: { productId: id },
        });
        updateInput.attributes = productData.attributes;
      }

      if (productData.images) {
        await prisma.productImage.deleteMany({
          where: { productId: id },
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
          images: true,
        },
      });

      information = { status: 200, message: `Producto ${updatedProduct.name} actualizado exitosamente` }
      return updatedProduct;
    } catch (error) {
      information = { status: 400, message: `No se pudo actualizar el producto ${productData.name}` };
      throw error;
    } finally {
      setActivityToLog(req, {
        action: "update",
        entityType: "product",
        description: (information as { message: string }).message,
      });
    }
  }

  async deleteProduct(id: number, req: Request) {
    
    if (!id) throw { status: 400, message: "El campo ID es obligatorio" };
    
    const validationError = await productValidations({ id }, 'delete');
    if (validationError) throw (validationError)

    try {

      await Promise.all([
        prisma.productAttribute.deleteMany({ where: { productId: id } }),
        prisma.productImage.deleteMany({ where: { productId: id } }),
        prisma.inventory.deleteMany({ where: { productId: id } }),
        prisma.inventoryMovement.deleteMany({ where: { productId: id } }),
      ]);

      await prisma.product.delete({
        where: { id },
      });

      setActivityToLog(req, {
        action: "delete",
        entityType: "product",
        description: `Producto con ID ${id} eliminado exitosamente`,
      });

      return { message: "Producto eliminado exitosamente", id };
    } catch (error: any) {
      console.error(error);
      throw { status: 400, message: `No se pudo eliminar el producto con ID ${id}` };
    }
  }

  async getProductById(id: number) {
    try {
      if (!id) throw { status: 400, message: "El campo ID es obligatorio" };

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          attributes: true,
          category: true,
          images: true,
        },
      });

      if (!product) {
        throw { status: 404, message: `Producto con ID ${id} no encontrado` };
      }
      return product;
    } catch (error: any) {
      throw error;
    }
  }
}

interface validationsProducts {
  slug?: string;
  sku?: string;
  id?: number;
}

const productValidations = async (data: validationsProducts, operation: 'create' | 'update' | 'delete') => {
  const { slug, sku, id } = data;

  if (operation === 'create') {
    const [existingSlug, existingSku] = await Promise.all([
      prisma.product.findUnique({ where: { slug } }),
      prisma.product.findUnique({ where: { sku } }),
    ]);

    if (existingSku) {
      return { status: 400, message: `El SKU ${sku} ya está en uso.` };
    }

    if (existingSlug) {
      return { status: 400, message: `El slug ${slug} ya está en uso.` };
    }

  } else if (operation === 'update') {
    const product = await prisma.product.findUnique({ where: { id } })

    if (!product) {
      return { status: 400, message: `No hemos encontrado el producto con ID ${id}.` };
    }

  } else if (operation === 'delete') {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return { status: 404, message: `Producto con ID ${id} no encontrado.` };
    }
  }

  return;
};