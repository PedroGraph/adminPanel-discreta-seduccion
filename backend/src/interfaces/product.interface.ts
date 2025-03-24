import { ProductStatus } from "@prisma/client";

export interface CreateProductData {
    sku: string;
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    status?: ProductStatus;
    categoryId?: number;
    slug?: string;
    createdById?: number;
    attributes?: {
      create: Array<{
        attributeName: string;
        attributeValue: string;
      }>;
    };
    images?: {
      create: Array<{
        imageUrl: string;
        isPrimary?: boolean;
        sortOrder?: number;
      }>;
    };
    category?: {
      create?: {
        name: string;
        description?: string;
        status?: string;
        slug?: string;
        parentId?: number;
      };
      connect?: {
        id: number;
      };
    };
  }