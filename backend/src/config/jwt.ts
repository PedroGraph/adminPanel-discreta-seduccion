import jwt, { Secret, SignOptions } from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h';

export const generateToken = (payload: object): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };

  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};
