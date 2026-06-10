import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

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
  return jwt.sign({ sub: userId, email, role }, JWT_REFRESH_SECRET, { expiresIn: '7d', algorithm: 'HS256' });
};

export const verifyAccessToken = (token: string): TokenClaims => {
  return jwt.verify(token, JWT_SECRET) as TokenClaims;
};

export const verifyRefreshToken = (token: string): TokenClaims => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenClaims;
};
