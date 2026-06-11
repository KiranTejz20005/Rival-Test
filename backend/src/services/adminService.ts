import crypto from 'crypto';
import { Status, Role, Prisma } from '@prisma/client';
import { hashPassword, validatePasswordStrength } from '../utils/password';
import { buildPagination } from '../utils/pagination';
import prisma from '../utils/prisma';

export const getUsers = async (filters: {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}) => {
  const { skip, take, page, pageSize, orderBy } = buildPagination({
    page: filters.page,
    pageSize: filters.pageSize,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder
  });

  const where: Prisma.UserWhereInput = {};
  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search, mode: 'insensitive' } },
      { id: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  const [users, total, userRoleTaskCount, adminRoleTaskCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take,
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
    prisma.user.count({ where }),
    prisma.task.count({ where: { assignedRole: 'USER' } }),
    prisma.task.count({ where: { assignedRole: 'ADMIN' } })
  ]);

  const mappedUsers = users.map(user => ({
    ...user,
    _count: {
      tasks: user._count.tasks + (user.role === 'ADMIN' ? adminRoleTaskCount : userRoleTaskCount)
    }
  }));

  return { users: mappedUsers, total, page, pageSize };
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
  
  const roleTaskCount = await prisma.task.count({ where: { assignedRole: user.role } });
  user._count.tasks += roleTaskCount;
  
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
  const { skip, take, page, pageSize, orderBy } = buildPagination({
    page: filters.page,
    pageSize: filters.pageSize,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder
  });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) throw { status: 404, message: 'User not found' };

  const where: Prisma.TaskWhereInput = {
    OR: [
      { userId: userId },
      { assignedRole: user.role }
    ]
  };
  if (filters.status) where.status = filters.status;
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

  const data: Prisma.UserUpdateInput = {};
  if (updates.role !== undefined) data.role = updates.role as Role;
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

export const createUser = async (data: { email: string; password?: string; role?: string; isActive?: boolean }) => {
  const normalizedEmail = data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw { status: 409, message: 'Email already exists' };
  }

  let passwordHash = '';
  if (data.password) {
    if (!validatePasswordStrength(data.password)) {
      throw { status: 400, message: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers' };
    }
    passwordHash = await hashPassword(data.password);
  } else {
    // If no password provided, you could throw error or generate a random one
    throw { status: 400, message: 'Password is required' };
  }

  const role = (data.role === 'ADMIN' ? 'ADMIN' : 'USER') as Role;
  const isActive = data.isActive !== undefined ? data.isActive : true;

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role,
      isActive
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  return user;
};

export const createUsersBatch = async (usersData: { email: string; password?: string; role?: string; isActive?: boolean }[]) => {
  const normalized = usersData.map(d => ({ ...d, email: d.email.toLowerCase().trim() }));
  const valid = normalized.filter(d => d.email);

  const existingEmails = await prisma.user.findMany({
    where: { email: { in: valid.map(d => d.email) } },
    select: { email: true }
  });
  const existingSet = new Set(existingEmails.map(e => e.email));

  const toCreate = await Promise.all(valid.map(async (data) => {
    if (existingSet.has(data.email)) return null;

    let passwordHash;
    if (data.password && validatePasswordStrength(data.password)) {
      passwordHash = await hashPassword(data.password);
    } else {
      const randomPassword = `Temp${crypto.randomUUID().slice(0, 12)}!`;
      passwordHash = await hashPassword(randomPassword);
    }

    return {
      email: data.email,
      passwordHash,
      role: (data.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER') as Role,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
    };
  }));

  const creates = toCreate.filter(Boolean) as { email: string; passwordHash: string; role: Role; isActive: boolean }[];

  if (creates.length > 0) {
    await prisma.user.createMany({ data: creates });
  }

  return { createdCount: creates.length, skippedCount: usersData.length - creates.length };
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
  const now = new Date();
  const [totalUsers, totalTasks, completedTasks, highPriorityTasks, overdueTasks, recentActivity] = await Promise.all([
    prisma.user.count(),
    prisma.task.count(),
    prisma.task.count({ where: { status: 'DONE' as Status } }),
    prisma.task.count({ where: { priority: 'HIGH', status: { not: 'DONE' as Status } } }),
    prisma.task.count({ where: { status: { not: 'DONE' as Status }, dueDate: { lt: now } } }),
    prisma.activityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20,
      include: {
        task: {
          select: { title: true }
        },
        user: {
          select: { email: true }
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
    overdueTasks,
    recentActivity
  };
};

export const getActivityLogs = async (filters: {
  action?: string;
  page?: number;
  pageSize?: number;
}) => {
  const { skip, take, page, pageSize, orderBy } = buildPagination({
    page: filters.page,
    pageSize: filters.pageSize || 50,
    sortBy: 'timestamp'
  });

  const where: Prisma.ActivityLogWhereInput = {};
  if (filters.action) where.action = filters.action;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        task: {
          select: { title: true, userId: true }
        },
        user: {
          select: { email: true }
        }
      }
    }),
    prisma.activityLog.count({ where })
  ]);

  return { logs, total, page, pageSize };
};

export const getAuthLogs = async (filters: {
  email?: string;
  action?: string;
  page?: number;
  pageSize?: number;
}) => {
  const { skip, take, page, pageSize, orderBy } = buildPagination({
    page: filters.page,
    pageSize: filters.pageSize || 50,
    sortBy: 'timestamp'
  });

  const where: Prisma.AuthLogWhereInput = {};
  if (filters.email) where.email = { contains: filters.email, mode: 'insensitive' };
  if (filters.action) where.action = filters.action;

  const [logs, total] = await Promise.all([
    prisma.authLog.findMany({
      where,
      orderBy,
      skip,
      take
    }),
    prisma.authLog.count({ where })
  ]);

  return { logs, total, page, pageSize };
};