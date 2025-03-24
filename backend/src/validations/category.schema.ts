import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z.string().min(2, 'El slug debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  parentId: z.number().int().positive().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive()).default('10'),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  parentId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}); 