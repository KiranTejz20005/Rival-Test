import { Task } from '../types';
import TaskCard from './TaskCard';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { TaskCardSkeleton } from './SkeletonLoader';
import { ClipboardList } from 'lucide-react';

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
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No tasks found"
        description="There are no tasks to display. Create a new task to get started."
      />
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
