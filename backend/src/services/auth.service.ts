import prisma from '@/lib/prisma.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.js';

export class AuthService {
  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
      throw new Error('Contraseña incorrecta');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return { token, name: user.name, email: user.email, role: user.role };
  }

  async register(data: { name: string; email: string; password: string; role?: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as 'admin' | 'manager' | 'employee',
        status: 'active'
      }
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
} 