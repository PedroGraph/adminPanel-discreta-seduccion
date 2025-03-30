import { Response, NextFunction } from 'express';
import { AuthMiddleware, AuthRequest } from '../types/middleware.js';
import { verifyToken, isAccountLocked } from '../services/auth.service.js';
import { logSecurityEvent } from '../utils/securityLogger.js';

export const auth: AuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const ip = req.ip || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!token) {
      await logSecurityEvent({
        type: 'failed_auth',
        ip,
        details: 'No token provided',
        userAgent,
      });
      res.status(401).json({ message: 'No token, authorization denied' });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;

    // Verificar si la cuenta está bloqueada
    if (isAccountLocked(decoded.email)) {
      await logSecurityEvent({
        type: 'failed_auth',
        ip,
        user: decoded.email,
        details: 'Account locked due to multiple failed attempts',
        userAgent,
      });
      res.status(403).json({ 
        message: 'Account is temporarily locked. Please try again later.' 
      });
      return;
    }

    // Verificar rol de administrador
    if (decoded.role !== 'admin') {
      await logSecurityEvent({
        type: 'failed_auth',
        ip,
        user: decoded.email,
        details: 'Unauthorized access attempt',
        userAgent,
      });
      res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      return;
    }

    // Verificar expiración del token
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      await logSecurityEvent({
        type: 'failed_auth',
        ip,
        user: decoded.email,
        details: 'Expired token used',
        userAgent,
      });
      res.status(401).json({ message: 'Token has expired' });
      return;
    }
    
    next();
  } catch (error) {
    const ip = req.ip || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    
    await logSecurityEvent({
      type: 'failed_auth',
      ip,
      details: 'Invalid token',
      userAgent,
    });
    
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 