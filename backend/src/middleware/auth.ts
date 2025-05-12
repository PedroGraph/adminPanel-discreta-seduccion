import { Response, NextFunction } from 'express';
import { AuthMiddleware, AuthRequest } from '../types/middleware.js';
import { verifyToken, isAccountLocked } from '../services/auth.service.js';
import { logSecurityEvent } from '../utils/securityLogger.js';

export const auth: AuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const ip = req.ip || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';

  try {
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
    if (!decoded) {
      await logSecurityEvent({
        type: 'failed_auth',
        ip,
        details: 'Invalid token',
        userAgent,
      });
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    req.user = decoded;

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
  } catch (error: any) {
    console.error('Authentication error:', error);
    
    await logSecurityEvent({
      type: 'failed_auth',
      ip,
      details: error.message || 'Authentication error',
      userAgent,
    });
    
    if (!res.headersSent) {
      res.status(401).json({ 
        message: error.message || 'Token is not valid',
        error: error.name || 'AuthenticationError'
      });
    }
  }
}; 