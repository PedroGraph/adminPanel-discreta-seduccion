import { PrismaClient } from '@prisma/client';
import { WarehouseData } from 'prisma/interfaces/schema.js';

const prisma = new PrismaClient();

export async function seedWarehouses(): Promise<void> {
  const warehouses: WarehouseData[] = [
    {
      name: 'Almacén Principal',
      location: 'Ciudad de México',
      address: 'Av. Reforma 123, Col. Centro',
      contactPerson: 'Juan Pérez',
      contactEmail: 'juan.perez@discretaseduccion.com',
      contactPhone: '5555555555',
      status: 'active',
    },
    {
      name: 'Almacén Norte',
      location: 'Monterrey',
      address: 'Av. Constitución 456, Col. Centro',
      contactPerson: 'María García',
      contactEmail: 'maria.garcia@discretaseduccion.com',
      contactPhone: '8181818181',
      status: 'active',
    },
    {
      name: 'Almacén Sur',
      location: 'Guadalajara',
      address: 'Av. Juárez 789, Col. Centro',
      contactPerson: 'Carlos López',
      contactEmail: 'carlos.lopez@discretaseduccion.com',
      contactPhone: '3333333333',
      status: 'active',
    },
  ];

  for (const warehouse of warehouses) {
    await prisma.warehouse.upsert({
      where: { name: warehouse.name },  
      update: warehouse,
      create: warehouse,
    });
  }

  console.log('✅ Almacenes sembrados exitosamente');
} 