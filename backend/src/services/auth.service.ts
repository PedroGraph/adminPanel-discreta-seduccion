import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logSecurityEvent } from '../utils/securityLogger.js';
import { randomBytes } from 'crypto';
import prisma from '../lib/prisma.js';

const SALT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
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
    details: success ? 'Login successful' : 'Login failed',
    userAgent,
  });
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: { id: number; email: string; role: string }): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
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
  async login(data: { email: string; password: string; ip: string; userAgent: string }) {

    if (isIPBlocked(data.ip)) {
      throw new Error('IP bloqueada temporalmente por múltiples intentos fallidos');
    }

    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      await recordLoginAttempt(data.email, data.ip, false, data.userAgent);
      throw new Error('Usuario no encontrado');
    }

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
      await recordLoginAttempt(data.email, data.ip, false, data.userAgent);
      throw new Error('Contraseña incorrecta');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    await createSession(user.id, token, data.ip, data.userAgent);
    await recordLoginAttempt(data.email, data.ip, true, data.userAgent);

    return { token, name: user.name, email: user.email, role: user.role };
  }

  async logout(sessionId: string): Promise<void> {
    await invalidateSession(sessionId);
  }

  async logoutAll(userId: number): Promise<void> {
    await invalidateAllUserSessions(userId);
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