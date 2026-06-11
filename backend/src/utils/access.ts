import { Role } from '@prisma/client';

export function buildTaskAccessFilter(userId: string, role: string) {
  if (role === 'ADMIN') return {};
  return {
    OR: [
      { userId },
      { assignedRole: role as Role }
    ]
  };
}
