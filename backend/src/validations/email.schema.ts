import { z } from 'zod';

export const createEmailTemplateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  subject: z.string().min(1, 'El asunto es requerido'),
  content: z.string().min(1, 'El contenido es requerido'),
  type: z.enum(['transactional', 'marketing']),
  variables: z.array(z.string()).optional(),
});

export const updateEmailTemplateSchema = createEmailTemplateSchema.partial();

export const createEmailCampaignSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  subject: z.string().min(1, 'El asunto es requerido'),
  content: z.string().min(1, 'El contenido es requerido'),
  templateId: z.number().int().positive().optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(['draft', 'scheduled', 'sent', 'cancelled']).default('draft'),
  targetAudience: z.enum(['all', 'subscribers', 'customers']).default('all'),
  filters: z.record(z.any()).optional(),
});

export const updateEmailCampaignSchema = createEmailCampaignSchema.partial();

export const emailCampaignQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive()).default('10'),
  search: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'sent', 'cancelled']).optional(),
  type: z.enum(['transactional', 'marketing']).optional(),
  sortBy: z.enum(['name', 'scheduledAt', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const subscriberSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  status: z.enum(['active', 'inactive', 'unsubscribed']).default('active'),
}); 