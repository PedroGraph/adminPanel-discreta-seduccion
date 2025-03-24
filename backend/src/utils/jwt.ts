import jwt, { SignOptions, JwtPayload as JwtPayloadBase } from 'jsonwebtoken';

interface JwtPayload extends JwtPayloadBase {
  id: number;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn'];

export const generateToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };

  if(JWT_SECRET === ''){
    throw new Error('JWT_SECRET is not defined');
  }
  
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