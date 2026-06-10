export interface User {
  id: string;
  email: string;
  role?: string;
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
