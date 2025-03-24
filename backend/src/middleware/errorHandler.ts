import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../types/middleware.js';

export const errorHandler: ErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);

  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}; 