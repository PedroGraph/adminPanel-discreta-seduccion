import request from 'supertest';
import  app, { server } from '../index.js';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

describe('Product Endpoints', () => {
  let authToken: string;
  let userId: number;
  let productId: number;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123', 
        role: 'admin'
      }
    });
    userId = user.id;

    authToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
  });

  afterAll(async () => {

    await prisma.user.delete({
      where: { email: 'test@example.com' }
    });

    await new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
    });
  });


  describe('POST - creating a product', () => {
    it('should create a new product', async () => {
      const productData = {
        sku: 'TEST-001',
        name: 'Test Product',
        description: 'Test Description',
        slug: 'test-product',
        price: 100,
        costPrice: 80,
        status: 'draft',
        categoryId: 1,
        createdById: userId,
        attributes: {
          create: [
            {
              attributeName: 'Color',
              attributeValue: 'Red'
            }
          ]
        },
        images: {
          create: [
            {
              imageUrl: 'https://example.com/image.jpg',
              isPrimary: true
            }
          ]
        }
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.sku).toBe(productData.sku);
      productId = response.body.id;
    });
  });


  describe('GET - getting all products', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });


  describe('GET getting only one product', () => {
    it('should get a specific product', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(productId);
    });
  });


  describe('PUT updating created test product', () => {
    it('should update a product', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 150,
        attributes: {
          create: [
            {
              attributeName: 'Color',
              attributeValue: 'Blue'
            }
          ]
        }
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.price).toBe(updateData.price.toString());
    });
  });


  describe('DELETE deleting created test product', () => {
    it('should delete a product', async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBe('Producto eliminado exitosamente');
    });
  });
}); 