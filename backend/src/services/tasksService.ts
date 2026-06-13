import { Status, Priority, Role, Prisma } from '@prisma/client';
import * as activityService from './activityService';
import { buildPagination } from '../utils/pagination';
import { buildTaskAccessFilter } from '../utils/access';
import prisma from '../utils/prisma';

export interface TaskCreateData {
  userId?: string;
  assignedRole?: Role;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  dueDate?: Date;
}

interface TaskFilters {
  status?: Status;
  priority?: Priority;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export const createTask = async (data: TaskCreateData, userId: string) => {
  const task = await prisma.task.create({
    data: {
      userId: data.userId || null,
      assignedRole: data.assignedRole || null,
      createdById: userId,
      title: data.title,
      description: data.description || null,
      status: data.status || Status.TODO,
      priority: data.priority || Priority.MEDIUM,
      dueDate: data.dueDate || null
    }
  });

  await activityService.logTaskCreated(task.id, userId);
  return task;
};

export const getTasks = async (userId: string, role: string, filters: TaskFilters) => {
  const { skip, take, page, pageSize, orderBy } = buildPagination({
    page: filters.page,
    pageSize: filters.pageSize,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder
  });

  const where: Prisma.TaskWhereInput = { ...buildTaskAccessFilter(userId, role) };
  
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.search) {
    where.title = { contains: filters.search, mode: 'insensitive' };
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        user: {
          select: {
            email: true
          }
        },
        createdBy: {
          select: {
            email: true
          }
        },
        _count: {
          select: {
            attachments: true
          }
        },
        attachments: {
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            size: true,
            createdAt: true,
            path: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    }),
    prisma.task.count({ where })
  ]);

  return { tasks, total, page, pageSize };
};

export const getTask = async (taskId: string, userId: string, role: string) => {
  const where: Prisma.TaskWhereInput = { id: taskId, ...buildTaskAccessFilter(userId, role) };

  const task = await prisma.task.findFirst({
    where,
    include: {
      user: {
        select: {
          email: true
        }
      },
      createdBy: {
        select: {
          email: true
        }
      },
      attachments: {
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          size: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          attachments: true
        }
      }
    }
  });
  
  if (!task) {
    throw { status: 404, message: 'Task not found or not owned by user' };
  }
  
  return task;
};

export const updateTask = async (taskId: string, userId: string, role: string, updates: Partial<TaskCreateData>) => {
  const where: Prisma.TaskWhereInput = { id: taskId, ...buildTaskAccessFilter(userId, role) };

  const oldTask = await prisma.task.findFirst({
    where
  });

  if (!oldTask) {
    throw { status: 404, message: 'Task not found or not owned by user' };
  }

  const changes: Prisma.InputJsonValue[] = [];
  const fieldsToCheck = ['title', 'description', 'status', 'priority', 'dueDate'] as const;
  
  fieldsToCheck.forEach(field => {
    if (updates[field] !== undefined) {
      const oldVal = oldTask[field];
      const newVal = updates[field];
      let isDifferent = oldVal !== newVal;

      if (oldVal instanceof Date && newVal instanceof Date) {
        isDifferent = oldVal.getTime() !== newVal.getTime();
      } else if (field === 'dueDate' && oldVal && newVal) {
        isDifferent = new Date(oldVal as unknown as string).getTime() !== new Date(newVal as unknown as string).getTime();
      }

      if (isDifferent) {
        changes.push({ field, oldValue: oldVal, newValue: newVal } as Prisma.InputJsonValue);
      }
    }
  });

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: updates
  });

  if (changes.length > 0) {
    await activityService.logTaskUpdated(taskId, userId, changes);
  }

  return updatedTask;
};

export const deleteTask = async (taskId: string, userId: string, role: string) => {
  const where: Prisma.TaskWhereInput = { id: taskId, ...buildTaskAccessFilter(userId, role) };

  const task = await prisma.task.findFirst({
    where
  });

  if (!task) {
    throw { status: 404, message: 'Task not found or not owned by user' };
  }

  const taskSnapshot = { title: task.title, status: task.status, priority: task.priority };

  await activityService.logTaskDeleted(taskId, userId, taskSnapshot);

  await prisma.task.delete({
    where: { id: taskId }
  });
  
  return true;
};
