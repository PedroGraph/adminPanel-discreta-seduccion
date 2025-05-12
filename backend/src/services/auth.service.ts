import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logSecurityEvent } from '../utils/securityLogger.js';
import { randomBytes } from 'crypto';
import prisma from '../lib/prisma.js';
import { setActivityToLog } from '@/middleware/log.js';
import { Request } from 'express';
import { generateToken } from '../utils/jwt.js';
import { handlePrismaError } from '../utils/handleErrors.js';

const SALT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 20;
const LOCKOUT_TIME = 15 * 60 * 1000; 
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; 

interface LoginAttempt {
  timestamp: number;
  success: boolean;
  ip: string;
}

interface Session {
  id: string;
  userId: number;
  token: string;
  ip: string;
  userAgent: string;
  createdAt: Date;
  lastActive: Date;
}

const loginAttempts = new Map<string, LoginAttempt[]>();
const activeSessions = new Map<string, Session>();

export const generateSessionId = (): string => {
  return randomBytes(32).toString('hex');
};

export const createSession = async (
  userId: number,
  token: string,
  ip: string,
  userAgent: string
): Promise<Session> => {
  const sessionId = generateSessionId();
  const session: Session = {
    id: sessionId,
    userId,
    token,
    ip,
    userAgent,
    createdAt: new Date(),
    lastActive: new Date()
  };

  activeSessions.set(sessionId, session);
  await prisma.session.create({
    data: {
      id: sessionId,
      userId: userId,
      token: token,
      ip: ip || '127.0.0.1',
      userAgent: userAgent || 'unknown',
      createdAt: session.createdAt,
      lastActive: session.lastActive
    }
  });

  return session;
};

export const validateSession = async (sessionId: string): Promise<boolean> => {
  const session = activeSessions.get(sessionId);
  if (!session) return false;

  if (Date.now() - session.lastActive.getTime() > SESSION_EXPIRY) {
    await invalidateSession(sessionId);
    return false;
  }

  session.lastActive = new Date();
  return true;
};

export const invalidateSession = async (sessionId: string): Promise<void> => {
  activeSessions.delete(sessionId);
  await prisma.session.delete({
    where: { id: sessionId }
  });
};

export const invalidateAllUserSessions = async (userId: number): Promise<void> => {
  const sessions = Array.from(activeSessions.values())
    .filter(session => session.userId === userId);
  
  for (const session of sessions) {
    await invalidateSession(session.id);
  }
};

export const isIPBlocked = (ip: string): boolean => {
  const attempts = loginAttempts.get(ip) || [];
  const recentAttempts = attempts.filter(
    attempt => attempt.timestamp > Date.now() - LOCKOUT_TIME
  );
  
  const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
  return failedAttempts.length >= MAX_LOGIN_ATTEMPTS;
};

export const recordLoginAttempt = async (
  email: string,
  ip: string,
  success: boolean,
  userAgent: string
): Promise<void> => {

  const emailAttempts = loginAttempts.get(email) || [];
  emailAttempts.push({ timestamp: Date.now(), success, ip });
  
  if (emailAttempts.length > MAX_LOGIN_ATTEMPTS) {
    emailAttempts.shift();
  }
  loginAttempts.set(email, emailAttempts);


  const ipAttempts = loginAttempts.get(ip) || [];
  ipAttempts.push({ timestamp: Date.now(), success, ip });
  
  if (ipAttempts.length > MAX_LOGIN_ATTEMPTS) {
    ipAttempts.shift();
  }
  loginAttempts.set(ip, ipAttempts);

  await logSecurityEvent({
    type: success ? 'login_attempt' : 'failed_auth',
    ip,
    user: email,
    details: success ? `El usuario ${email} inició sesión` : `El usuario ${email} fallo la autenticación | intentos fallidos: ${emailAttempts.length}`,
    userAgent,
  });
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const verifyToken = (token: string): any => {
  try{
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  }catch(error){
    return null;
  }
};

export const isAccountLocked = (email: string): boolean => {
  const attempts = loginAttempts.get(email) || [];
  const recentAttempts = attempts.filter(
    attempt => attempt.timestamp > Date.now() - LOCKOUT_TIME
  );
  
  const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
  return failedAttempts.length >= MAX_LOGIN_ATTEMPTS;
};

export const validatePasswordStrength = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

export const sanitizeUserInput = (input: string): string => {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '');
};

export class AuthService {
  async login(req: Request) {
    const { email, password } = req.body;
    const ip = req.ip || 'unknown' as string;
    const userAgent = req.headers['user-agent'] || 'unknown' as string;

    try {
      if (isIPBlocked(ip as string)) {
        throw { status: 403, message: 'IP bloqueada temporalmente por múltiples intentos fallidos' };
      }

      const user = await prisma.user.findUnique({
        where: { email }
      });
      if (!user) {
        await recordLoginAttempt(email, ip, false, userAgent);
        throw { status: 404, message: 'Usuario no encontrado' };
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        await recordLoginAttempt(email, ip, false, userAgent);
        throw { status: 401, message: 'Contraseña incorrecta' };
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      await createSession(user.id, token, ip, userAgent);
      await recordLoginAttempt(email, ip, true, userAgent);

      return { token, name: user.name, email: user.email, role: user.role };
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw handlePrismaError(error);
    }
  }

  async logout(sessionId: string): Promise<void> {
    await invalidateSession(sessionId);
  }

  async logoutAll(userId: number): Promise<void> {
    await invalidateAllUserSessions(userId);
  }

  async register(req: Request) {
    const { name, email, password, role } = req.body;

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        await setActivityToLog(req, {
          action: "register",
          entityType: "user",
          description: `Un usuario no pudo ser registrado - ${email} | El email ya está registrado`,
        });
        throw { status: 400, message: 'El email ya está registrado' };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role as 'admin' | 'manager' | 'employee',
          status: 'active'
        }
      });

      await setActivityToLog(req, {
        action: "register",
        entityType: "user",
        description: `Usuario registrado - ${user.name} (${user.email})`,
      });

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw handlePrismaError(error);
    }
  }
} 