import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthMiddleware, AuthRequest } from '../types/middleware.js';

export const auth: AuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ message: 'No token, authorization denied' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded as jwt.JwtPayload;

    if(req.user.role !== 'admin') {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 