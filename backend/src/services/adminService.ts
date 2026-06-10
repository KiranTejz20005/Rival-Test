import { PrismaClient, Status } from '@prisma/client';

const prisma = new PrismaClient();

export const getUsers = async (filters: {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}) => {
  const page = Number(filters.page) || 1;
  const pageSize = Number(filters.pageSize) || 20;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search, mode: 'insensitive' } },
      { id: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  const orderBy: any = {};
  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder || 'desc';
  orderBy[sortBy] = sortOrder;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { tasks: true }
        }
      }
    }),
    prisma.user.count({ where })
  ]);

  return { users, total, page, pageSize };
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { tasks: true }
      }
    }
  });
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }
  return user;
};

export const getUserTasks = async (userId: string, filters: {
  status?: Status;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}) => {
  const page = Number(filters.page) || 1;
  const pageSize = Number(filters.pageSize) || 20;
  const skip = (page - 1) * pageSize;

  const where: any = { userId };
  if (filters.status) where.status = filters.status;
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
      take: pageSize,
      include: {
        user: {
          select: { email: true }
        }
      }
    }),
    prisma.task.count({ where })
  ]);

  return { tasks, total, page, pageSize };
};

export const updateUser = async (userId: string, updates: { role?: string; isActive?: boolean }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  if (updates.role && updates.role !== 'USER' && updates.role !== 'ADMIN') {
    throw { status: 400, message: 'Invalid role' };
  }

  const data: any = {};
  if (updates.role !== undefined) data.role = updates.role;
  if (updates.isActive !== undefined) data.isActive = updates.isActive;

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return updated;
};

export const deleteUser = async (userId: string, requestingUserId: string) => {
  if (userId === requestingUserId) {
    throw { status: 400, message: 'Cannot delete yourself' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  const adminCount = await prisma.user.count({ where: { role: 'ADMIN', isActive: true } });
  if (user.role === 'ADMIN' && adminCount <= 1) {
    throw { status: 400, message: 'Cannot delete the last admin' };
  }

  await prisma.task.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });

  return { message: 'User deleted successfully' };
};

export const getStats = async () => {
  const [totalUsers, totalTasks, completedTasks, highPriorityTasks, recentActivity] = await Promise.all([
    prisma.user.count(),
    prisma.task.count(),
    prisma.task.count({ where: { status: 'DONE' as Status } }),
    prisma.task.count({ where: { priority: 'HIGH', status: { not: 'DONE' as Status } } }),
    prisma.activityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20,
      include: {
        task: {
          select: { title: true }
        }
      }
    })
  ]);

  const pendingTasks = totalTasks - completedTasks;

  return {
    totalUsers,
    totalTasks,
    completedTasks,
    pendingTasks,
    highPriorityTasks,
    recentActivity
  };
};

export const getActivityLogs = async (filters: {
  action?: string;
  page?: number;
  pageSize?: number;
}) => {
  const page = Number(filters.page) || 1;
  const pageSize = Number(filters.pageSize) || 50;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (filters.action) where.action = filters.action;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip,
      take: pageSize,
      include: {
        task: {
          select: { title: true, userId: true }
        }
      }
    }),
    prisma.activityLog.count({ where })
  ]);

  return { logs, total, page, pageSize };
};