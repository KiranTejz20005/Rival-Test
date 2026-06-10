import { Request, Response } from 'express';
import { PrismaClient, Status, Priority } from '@prisma/client';
import * as tasksService from '../services/tasksService';
import * as activityService from '../services/activityService';

const prisma = new PrismaClient();

export const createTask = async (req: Request, res: Response) => {
  const authenticatedUserId = req.user!.id;
  const role = req.user!.role;
  const { title, description, status, priority, dueDate, userId } = req.body;
  
  const targetUserId = (role === 'ADMIN' && userId) ? userId : authenticatedUserId;
  
  if (role === 'ADMIN' && userId) {
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return res.status(404).json({ error: 'User not found', status: 404, timestamp: new Date().toISOString() });
    }
  }
  
  const task = await tasksService.createTask({
    userId: targetUserId,
    title,
    description,
    status: status as Status,
    priority: priority as Priority,
    dueDate: dueDate ? new Date(dueDate) : undefined
  });
  
  res.status(201).json({
    data: task,
    status: 'success',
    timestamp: new Date().toISOString()
  });
};

export const getTasks = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;
  const { status, priority, search, sortBy, sortOrder, page, pageSize } = req.query;
  
  const result = await tasksService.getTasks(userId, role, {
    status: status as Status,
    priority: priority as Priority,
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
 
export const getTask = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;
  const taskId = req.params.id;
  
  const task = await tasksService.getTask(taskId, userId, role);
  
  res.status(200).json({
    data: task,
    status: 'success',
    timestamp: new Date().toISOString()
  });
};
 
export const updateTask = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;
  const taskId = req.params.id;
  
  const updates: any = { ...req.body };
  if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);
  
  if (role === 'ADMIN' && updates.userId) {
    const userExists = await prisma.user.findUnique({ where: { id: updates.userId } });
    if (!userExists) {
      return res.status(404).json({ error: 'User not found', status: 404, timestamp: new Date().toISOString() });
    }
  } else {
    delete updates.userId;
  }
  
  const task = await tasksService.updateTask(taskId, userId, role, updates);
  
  res.status(200).json({
    data: task,
    status: 'success',
    timestamp: new Date().toISOString()
  });
};
 
export const deleteTask = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;
  const taskId = req.params.id;
  
  await tasksService.deleteTask(taskId, userId, role);
  
  res.status(200).json({
    message: 'task deleted',
    status: 'success',
    timestamp: new Date().toISOString()
  });
};

export const getTaskActivity = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;
  const taskId = req.params.id;

  const logs = await activityService.getTaskActivity(taskId, userId, role);
  res.status(200).json({
    data: logs,
    status: 'success',
    timestamp: new Date().toISOString()
  });
};
