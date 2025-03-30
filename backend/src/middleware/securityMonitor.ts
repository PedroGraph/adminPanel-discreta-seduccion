import { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';
import { logSecurityEvent } from '../utils/securityLogger.js';

interface SecurityConfig {
  maxLoginAttempts: number;
  suspiciousPatterns: RegExp[];
}

interface SessionData {
  failedLoginAttempts?: number;
}

interface SessionRequest extends Request {
  session: Session & Partial<SessionData>;
}

const securityConfig: SecurityConfig = {
  maxLoginAttempts: 5,
  suspiciousPatterns: [
    /\.\.\//, // Directory traversal
    /<script>/i, // XSS attempts
    /union\s+select/i, // SQL injection attempts
    /exec\s*\(/i, // Command execution attempts
  ],
};

export const securityMonitor = async (req: SessionRequest, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const path = req.path;
  const method = req.method;
  const userAgent = req.get('user-agent') || 'unknown';

  // Detects suspicious patterns in the URL and the body
  const requestData = JSON.stringify(req.body);
  const hasSuspiciousPattern = securityConfig.suspiciousPatterns.some(pattern => 
    pattern.test(path) || pattern.test(requestData)
  );

  if (hasSuspiciousPattern) {
    await logSecurityEvent({
      type: 'suspicious_activity',
      ip,
      details: `Suspicious pattern detected in ${method} ${path}`,
      userAgent,
    });
  }

  // Monitors failed login attempts
  if (path === '/api/auth/login' && method === 'POST') {
    const failedAttempts = req.session.failedLoginAttempts || 0;
    if (failedAttempts >= securityConfig.maxLoginAttempts) {
      await logSecurityEvent({
        type: 'failed_auth',
        ip,
        details: `Multiple failed login attempts from IP ${ip}`,
        userAgent,
      });
    }
  }

  next();
}; 