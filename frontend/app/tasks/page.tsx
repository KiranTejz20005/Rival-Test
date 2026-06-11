'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTasks, useDeleteTask, useUpdateTask, useCreateTask } from '../../hooks/useTasks';
import { useToast } from '../../hooks/useToast';
import { useTheme } from '../../hooks/useTheme';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import TaskList from '../../components/TaskList';
import TaskFilters from '../../components/TaskFilters';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import TaskForm from '../../components/TaskForm';
import TaskHistoryModal from '../../components/TaskHistoryModal';
import AdminSidebar from '../../components/AdminSidebar';
import ProfileDropdown from '../../components/ProfileDropdown';
import { Plus, Sun, Moon, LayoutGrid, List, Calendar, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Task, CreateTaskRequest, UserOption } from '../../types';
import clsx from 'clsx';

export default function TasksPage() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const pageSize = 20;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [historyTask, setHistoryTask] = useState<Task | undefined>(undefined);
  const [users, setUsers] = useState<UserOption[]>([]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      api.get('/api/admin/users', { params: { pageSize: 100 } }).then(({ data }) => {
        setUsers(data.data.users.map((u: { id: string; email: string }) => ({ id: u.id, email: u.email })));
      }).catch(() => {});
    }
  }, [user?.role]);

  useEffect(() => {
    const savedView = localStorage.getItem('viewMode') as 'grid' | 'table';
    if (savedView === 'grid' || savedView === 'table') {
      setViewMode(savedView);
    }
  }, []);

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  const { tasks, total, isLoading: tasksLoading, error: tasksError, refetch } = useTasks({
    status: statusFilter,
    priority: priorityFilter,
    search,
    page,
    pageSize,
    sortBy,
    sortOrder
  });

  const { delete: deleteTask } = useDeleteTask();
  const { update: updateTask } = useUpdateTask();
  const { create: createTask } = useCreateTask();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        showToast('Task deleted', 'success');
        refetch();
      } catch {
        showToast('Failed to delete task', 'error');
      }
    }
  };

  const handleToggleStatus = async (task: Task) => {
    try {
      await updateTask(task.id, { status: task.status === 'DONE' ? 'TODO' : 'DONE' });
      showToast('Task updated', 'success');
      refetch();
    } catch {
      showToast('Failed to update task', 'error');
    }
  };

  const handleFormSubmit = async (data: CreateTaskRequest) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
        showToast('Task updated successfully', 'success');
      } else {
        await createTask(data);
        showToast('Task created successfully', 'success');
      }
      setIsFormOpen(false);
      setEditingTask(undefined);
      refetch();
    } catch {
      showToast('An error occurred while saving the task', 'error');
      throw new Error();
    }
  };

  if (authLoading || !isAuthenticated) return <LoadingSpinner fullScreen />;

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white dark:bg-neutral-900/40 border-b border-neutral-200 dark:border-neutral-800/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-4">
          <div className="flex-1">
            {user?.role !== 'ADMIN' && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
                  <span className="text-white dark:text-black font-black text-lg">R</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 hidden sm:block">Rival Tasks</h1>
              </div>
            )}
          </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search, Filter & Layout bar */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            <div className="flex-1 flex flex-col md:flex-row gap-3">
              <SearchBar onSearch={(val) => { setSearch(val); setPage(1); }} />
              <div className="overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <TaskFilters 
                  statusFilter={statusFilter} 
                  priorityFilter={priorityFilter} 
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onStatusChange={(val) => { setStatusFilter(val); setPage(1); }} 
                  onPriorityChange={(val) => { setPriorityFilter(val); setPage(1); }} 
                  onSortByChange={(val) => { setSortBy(val); setPage(1); }}
                  onSortOrderChange={(val) => { setSortOrder(val); setPage(1); }}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-3">
              {/* View Toggle */}
              <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-lg p-0.5 bg-white dark:bg-neutral-900 shadow-sm">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={clsx("p-1.5 rounded-md transition", {
                    "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100": viewMode === 'grid',
                    "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300": viewMode !== 'grid'
                  })}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleViewModeChange('table')}
                  className={clsx("p-1.5 rounded-md transition", {
                    "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100": viewMode === 'table',
                    "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300": viewMode !== 'table'
                  })}
                  title="Table List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={() => { setEditingTask(undefined); setIsFormOpen(true); }}
                className="flex items-center bg-black hover:bg-neutral-850 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content list or table */}
        {viewMode === 'grid' ? (
          <TaskList 
            tasks={tasks} 
            isLoading={tasksLoading} 
            error={tasksError} 
            onEdit={(task) => { setEditingTask(task); setIsFormOpen(true); }} 
            onDelete={handleDelete} 
            onToggleStatus={handleToggleStatus} 
            onViewHistory={(task) => setHistoryTask(task)}
            onRetry={refetch}
            isAdmin={user?.role === 'ADMIN'}
          />
        ) : (
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 shadow-sm overflow-hidden flex flex-col min-h-0">
            {tasksLoading ? (
              <div className="py-24">
                <LoadingSpinner />
              </div>
            ) : tasksError ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{tasksError}</p>
                <button onClick={refetch} className="bg-neutral-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-md hover:opacity-90">
                  Retry
                </button>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">No tasks found. Create one to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto min-h-0">
                <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 font-medium">
                      <th className="py-3.5 px-6 font-semibold">Title</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold">Priority</th>
                      <th className="py-3.5 px-4 font-semibold">Due Date</th>
                      {user?.role === 'ADMIN' && <th className="py-3.5 px-4 font-semibold">Creator</th>}
                      <th className="py-3.5 px-6 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                    {tasks.map(task => {
                      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                      const dueSoon = task.dueDate && new Date(task.dueDate).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000 && task.status !== 'DONE';

                      return (
                        <tr key={task.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/20 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex flex-col max-w-[300px] md:max-w-md">
                              <span className={clsx("font-medium text-neutral-900 dark:text-neutral-100 truncate", {
                                "line-through text-neutral-400 dark:text-neutral-500": task.status === 'DONE'
                              })}>
                                {task.title}
                              </span>
                              {task.description && (
                                <span className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5 truncate">
                                  {task.description}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={clsx("inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider", {
                              "bg-neutral-100 text-neutral-855 dark:bg-neutral-800 dark:text-neutral-300": task.status === 'TODO',
                              "bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400": task.status === 'IN_PROGRESS',
                              "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400": task.status === 'DONE',
                            })}>
                              <span className={clsx("w-1 h-1 rounded-full", {
                                "bg-neutral-600 dark:bg-neutral-400": task.status === 'TODO',
                                "bg-orange-500": task.status === 'IN_PROGRESS',
                                "bg-green-500": task.status === 'DONE',
                              })} />
                              {task.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={clsx("inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider", {
                              "bg-neutral-50 text-neutral-600 dark:bg-neutral-900/50 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800": task.priority === 'LOW',
                              "bg-yellow-50 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400": task.priority === 'MEDIUM',
                              "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400": task.priority === 'HIGH',
                            })}>
                              {task.priority === 'HIGH' && <AlertCircle className="w-2.5 h-2.5" />}
                              {task.priority}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {task.dueDate ? (
                              <span className={clsx("text-xs font-medium", {
                                "text-red-600 dark:text-red-400 font-semibold": isOverdue,
                                "text-orange-600 dark:text-orange-400": !isOverdue && dueSoon,
                                "text-neutral-500 dark:text-neutral-400": !isOverdue && !dueSoon,
                              })}>
                                {isOverdue ? 'Overdue' : new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            ) : (
                              <span className="text-neutral-400 dark:text-neutral-600 text-xs">-</span>
                            )}
                          </td>
                          {user?.role === 'ADMIN' && (
                            <td className="py-4 px-4 text-xs text-neutral-500 dark:text-neutral-400 max-w-[120px] truncate">
                              {task.createdBy?.email || '-'}
                            </td>
                          )}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleToggleStatus(task)} 
                                className={clsx("p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition", { 
                                  "text-green-650": task.status === 'DONE', 
                                  "text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100": task.status !== 'DONE' 
                                })}
                                title={task.status === 'DONE' ? 'Mark as Todo' : 'Mark as Done'}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setHistoryTask(task)} 
                                className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition" 
                                title="View History"
                              >
                                <Calendar className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => { setEditingTask(task); setIsFormOpen(true); }} 
                                className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition" 
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDelete(task.id)} 
                                className="p-1.5 text-neutral-400 hover:text-red-650 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition" 
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <Pagination 
          page={page} 
          total={total} 
          pageSize={pageSize} 
          onPageChange={setPage} 
        />
      </main>

      {isFormOpen && (
        <TaskForm
          initialData={editingTask}
          onSubmit={handleFormSubmit}
          onClose={() => { setIsFormOpen(false); setEditingTask(undefined); }}
          users={user?.role === 'ADMIN' ? users : undefined}
          isAdmin={user?.role === 'ADMIN'}
        />
      )}

      {historyTask && (
        <TaskHistoryModal
          taskId={historyTask.id}
          taskTitle={historyTask.title}
          onClose={() => setHistoryTask(undefined)}
        />
      )}
      </div>
    </div>
  );
}

