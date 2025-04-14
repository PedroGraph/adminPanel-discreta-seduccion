import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/middleware.js';
import { LogService } from '../services/log.service.js';

interface LogData {
  action: string;
  entityType: string;
  description: string;
  entityId?: number;
}

export const setActivityToLog = async (req: AuthRequest, logData: LogData) => {

  const logService = new LogService();

  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) return "No token, authorization denied";
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userInfo = decoded as jwt.JwtPayload;
    await logService.createLog(req, {email: userInfo.email, ...logData});

    return "Acción registrada correctamente";

  } catch (error) {

    console.log(error);
    return null;

  }
}
