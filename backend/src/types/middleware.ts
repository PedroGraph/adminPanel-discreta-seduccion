import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export type AuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type ErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void; 