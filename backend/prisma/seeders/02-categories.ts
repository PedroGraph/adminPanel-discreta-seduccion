import { PrismaClient } from '@prisma/client';
import { CategoryData } from 'prisma/interfaces/schema.js';

const prisma = new PrismaClient();

export async function seedCategories(): Promise<void> {
  const categories: CategoryData[] = [
    {
      name: 'Ropa',
      slug: 'ropa',
      description: 'Todo tipo de ropa',
      status: 'active',
    },
    {
      name: 'Calzado',
      slug: 'calzado',
      description: 'Todo tipo de calzado',
      status: 'active',
    },
    {
      name: 'Accesorios',
      slug: 'accesorios',
      description: 'Accesorios varios',
      status: 'active',
    },
    {
      name: 'Ropa Interior',
      slug: 'ropa-interior',
      description: 'Ropa interior y lencería',
      status: 'active',
    },
    {
      name: 'Trajes de Baño',
      slug: 'trajes-de-bano',
      description: 'Trajes de baño y bikinis',
      status: 'active',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log('✅ Categorías sembradas exitosamente');
} 