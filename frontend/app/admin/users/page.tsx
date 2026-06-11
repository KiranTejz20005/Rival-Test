'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useAdminUsers, useAdminUserTasks, useAdminUpdateUser, useAdminDeleteUser } from '../../../hooks/useAdmin';
import { useToast } from '../../../hooks/useToast';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../../components/LoadingSpinner';
import SearchBar from '../../../components/SearchBar';
import Pagination from '../../../components/Pagination';
import AdminSidebar from '../../../components/AdminSidebar';
import { LogOut, ArrowLeft, Search, Shield, ShieldOff, Trash2, Eye, X, CheckCircle, Clock, AlertTriangle, ListTodo } from 'lucide-react';
import clsx from 'clsx';
import { Task, User } from '../../../types';

export default function AdminUsersPage() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userTasksPage, setUserTasksPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/auth');
    if (!authLoading && isAuthenticated && user?.role !== 'ADMIN') router.push('/tasks');
  }, [isAuthenticated, authLoading, user, router]);

  const pageSize = 20;
  const { users, total, isLoading, error, refetch } = useAdminUsers({ search, page, pageSize });
  const { tasks: userTasks, total: userTasksTotal, isLoading: userTasksLoading, refetch: refetchUserTasks } = useAdminUserTasks(
    selectedUser?.id || '',
    { page: userTasksPage, pageSize: 10 }
  );
  const { update: updateUser } = useAdminUpdateUser();
  const { delete: deleteUser } = useAdminDeleteUser();

  if (authLoading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      await updateUser(userId, { isActive: !currentActive });
      showToast(`User ${currentActive ? 'deactivated' : 'activated'}`, 'success');
      refetch();
    } catch {
      showToast('Failed to update user', 'error');
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
      await updateUser(userId, { role: newRole });
      showToast(`User role changed to ${newRole}`, 'success');
      refetch();
    } catch {
      showToast('Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This will also delete all their tasks.`)) return;
    try {
      await deleteUser(userId);
      showToast('User deleted', 'success');
      if (selectedUser?.id === userId) setSelectedUser(null);
      refetch();
    } catch {
      showToast('Failed to delete user', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white dark:bg-neutral-900/40 border-b border-neutral-200 dark:border-neutral-800/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-black text-lg">U</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">User Management</h1>
          </div>
          <div className="flex items-center gap-3">
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Users table */}
          <div className={clsx("flex-1", selectedUser && "hidden lg:block")}>
            <div className="mb-4">
              <SearchBar onSearch={(val) => { setSearch(val); setPage(1); }} placeholder="Search users by email..." />
            </div>

            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={refetch} className="bg-neutral-900 text-white px-4 py-2 rounded-md hover:opacity-90">Retry</button>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16 text-neutral-500">
                <p>No users found.</p>
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 font-medium">
                          <th className="py-3 px-4 font-semibold">Email</th>
                          <th className="py-3 px-4 font-semibold">Role</th>
                          <th className="py-3 px-4 font-semibold">Status</th>
                          <th className="py-3 px-4 font-semibold">Tasks</th>
                          <th className="py-3 px-4 font-semibold">Joined</th>
                          <th className="py-3 px-4 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/20 transition-colors">
                            <td className="py-3 px-4 font-medium truncate max-w-[200px]">{u.email}</td>
                            <td className="py-3 px-4">
                              <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider", {
                                "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400": u.role === 'ADMIN',
                                "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300": u.role !== 'ADMIN',
                              })}>{u.role}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider", {
                                "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400": u.isActive,
                                "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400": !u.isActive,
                              })}>{u.isActive ? 'Active' : 'Inactive'}</span>
                            </td>
                            <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{u._count?.tasks ?? 0}</td>
                            <td className="py-3 px-4 text-neutral-500 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => { setSelectedUser(u); setUserTasksPage(1); }} className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition" title="View details">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleToggleActive(u.id, u.isActive ?? true)} className="p-1.5 text-neutral-400 hover:text-amber-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition" title={u.isActive ? 'Deactivate' : 'Activate'}>
                                  {u.isActive ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                </button>
                                <button onClick={() => handleToggleRole(u.id, u.role ?? 'USER')} className="p-1.5 text-neutral-400 hover:text-indigo-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition" title="Toggle role">
                                  {u.role === 'ADMIN' ? <Shield className="w-4 h-4 text-indigo-500" /> : <ShieldOff className="w-4 h-4" />}
                                </button>
                                <button onClick={() => handleDeleteUser(u.id, u.email)} className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition" title="Delete user">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage} />
              </>
            )}
          </div>

          {/* User detail panel */}
          {selectedUser && (
            <div className="w-full lg:w-96 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm h-fit lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold truncate">{selectedUser.email}</h2>
                <button onClick={() => setSelectedUser(null)} className="p-1 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition lg:hidden">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between"><span className="text-neutral-500">Role</span><span className="font-semibold">{selectedUser.role}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Status</span><span className={clsx("font-semibold", selectedUser.isActive ? 'text-green-600' : 'text-red-600')}>{selectedUser.isActive ? 'Active' : 'Inactive'}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Tasks</span><span className="font-semibold">{selectedUser._count?.tasks ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Joined</span><span className="font-semibold">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : '-'}</span></div>
              </div>

              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-2">
                <ListTodo className="w-4 h-4" />
                Recent Tasks
              </h3>
              {userTasksLoading ? (
                <LoadingSpinner />
              ) : userTasks.length === 0 ? (
                <p className="text-neutral-500 text-sm">No tasks</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {userTasks.map((t) => (
                    <div key={t.id} className="flex items-start gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-850/50">
                      <div className={clsx("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", {
                        "bg-green-500": t.status === 'DONE',
                        "bg-orange-500": t.status === 'IN_PROGRESS',
                        "bg-neutral-400": t.status === 'TODO',
                      })} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{t.title}</p>
                        <p className="text-[10px] text-neutral-500">{t.status.replace('_', ' ')} &middot; {t.priority}</p>
                      </div>
                    </div>
                  ))}
                  {userTasksTotal > 10 && (
                    <button onClick={() => setUserTasksPage(p => p + 1)} className="text-xs text-indigo-600 hover:underline">
                      Load more...
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}