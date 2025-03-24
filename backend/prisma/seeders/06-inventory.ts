import { PrismaClient } from '@prisma/client';
import { InventoryData } from 'prisma/interfaces/schema.js';

const prisma = new PrismaClient();

export async function seedInventory(): Promise<void> {
  const inventory: InventoryData[] = [
    {
      productId: 1, // Vestido Negro Elegante
      warehouseId: 1, // Almacén Principal
      quantity: 100,
      availableQuantity: 100,
      reservedQuantity: 0,
      thresholdQuantity: 20,
      location: 'A-1-1',
    },
    {
      productId: 2, // Zapatos de Tacón Alto
      warehouseId: 1, // Almacén Principal
      quantity: 50,
      availableQuantity: 50,
      reservedQuantity: 0,
      thresholdQuantity: 10,
      location: 'B-2-1',
    },
    {
      productId: 1, // Vestido Negro Elegante
      warehouseId: 2, // Almacén Norte
      quantity: 75,
      availableQuantity: 75,
      reservedQuantity: 0,
      thresholdQuantity: 15,
      location: 'A-1-1',
    },
    {
      productId: 2, // Zapatos de Tacón Alto
      warehouseId: 2, // Almacén Norte
      quantity: 25,
      availableQuantity: 25,
      reservedQuantity: 0,
      thresholdQuantity: 5,
      location: 'B-2-1',
    },
  ];

  for (const item of inventory) {
    await prisma.inventory.upsert({
      where: {
        productId_warehouseId: {
          productId: item.productId,
          warehouseId: item.warehouseId,
        },
      },
      update: item,
      create: item,
    });
  }

  console.log('✅ Inventario sembrado exitosamente');
} 