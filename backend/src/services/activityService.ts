import { Prisma, Role } from '@prisma/client';
import prisma from '../utils/prisma';

export const logTaskCreated = async (taskId: string, userId: string) => {
  await prisma.activityLog.create({
    data: {
      taskId,
      userId,
      action: 'created'
    }
  });
};

export const logTaskUpdated = async (taskId: string, userId: string, changes: Prisma.InputJsonValue[]) => {
  await prisma.activityLog.create({
    data: {
      taskId,
      userId,
      action: 'updated',
      changes
    }
  });
};

export const logTaskDeleted = async (taskId: string, userId: string, metadata?: Prisma.InputJsonValue) => {
  await prisma.activityLog.create({
    data: {
      taskId,
      userId,
      action: 'deleted',
      changes: metadata || Prisma.JsonNull
    }
  });
};

export const getTaskActivity = async (taskId: string, userId: string, role: string) => {
  const taskWhere: Prisma.TaskWhereInput = { id: taskId };
  if (role !== 'ADMIN') {
    taskWhere.OR = [
      { userId: userId },
      { assignedRole: role as Role }
    ];
  }
  
  const task = await prisma.task.findFirst({
    where: taskWhere
  });

  if (!task) {
    throw { status: 404, message: 'Task not found or not owned by user' };
  }

  return prisma.activityLog.findMany({
    where: { taskId },
    orderBy: { timestamp: 'desc' },
    include: {
      user: { select: { email: true } }
    }
  });
};
