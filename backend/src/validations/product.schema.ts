import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const createProductSchema = z.object({
  product: z.object({
    sku: z.string().min(1, "El SKU es requerido"),
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    slug: z.string().min(2, "El slug debe tener al menos 2 caracteres"),
    description: z.string().optional(),
    price: z.number().positive("El precio debe ser positivo"),
    costPrice: z
      .number()
      .positive("El precio de costo debe ser positivo")
      .optional(),
    status: z.enum(["active", "inactive", "draft"]).default("draft"),
    categoryId: z.number().int().positive().optional(),
    attributes: z
      .object({
        create: z.array(
          z.object({
            attributeName: z.string(),
            attributeValue: z.string(),
          })
        ),
      })
      .optional(),
    images: z
      .object({
        create: z.array(
          z.object({
            imageUrl: z.string().url("URL de imagen inválida"),
            isPrimary: z.boolean().default(false),
            sortOrder: z.number().int().default(0),
          })
        ),
      })
      .optional(),
    category: z
      .object({
        name: z.string(),
        description: z.string().optional(),
        status: z.enum(["active", "inactive", "draft"]).default("draft"),
      })
      .optional(),  
    
  }),
  inventory: z
    .object({
    warehouseId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    availableQuantity: z.number().int().positive().optional(),
    reservedQuantity: z.number().int().nonnegative().optional(),
    thresholdQuantity: z.number().int().positive().optional(),
    location: z.string(),
  }).optional()
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default("1"),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default("10"),
  search: z.string().optional(),
  categoryId: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional(),
  status: z.enum(["active", "inactive", "draft"]).optional(),
  sortBy: z
    .enum(["name", "price", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createProductValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    createProductSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};

export const updateProductValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    updateProductSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};
