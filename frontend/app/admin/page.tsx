'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAdminStats, useAdminAuthLogs } from '../../hooks/useAdmin';
import { useTheme } from '../../hooks/useTheme';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../components/LoadingSpinner';
import AdminSidebar from '../../components/AdminSidebar';
import { Users, ClipboardList, CheckCircle, Clock, AlertTriangle, LogOut, Activity, UserPlus, ListTodo, Shield, LogIn, Ban, UserCheck, Sun, Moon } from 'lucide-react';
import ProfileDropdown from '../../components/ProfileDropdown';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { StatsCardSkeleton, Skeleton } from '../../components/SkeletonLoader';

function actionIcon(action: string) {
  switch (action) {
    case 'LOGIN_SUCCESS': return <LogIn className="w-3.5 h-3.5 text-green-500" />;
    case 'LOGIN_FAILED': return <Ban className="w-3.5 h-3.5 text-red-500" />;
    case 'LOGOUT': return <LogOut className="w-3.5 h-3.5 text-neutral-500" />;
    case 'SIGNUP': return <UserPlus className="w-3.5 h-3.5 text-blue-500" />;
    default: return <Activity className="w-3.5 h-3.5 text-neutral-400" />;
  }
}

function actionLabel(action: string) {
  switch (action) {
    case 'LOGIN_SUCCESS': return 'Logged in';
    case 'LOGIN_FAILED': return 'Failed login';
    case 'LOGOUT': return 'Logged out';
    case 'SIGNUP': return 'Signed up';
    default: return action;
  }
}

export default function AdminDashboard() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useAdminStats();
  const { logs: authLogs, isLoading: authLogsLoading } = useAdminAuthLogs({ pageSize: 10 });
  const [tab, setTab] = useState<'activity' | 'logins'>('activity');
  const { isDarkMode, toggleDarkMode } = useTheme();

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
    { label: 'Overdue', value: stats?.overdueTasks ?? 0, icon: AlertTriangle, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50' },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white dark:bg-neutral-900/40 border-b border-neutral-200 dark:border-neutral-800/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-4">
          <div className="flex-1"></div>
          <div className="flex items-center justify-end gap-3 sm:gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 rounded-lg transition"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-850 hidden sm:block" />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {statsLoading ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <Skeleton className="h-[300px] w-full rounded-xl lg:col-span-2" />
            </div>
          </>
        ) : statsError ? (
          <ErrorState message={statsError} onRetry={refetchStats} className="mb-8" />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions + Admin Management */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-neutral-500" />
                  <h2 className="text-lg font-bold">Admin Actions</h2>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/admin/users')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition text-left"
                  >
                    <Users className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-semibold">Manage Users</p>
                      <p className="text-xs text-neutral-500">Promote to admin, deactivate, delete</p>
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

                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <UserCheck className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-bold uppercase tracking-wider text-neutral-500">Role Management</span>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      To assign the <strong className="text-indigo-600 dark:text-indigo-400">ADMIN</strong> role to a user, go to <strong>Manage Users</strong>, find the user, and click the <Shield className="w-3 h-3 inline" /> icon to toggle their role.
                    </p>
                  </div>
                </div>
              </div>

              {/* Activity feed with tabs */}
              <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
                <div className="flex border-b border-neutral-200 dark:border-neutral-800">
                  <button
                    onClick={() => setTab('activity')}
                    className={`flex-1 px-4 py-3 text-sm font-semibold text-center transition ${tab === 'activity' ? 'bg-neutral-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 border-b-2 border-indigo-500' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                  >
                    <Activity className="w-4 h-4 inline mr-1.5" />
                    Task Activity
                  </button>
                  <button
                    onClick={() => setTab('logins')}
                    className={`flex-1 px-4 py-3 text-sm font-semibold text-center transition ${tab === 'logins' ? 'bg-neutral-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 border-b-2 border-indigo-500' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                  >
                    <LogIn className="w-4 h-4 inline mr-1.5" />
                    Login Activity
                  </button>
                </div>

                <div className="p-6">
                  {tab === 'activity' ? (
                    <>
                      {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                        <div className="space-y-3 max-h-[360px] overflow-y-auto">
                          {stats.recentActivity.slice(0, 10).map((log) => (
                            <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800/60 last:border-0">
                              <div className="w-2 h-2 rounded-full bg-neutral-400 mt-2 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  Task <span className="capitalize">{log.action}</span>
                                  {log.user?.email && <span className="font-normal text-indigo-600 dark:text-indigo-400"> by {log.user.email}</span>}
                                  {log.task?.title && <span className="text-neutral-500"> &mdash; {log.task.title}</span>}
                                </p>
                                <p className="text-xs text-neutral-500 mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState icon={Activity} title="No recent activity" className="border-0 shadow-none py-8" />
                      )}
                    </>
                  ) : (
                    <>
                      {authLogsLoading ? (
                        <div className="space-y-3">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex gap-3"><Skeleton className="w-6 h-6 rounded-full shrink-0" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div></div>
                          ))}
                        </div>
                      ) : authLogs.length > 0 ? (
                        <div className="space-y-3 max-h-[360px] overflow-y-auto">
                          {authLogs.map((log) => (
                            <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800/60 last:border-0">
                              <div className="mt-1 shrink-0">{actionIcon(log.action)}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  <span className={log.action === 'LOGIN_FAILED' ? 'text-red-600 dark:text-red-400' : log.action === 'LOGIN_SUCCESS' ? 'text-green-600 dark:text-green-400' : ''}>
                                    {log.email}
                                  </span>
                                  <span className="text-neutral-500 font-normal"> {actionLabel(log.action)}</span>
                                </p>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                  {new Date(log.timestamp).toLocaleString()}
                                  {log.ip && <span className="ml-2 font-mono">({log.ip === '::1' ? 'localhost' : log.ip})</span>}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState icon={LogIn} title="No login activity" description="No login activity recorded yet." className="border-0 shadow-none py-8" />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      </div>
    </div>
  );
}