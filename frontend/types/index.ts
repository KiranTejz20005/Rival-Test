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
  userId: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
  };
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
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
  details?: any;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
  allUsers?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  highPriorityTasks: number;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  taskId: string;
  action: string;
  changes?: any;
  timestamp: string;
  task?: {
    title: string;
    userId: string;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}