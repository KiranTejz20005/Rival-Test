import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const logTaskCreated = async (taskId: string) => {
  await prisma.activityLog.create({
    data: {
      taskId,
      action: 'created'
    }
  });
};

export const logTaskUpdated = async (taskId: string, changes: any) => {
  await prisma.activityLog.create({
    data: {
      taskId,
      action: 'updated',
      changes
    }
  });
};

export const logTaskDeleted = async (taskId: string, metadata?: any) => {
  await prisma.activityLog.create({
    data: {
      taskId,
      action: 'deleted',
      changes: metadata || null
    }
  });
};

export const getTaskActivity = async (taskId: string, userId: string, role: string) => {
  const taskWhere: any = { id: taskId };
  if (role !== 'ADMIN') {
    taskWhere.userId = userId;
  }
  
  const task = await prisma.task.findFirst({
    where: taskWhere
  });

  if (!task) {
    throw { status: 404, message: 'Task not found or not owned by user' };
  }

  return prisma.activityLog.findMany({
    where: { taskId },
    orderBy: { timestamp: 'desc' }
  });
};
