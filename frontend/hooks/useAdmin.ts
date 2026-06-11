'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { User, Task, AdminStats, ActivityLog, AuthLog } from '../types';

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/stats');
      setStats(data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { stats, isLoading, error, refetch: fetch };
}

export function useAdminUsers(filters: {
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/users', { params: filters });
      setUsers(data.data.users);
      setTotal(data.data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.sortBy, filters.sortOrder, filters.page, filters.pageSize]);

  useEffect(() => { fetch(); }, [fetch]);

  return { users, total, isLoading, error, refetch: fetch };
}

export function useAdminUserTasks(userId: string, filters: {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/admin/users/${userId}/tasks`, { params: filters });
      setTasks(data.data.tasks);
      setTotal(data.data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load user tasks');
    } finally {
      setLoading(false);
    }
  }, [userId, filters.status, filters.search, filters.sortBy, filters.sortOrder, filters.page, filters.pageSize]);

  useEffect(() => { fetch(); }, [fetch]);

  return { tasks, total, isLoading, error, refetch: fetch };
}

export function useAdminActivity(filters: {
  action?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/activity', { params: filters });
      setLogs(data.data.logs);
      setTotal(data.data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [filters.action, filters.page, filters.pageSize]);

  useEffect(() => { fetch(); }, [fetch]);

  return { logs, total, isLoading, error, refetch: fetch };
}

export function useAdminUpdateUser() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (userId: string, updates: { role?: string; isActive?: boolean }) => {
    setLoading(true);
    try {
      const { data } = await api.patch(`/api/admin/users/${userId}`, updates);
      setError(null);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, isLoading, error };
}

export function useAdminCreateUser() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: { email: string; password?: string; role?: string; isActive?: boolean }) => {
    setLoading(true);
    try {
      const response = await api.post('/api/admin/users', data);
      setError(null);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, isLoading, error };
}

export function useAdminCreateUsersBatch() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBatch = async (users: { email: string; password?: string; role?: string; isActive?: boolean }[]) => {
    setLoading(true);
    try {
      const response = await api.post('/api/admin/users/batch', { users });
      setError(null);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create users batch');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createBatch, isLoading, error };
}

export function useAdminAuthLogs(filters: {
  email?: string;
  action?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/auth-logs', { params: filters });
      setLogs(data.data.logs);
      setTotal(data.data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load auth logs');
    } finally {
      setLoading(false);
    }
  }, [filters.email, filters.action, filters.page, filters.pageSize]);

  useEffect(() => { fetch(); }, [fetch]);

  return { logs, total, isLoading, error, refetch: fetch };
}

export function useAdminDeleteUser() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = async (userId: string) => {
    setLoading(true);
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setError(null);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { delete: deleteUser, isLoading, error };
}