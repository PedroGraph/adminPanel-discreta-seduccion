import { PrismaClient } from '@prisma/client';
import { ProductData } from 'prisma/interfaces/schema.js';

const prisma = new PrismaClient();


export async function seedProducts(): Promise<void> {
  const products: ProductData[] = [
    {
      sku: 'PROD001',
      name: 'Vestido Negro Elegante',
      slug: 'vestido-negro-elegante',
      description: 'Vestido negro elegante para ocasiones especiales',
      price: 129.99,
      costPrice: 65.00,
      status: 'active',
      categoryId: 1, // Ropa
      attributes: {
        create: [
          {
            attributeName: 'Color',
            attributeValue: 'Negro',
          },
          {
            attributeName: 'Talla',
            attributeValue: 'S,M,L,XL',
          },
          {
            attributeName: 'Material',
            attributeValue: 'Poliester',
          },
        ],
      },
      images: {
        create: [
          {
            imageUrl: 'https://example.com/images/vestido-negro-1.jpg',
            isPrimary: true,
            sortOrder: 1,
          },
          {
            imageUrl: 'https://example.com/images/vestido-negro-2.jpg',
            isPrimary: false,
            sortOrder: 2,
          },
        ],
      },
    },
    {
      sku: 'PROD002',
      name: 'Zapatos de Tacón Alto',
      slug: 'zapatos-tacon-alto',
      description: 'Zapatos de tacón alto elegantes',
      price: 89.99,
      costPrice: 45.00,
      status: 'active',
      categoryId: 2, // Calzado
      attributes: {
        create: [
          {
            attributeName: 'Color',
            attributeValue: 'Negro',
          },
          {
            attributeName: 'Talla',
            attributeValue: '36,37,38,39,40',
          },
          {
            attributeName: 'Material',
            attributeValue: 'Cuero',
          },
        ],
      },
      images: {
        create: [
          {
            imageUrl: 'https://example.com/images/zapatos-tacon-1.jpg',
            isPrimary: true,
            sortOrder: 1,
          },
          {
            imageUrl: 'https://example.com/images/zapatos-tacon-2.jpg',
            isPrimary: false,
            sortOrder: 2,
          },
        ],
      },
    },
  ];

  for (const product of products) {
    const { attributes, images, ...productData } = product;
    
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        ...productData,
        attributes: {
          deleteMany: {},
          create: attributes.create,
        },
        images: {
          deleteMany: {},
          create: images.create,
        },
      },
      create: {
        ...productData,
        attributes: attributes,
        images: images,
      },
    });
  }

  console.log('✅ Productos sembrados exitosamente');
} 