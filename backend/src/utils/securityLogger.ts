import winston from 'winston';
import path from 'path';
import { createActivityLog } from '../services/activityLog.service.js';

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

const securityLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({ 
      filename: path.join('logs', 'security.log'),
      level: 'info',
      maxsize: 5242880, 
      maxFiles: 5,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  securityLogger.add(new winston.transports.Console({
    format: logFormat
  }));
}

export const logSecurityEvent = async (event: {
  type: 'login_attempt' | 'failed_auth' | 'suspicious_activity' | 'rate_limit_exceeded';
  ip: string;
  user?: string;
  details: string;
  userAgent?: string;
}) => {
  securityLogger.info('Security Event', {
    ...event,
    timestamp: new Date().toISOString(),
  });

  await createActivityLog({
    userEmail: event.user || 'system',
    action: event.type,
    description: event.details,
    ipAddress: event.ip || 'unknown',
    userAgent: event.userAgent,
  });
};

export default securityLogger; 