'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAdminStats, useAdminActivity } from '../../hooks/useAdmin';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Users, ClipboardList, CheckCircle, Clock, AlertTriangle, LogOut, ArrowLeft, Activity, UserPlus, ListTodo } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useAdminStats();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
    if (!authLoading && isAuthenticated && user?.role !== 'ADMIN') {
      router.push('/tasks');
    }
  }, [isAuthenticated, authLoading, user, router]);

  if (authLoading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50' },
    { label: 'Total Tasks', value: stats?.totalTasks ?? 0, icon: ClipboardList, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/50' },
    { label: 'Completed', value: stats?.completedTasks ?? 0, icon: CheckCircle, color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50' },
    { label: 'Pending', value: stats?.pendingTasks ?? 0, icon: Clock, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50' },
    { label: 'High Priority', value: stats?.highPriorityTasks ?? 0, icon: AlertTriangle, color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <header className="bg-white dark:bg-neutral-900/40 border-b border-neutral-200 dark:border-neutral-800/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/tasks')}
              className="flex items-center text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tasks</span>
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition gap-1.5 border border-indigo-200 dark:border-indigo-800/50"
            >
              <Users className="w-4 h-4" />
              <span>Manage Users</span>
            </button>
            <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium hidden md:inline">{user?.email}</span>
            <button
              onClick={async () => { await logout(); router.push('/auth'); }}
              className="flex items-center text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {statsLoading ? (
          <LoadingSpinner />
        ) : statsError ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{statsError}</p>
            <button onClick={refetchStats} className="bg-neutral-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-md hover:opacity-90">Retry</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {cards.map((card) => (
                <div key={card.label} className={`rounded-xl border p-4 ${card.color} bg-white dark:bg-neutral-900 shadow-sm`}>
                  <div className="flex items-center gap-2 mb-2">
                    <card.icon className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-75">{card.label}</span>
                  </div>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-neutral-500" />
                  <h2 className="text-lg font-bold">Recent Activity</h2>
                </div>
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {stats.recentActivity.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800/60 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-neutral-400 mt-2 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            Task <span className="capitalize">{log.action}</span>
                            {log.task?.title && <span className="text-neutral-500"> &mdash; {log.task.title}</span>}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 text-sm">No recent activity</p>
                )}
              </div>

              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ListTodo className="w-5 h-5 text-neutral-500" />
                  <h2 className="text-lg font-bold">Quick Actions</h2>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/admin/users')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition text-left"
                  >
                    <Users className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-semibold">Manage Users</p>
                      <p className="text-xs text-neutral-500">View, search, and manage all users</p>
                    </div>
                  </button>
                  <button
                    onClick={() => router.push('/tasks')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition text-left"
                  >
                    <ListTodo className="w-5 h-5 text-violet-500" />
                    <div>
                      <p className="text-sm font-semibold">All Tasks</p>
                      <p className="text-xs text-neutral-500">View and manage all tasks</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}