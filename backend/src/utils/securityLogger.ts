import winston from 'winston';
import path from 'path';
import { createActivityLog } from '../services/activityLog.service.js';

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join('logs', 'security.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we are not in production, also show logs in console
if (process.env.NODE_ENV !== 'production') {
  securityLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export const logSecurityEvent = async (event: {
  type: 'login_attempt' | 'failed_auth' | 'suspicious_activity' | 'rate_limit_exceeded';
  ip: string;
  user?: string;
  details: string;
  userAgent?: string;
}) => {
  // Save to file
  securityLogger.info('Security Event', {
    ...event,
    timestamp: new Date().toISOString(),
  });

  // Save to database
  await createActivityLog({
    userEmail: event.user || 'system',
    action: event.type,
    description: event.details,
    ipAddress: event.ip,
    userAgent: event.userAgent,
  });
};

export default securityLogger; 