import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { Task, TaskFilters, CreateTaskRequest } from '../types';

export function useTasks(filters: TaskFilters = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/tasks', { params: filters });
      setTasks(data.data.tasks);
      setTotal(data.data.total);
      setError(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.priority, filters.search, filters.page, filters.sortBy, filters.sortOrder]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, total, isLoading, error, refetch: fetchTasks };
}

export function useCreateTask() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (taskData: CreateTaskRequest) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/tasks', taskData);
      setError(null);
      return data.data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to create task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, isLoading, error };
}

export function useUpdateTask() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (taskId: string, updates: Partial<CreateTaskRequest>) => {
    setLoading(true);
    try {
      const { data } = await api.patch(`/api/tasks/${taskId}`, updates);
      setError(null);
      return data.data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, isLoading, error };
}

export function useDeleteTask() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTask = async (taskId: string) => {
    setLoading(true);
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setError(null);
      return true;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { delete: deleteTask, isLoading, error };
}
