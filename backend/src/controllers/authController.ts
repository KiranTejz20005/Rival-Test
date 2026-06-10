import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { verifyRefreshToken, generateAccessToken } from '../utils/jwt';

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.signup(email, password);
  res.status(201).json({
    data: result,
    status: 'success',
    timestamp: new Date().toISOString()
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json({
    data: result,
    status: 'success',
    timestamp: new Date().toISOString()
  });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required', status: 401, timestamp: new Date().toISOString() });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = generateAccessToken(decoded.sub, decoded.email);
    
    res.status(200).json({
      data: { accessToken: newAccessToken },
      status: 'success',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired refresh token', status: 401, timestamp: new Date().toISOString() });
  }
};
