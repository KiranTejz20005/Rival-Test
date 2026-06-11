import jwt from 'jsonwebtoken';
import crypto from 'crypto';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET environment variable is required');
}

const JWT_SECRET: string = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET;

export interface TokenClaims {
  sub: string;
  email: string;
  role: string;
  exp?: number;
}

export const generateAccessToken = (userId: string, email: string, role: string): string => {
  return jwt.sign({ sub: userId, email, role }, JWT_SECRET, { expiresIn: '15m', algorithm: 'HS256' });
};

export const generateRefreshToken = (userId: string, email: string, role: string): string => {
  return jwt.sign({ sub: userId, email, role, jti: crypto.randomUUID() }, JWT_REFRESH_SECRET, { expiresIn: '7d', algorithm: 'HS256' });
};

export const verifyAccessToken = (token: string): TokenClaims => {
  return jwt.verify(token, JWT_SECRET) as TokenClaims;
};

export const verifyRefreshToken = (token: string): TokenClaims => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenClaims;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};