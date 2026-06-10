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
import { LogOut, Plus } from 'lucide-react';
import { Task, CreateTaskRequest } from '../../types';

export default function TasksPage() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const { tasks, total, isLoading: tasksLoading, error: tasksError, refetch } = useTasks({
    status: statusFilter,
    priority: priorityFilter,
    search,
    page,
    pageSize
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
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
              onStatusChange={(val) => { setStatusFilter(val); setPage(1); }} 
              onPriorityChange={(val) => { setPriorityFilter(val); setPage(1); }} 
            />
          </div>
          <button 
            onClick={() => { setEditingTask(undefined); setIsFormOpen(true); }}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition w-full sm:w-auto justify-center"
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
    </div>
  );
}
