export interface User {
  id: string;
  email: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    tasks: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string | null;
  assignedRole?: string | null;
  createdById?: string | null;
  user?: {
    email: string;
  };
  createdBy?: {
    email: string;
  };
  attachments?: Attachment[];
  _count?: {
    attachments: number;
  };
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  userId?: string;
  assignedRole?: string;
}

export interface UserOption {
  id: string;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  status: string;
  timestamp: string;
}

export interface ApiError {
  error: string;
  status: number;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface ActivityChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  highPriorityTasks: number;
  overdueTasks: number;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  taskId: string;
  userId?: string;
  action: string;
  changes?: ActivityChange[];
  timestamp: string;
  task?: {
    title: string;
    userId?: string;
  };
  user?: {
    email: string;
  };
}

export interface AuthLog {
  id: string;
  email: string;
  action: string;
  ip: string | null;
  timestamp: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Attachment {
  id: string;
  taskId: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: string;
}