import { Task } from '../types';
import TaskCard from './TaskCard';
import LoadingSpinner from './LoadingSpinner';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
  onViewHistory: (task: Task) => void;
  onRetry: () => void;
  isAdmin?: boolean;
}

export default function TaskList({ 
  tasks, 
  isLoading, 
  error, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onViewHistory,
  onRetry,
  isAdmin
}: TaskListProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={onRetry} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Retry
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No tasks found. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map(task => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onEdit={onEdit} 
          onDelete={onDelete} 
          onToggleStatus={onToggleStatus} 
          onViewHistory={onViewHistory}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}
