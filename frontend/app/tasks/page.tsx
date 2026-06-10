'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTasks, useDeleteTask, useUpdateTask, useCreateTask } from '../../hooks/useTasks';
import { useToast } from '../../hooks/useToast';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../components/LoadingSpinner';
import TaskList from '../../components/TaskList';
import TaskFilters from '../../components/TaskFilters';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import TaskForm from '../../components/TaskForm';
import TaskHistoryModal from '../../components/TaskHistoryModal';
import { LogOut, Plus, Sun, Moon } from 'lucide-react';
import { Task, CreateTaskRequest } from '../../types';

export default function TasksPage() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [allUsers, setAllUsers] = useState(false);
  const pageSize = 20;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [historyTask, setHistoryTask] = useState<Task | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const { tasks, total, isLoading: tasksLoading, error: tasksError, refetch } = useTasks({
    status: statusFilter,
    priority: priorityFilter,
    search,
    page,
    pageSize,
    sortBy,
    sortOrder,
    allUsers
  });

  const { delete: deleteTask } = useDeleteTask();
  const { update: updateTask } = useUpdateTask();
  const { create: createTask } = useCreateTask();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = () => {
    logout();
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-900 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Tasks</h1>
          <div className="flex items-center gap-4">
            {user?.role === 'ADMIN' && (
              <label className="flex items-center gap-2 cursor-pointer bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-1.5 rounded-full font-semibold dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300">
                <input 
                  type="checkbox" 
                  checked={allUsers} 
                  onChange={(e) => { setAllUsers(e.target.checked); setPage(1); }} 
                  className="rounded text-amber-600 focus:ring-amber-500 border-amber-300 dark:border-amber-700"
                />
                Admin: Show All Users' Tasks
              </label>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <span className="text-sm text-gray-650 dark:text-gray-405">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <LogOut className="w-5 h-5 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex-1 w-full flex flex-col sm:flex-row gap-4">
            <SearchBar onSearch={(val) => { setSearch(val); setPage(1); }} />
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
          <button 
            onClick={() => { setEditingTask(undefined); setIsFormOpen(true); }}
            className="flex items-center bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black px-4 py-2 rounded-lg font-semibold transition w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5 mr-1" />
            New Task
          </button>
        </div>

        <TaskList 
          tasks={tasks} 
          isLoading={tasksLoading} 
          error={tasksError} 
          onEdit={(task) => { setEditingTask(task); setIsFormOpen(true); }} 
          onDelete={handleDelete} 
          onToggleStatus={handleToggleStatus} 
          onViewHistory={(task) => setHistoryTask(task)}
          onRetry={refetch}
        />

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
  );
}
