import { ProductService } from '../services/products.service.js';
import { CreateProductData } from '../interfaces/product.interface.js';
import prisma from '../lib/prisma.js';

jest.mock('../lib/prisma.js', () => ({
  product: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn()
  }
}));

describe('ProductService', () => {
    let productService: ProductService;

    beforeEach(() => {
        productService = new ProductService();
    });

    describe('createProduct', () => {
        it('debería crear un nuevo producto correctamente', async () => {
            const productData: CreateProductData = {
                name: 'Producto de Prueba',
                description: 'Descripción del producto de prueba',
                price: 100,
                status: 'active',
                costPrice: 50,
                slug: 'producto-de-prueba',
                categoryId: 1,
                sku: 'SKU123',
            };

            (prisma.product.create as jest.Mock).mockResolvedValueOnce({ id: 1, ...productData });

            const product = await productService.createProduct(productData);
            expect(product).toHaveProperty('id');
            expect(product.name).toBe(productData.name);
        });

        it('debería lanzar un error si los datos del producto son inválidos', async () => {
            const productData: CreateProductData = {
                name: '',
                description: 'Descripción del producto de prueba',
                price: 100,
                sku: 'SKU123',
                status: 'active',
                categoryId: 1,
            };

            await expect(productService.createProduct(productData)).rejects.toThrow();
        });
    });

    describe('getProductById', () => {
        it('debería obtener un producto existente', async () => {
            const productId = 1;

            (prisma.product.findUnique as jest.Mock).mockResolvedValueOnce({ id: productId });

            const product = await productService.getProductById(productId);
            expect(product).toBeDefined();
            expect(product.id).toBe(productId);
        });

        it('debería lanzar un error si el producto no existe', async () => {
            const productId = 999;

            (prisma.product.findUnique as jest.Mock).mockResolvedValueOnce(null);

            await expect(productService.getProductById(productId)).rejects.toThrow(`Producto con ID ${productId} no encontrado`);
        });
    });

    describe('updateProduct', () => {
        it('debería actualizar un producto existente', async () => {
            const productId = 1;
            const updateData = {
                name: 'Producto Actualizado',
                price: 120,
            };

            (prisma.product.update as jest.Mock).mockResolvedValueOnce({ id: productId, ...updateData });

            const updatedProduct = await productService.updateProduct(productId, updateData);
            expect(updatedProduct.name).toBe(updateData.name);
            expect(updatedProduct.price).toBe(updateData.price);
        });

        it('debería lanzar un error si se intenta actualizar un producto que no existe', async () => {
            const productId = 999;
            const updateData = {
                name: 'Producto Inexistente',
            };

            (prisma.product.update as jest.Mock).mockResolvedValueOnce(null);

            await expect(productService.updateProduct(productId, updateData)).rejects.toThrow(`Producto con ID ${productId} no encontrado`);
        });
    });

    describe('deleteProduct', () => {
        it('debería eliminar un producto existente', async () => {
            const productId = 1;

            (prisma.product.findUnique as jest.Mock).mockResolvedValueOnce({ id: productId });
            (prisma.product.delete as jest.Mock).mockResolvedValueOnce({ id: productId });

            const result = await productService.deleteProduct(productId);

            expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: productId } });
            expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: productId } });
            expect(result).toEqual({ id: productId, message: "Producto eliminado exitosamente" });
        });

        it('debería lanzar un error si el producto no existe', async () => {
            const productId = 999;

            (prisma.product.findUnique as jest.Mock).mockResolvedValueOnce(null);

            await expect(productService.deleteProduct(productId)).rejects.toThrow(`Producto con ID ${productId} no encontrado`);
        });
    });
});
