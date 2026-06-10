import { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import { Status } from '@prisma/client';

export const getUsers = async (req: Request, res: Response) => {
  const { search, sortBy, sortOrder, page, pageSize } = req.query;

  const result = await adminService.getUsers({
    search: search as string,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined
  });

  res.status(200).json({
    data: result,
    status: 'success',
    timestamp: new Date().toISOString()
  });
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await adminService.getUserById(id);

  res.status(200).json({
    data: user,
    status: 'success',
    timestamp: new Date().toISOString()
  });
};

export const getUserTasks = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, search, sortBy, sortOrder, page, pageSize } = req.query;

  const result = await adminService.getUserTasks(id, {
    status: status as Status,
    search: search as string,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined
  });

  res.status(200).json({
    data: result,
    status: 'success',
    timestamp: new Date().toISOString()
  });
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, isActive } = req.body;

  const user = await adminService.updateUser(id, { role, isActive });

  res.status(200).json({
    data: user,
    status: 'success',
    timestamp: new Date().toISOString()
  });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.user!.id;

  const result = await adminService.deleteUser(id, adminId);

  res.status(200).json({
    data: result,
    status: 'success',
    timestamp: new Date().toISOString()
  });
};

export const getStats = async (req: Request, res: Response) => {
  const stats = await adminService.getStats();

  res.status(200).json({
    data: stats,
    status: 'success',
    timestamp: new Date().toISOString()
  });
};

export const getAuthLogs = async (req: Request, res: Response) => {
  const { email, action, page, pageSize } = req.query;

  const result = await adminService.getAuthLogs({
    email: email as string,
    action: action as string,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined
  });

  res.status(200).json({
    data: result,
    status: 'success',
    timestamp: new Date().toISOString()
  });
};

export const getActivityLogs = async (req: Request, res: Response) => {
  const { action, page, pageSize } = req.query;

  const result = await adminService.getActivityLogs({
    action: action as string,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined
  });

  res.status(200).json({
    data: result,
    status: 'success',
    timestamp: new Date().toISOString()
  });
};