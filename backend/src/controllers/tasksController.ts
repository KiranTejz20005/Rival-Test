import { Request, Response } from 'express';
import { Status, Priority, Role } from '@prisma/client';
import * as tasksService from '../services/tasksService';
import type { TaskCreateData } from '../services/tasksService';
import * as activityService from '../services/activityService';
import prisma from '../utils/prisma';
import { broadcast } from '../utils/sse';

export const createTask = async (req: Request, res: Response) => {
  const authenticatedUserId = req.user!.id;
  const role = req.user!.role;
  const { title, description, status, priority, dueDate, userId, assignedRole } = req.body;
  
  let targetUserId: string | undefined = authenticatedUserId;
  let targetAssignedRole: Role | undefined = undefined;

  if (role === 'ADMIN') {
    if (assignedRole) {
      targetAssignedRole = assignedRole;
      targetUserId = undefined;
    } else if (userId) {
      targetUserId = userId;
      
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        return res.status(404).json({ error: 'User not found', status: 404, timestamp: new Date().toISOString() });
      }
    }
  }
  
  const task = await tasksService.createTask({
    userId: targetUserId,
    assignedRole: targetAssignedRole,
    title,
    description,
    status: status as Status,
    priority: priority as Priority,
    dueDate: dueDate ? new Date(dueDate) : undefined
  }, authenticatedUserId);
  
  broadcast('task_created', task, targetUserId);

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
  
  const updates: Partial<TaskCreateData> = {};
  if (req.body.title !== undefined) updates.title = req.body.title;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.status !== undefined) updates.status = req.body.status as Status;
  if (req.body.priority !== undefined) updates.priority = req.body.priority as Priority;
  if (req.body.dueDate !== undefined) updates.dueDate = new Date(req.body.dueDate);
  
  if (role === 'ADMIN') {
    if (req.body.assignedRole) {
      updates.assignedRole = req.body.assignedRole as Role;
      updates.userId = undefined;
    } else if (req.body.userId) {
      updates.userId = req.body.userId;
      updates.assignedRole = undefined;
      const userExists = await prisma.user.findUnique({ where: { id: req.body.userId } });
      if (!userExists) {
        return res.status(404).json({ error: 'User not found', status: 404, timestamp: new Date().toISOString() });
      }
    }
  }
  
  const task = await tasksService.updateTask(taskId, userId, role, updates);
  
  broadcast('task_updated', task);

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
  
  broadcast('task_deleted', { id: taskId });

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
