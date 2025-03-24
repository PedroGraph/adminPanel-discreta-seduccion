import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserData } from '../interfaces/schema.js';

const prisma = new PrismaClient();

export async function seedUsers(): Promise<void> {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const users: UserData[] = [
    {
      name: 'Administrador',
      email: 'admin@discretaseduccion.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
    },
    {
      name: 'Gerente',
      email: 'gerente@discretaseduccion.com',
      password: hashedPassword,
      role: 'manager',
      status: 'active',
    },
    {
      name: 'Empleado',
      email: 'empleado@discretaseduccion.com',
      password: hashedPassword,
      role: 'employee',
      status: 'active',
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  console.log('✅ Usuarios sembrados exitosamente');
} 