import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const canModifyTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized', status: 401, timestamp: new Date().toISOString() });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found', status: 404, timestamp: new Date().toISOString() });
    }

    if (task.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to modify this task', status: 403, timestamp: new Date().toISOString() });
    }

    next();
  } catch (error) {
    next(error);
  }
};
