import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress;
  const result = await authService.signup(email, password, ip);
  res.status(201).json({
    data: result,
    status: 'success',
    timestamp: new Date().toISOString()
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress;
  const result = await authService.login(email, password, ip);
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
    const result = await authService.refresh(refreshToken);
    res.status(200).json({
      data: result,
      status: 'success',
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    const status = err.status || 401;
    res.status(status).json({ error: err.message || 'Invalid refresh token', status, timestamp: new Date().toISOString() });
  }
};

export const logout = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const email = req.user!.email;
  const ip = req.ip || req.socket.remoteAddress;
  await authService.logout(userId, email, ip);
  res.status(200).json({
    message: 'Logged out successfully',
    status: 'success',
    timestamp: new Date().toISOString()
  });
};

export const getMe = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = await authService.getUserById(userId);
  res.status(200).json({
    data: { user },
    status: 'success',
    timestamp: new Date().toISOString()
  });
};