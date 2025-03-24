import { PrismaClient } from '@prisma/client';
import { SupplierData } from 'prisma/interfaces/schema.js';

const prisma = new PrismaClient();


export async function seedSuppliers(): Promise<void> {
  const suppliers: SupplierData[] = [
    {
      name: 'Proveedor Textil A',
      contactPerson: 'Ana Martínez',
      email: 'ana.martinez@proveedor-a.com',
      phone: '5555555556',
      address: 'Av. Insurgentes 123, Col. Del Valle',
      taxId: 'XAXX010101000',
      paymentTerms: 'Net 30',
      leadTime: '15 días',
      reliability: 'High',
      status: 'active',
    },
    {
      name: 'Proveedor Calzado B',
      contactPerson: 'Pedro Sánchez',
      email: 'pedro.sanchez@proveedor-b.com',
      phone: '5555555557',
      address: 'Av. Revolución 456, Col. San Ángel',
      taxId: 'XAXX010101001',
      paymentTerms: 'Net 45',
      leadTime: '20 días',
      reliability: 'Medium',
      status: 'active',
    },
    {
      name: 'Proveedor Accesorios C',
      contactPerson: 'Laura Torres',
      email: 'laura.torres@proveedor-c.com',
      phone: '5555555558',
      address: 'Av. Tamaulipas 789, Col. Condesa',
      taxId: 'XAXX010101002',
      paymentTerms: 'Net 60',
      leadTime: '10 días',
      reliability: 'High',
      status: 'active',
    },
  ];

  for (const supplier of suppliers) {
    await prisma.supplier.upsert({
      where: { name: supplier.name },
      update: supplier,
      create: supplier,
    });
  }

  console.log('✅ Proveedores sembrados exitosamente');
} 