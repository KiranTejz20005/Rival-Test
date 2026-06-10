import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const logTaskCreated = async (taskId: string) => {
  await prisma.activityLog.create({
    data: {
      taskId,
      action: 'created',
      changes: null
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

export const logTaskDeleted = async (taskId: string) => {
  await prisma.activityLog.create({
    data: {
      taskId,
      action: 'deleted',
      changes: null
    }
  });
};
