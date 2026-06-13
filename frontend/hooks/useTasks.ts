import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../lib/api';
import { Task, TaskFilters, CreateTaskRequest } from '../types';

export function useTasks(filters: TaskFilters = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevFilters = useRef('');

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
    const key = JSON.stringify(filters);
    if (key !== prevFilters.current) {
      prevFilters.current = key;
      fetchTasks();
    }
  }, [fetchTasks, filters]);

  const optimisticDelete = useCallback((taskId: string) => {
    const previous = { tasks, total };
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setTotal(prev => Math.max(0, prev - 1));
    return previous;
  }, [tasks, total]);

  const optimisticUpdate = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  }, []);

  const optimisticAdd = useCallback((task: Task) => {
    setTotal(prev => prev + 1);
  }, []);

  return { tasks, total, isLoading, error, refetch: fetchTasks, setTasks, setTotal, optimisticDelete, optimisticUpdate, optimisticAdd };
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
