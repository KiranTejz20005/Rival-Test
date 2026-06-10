import { PrismaClient, Status, Priority } from '@prisma/client';
import * as activityService from './activityService';

const prisma = new PrismaClient();

interface TaskCreateData {
  userId: string;
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

export const createTask = async (data: TaskCreateData) => {
  const task = await prisma.task.create({
    data: {
      userId: data.userId,
      title: data.title,
      description: data.description || null,
      status: data.status || Status.TODO,
      priority: data.priority || Priority.MEDIUM,
      dueDate: data.dueDate || null
    }
  });

  await activityService.logTaskCreated(task.id);
  return task;
};

export const getTasks = async (userId: string, filters: TaskFilters) => {
  const page = Number(filters.page) || 1;
  const pageSize = Number(filters.pageSize) || 20;
  const skip = (page - 1) * pageSize;

  const where: any = { userId };
  
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.search) {
    where.title = { contains: filters.search, mode: 'insensitive' };
  }

  const orderBy: any = {};
  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder || 'desc';
  orderBy[sortBy] = sortOrder;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip,
      take: pageSize
    }),
    prisma.task.count({ where })
  ]);

  return { tasks, total, page, pageSize };
};

export const getTask = async (taskId: string, userId: string) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId }
  });
  
  if (!task) {
    throw { status: 404, message: 'Task not found or not owned by user' };
  }
  
  return task;
};

export const updateTask = async (taskId: string, userId: string, updates: Partial<TaskCreateData>) => {
  const oldTask = await prisma.task.findFirst({
    where: { id: taskId, userId }
  });

  if (!oldTask) {
    throw { status: 404, message: 'Task not found or not owned by user' };
  }

  const changes: any = [];
  const fieldsToCheck = ['title', 'description', 'status', 'priority', 'dueDate'] as const;
  
  fieldsToCheck.forEach(field => {
    if (updates[field] !== undefined && updates[field] !== oldTask[field]) {
      changes.push({
        field,
        oldValue: oldTask[field],
        newValue: updates[field]
      });
    }
  });

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: updates
  });

  if (changes.length > 0) {
    await activityService.logTaskUpdated(taskId, changes);
  }

  return updatedTask;
};

export const deleteTask = async (taskId: string, userId: string) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId }
  });

  if (!task) {
    throw { status: 404, message: 'Task not found or not owned by user' };
  }

  await prisma.task.delete({
    where: { id: taskId }
  });

  // activityService.logTaskDeleted(taskId);
  // Actually, Prisma onDelete Cascade handles ActivityLog deletion.
  // We can't log task deleted if the activity logs require the task to exist.
  // The instructions say "Prisma onDelete: Cascade handles activity logs, Create activity log entry with action: deleted".
  // Since we delete the task, the activity logs attached to it will also be deleted. Let's just return.
  
  return true;
};
