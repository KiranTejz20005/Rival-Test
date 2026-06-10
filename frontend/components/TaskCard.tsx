import { Task } from '../types';
import clsx from 'clsx';
import { CheckCircle, Edit2, Trash2, Clock, History } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
  onViewHistory: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onToggleStatus, onViewHistory }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const dueSoon = task.dueDate && new Date(task.dueDate).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000 && task.status !== 'DONE';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow hover:shadow-md transition-shadow p-6 flex flex-col relative group border border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-start mb-4">
        <h3 className={clsx("text-lg font-semibold", {
          "text-gray-900 dark:text-gray-100": task.status !== 'DONE',
          "text-gray-400 dark:text-gray-600 line-through": task.status === 'DONE'
        })}>
          {task.title}
        </h3>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onToggleStatus(task)} 
            className={clsx("p-1 rounded hover:bg-gray-150 dark:hover:bg-gray-800", { "text-green-600": task.status === 'DONE', "text-gray-400": task.status !== 'DONE' })}
            title={task.status === 'DONE' ? 'Mark as Todo' : 'Mark as Done'}
          >
            <CheckCircle className="w-5 h-5" />
          </button>
          <button onClick={() => onViewHistory(task)} className="p-1 text-gray-400 hover:text-purple-600 rounded hover:bg-gray-150 dark:hover:bg-gray-800" title="View History">
            <History className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(task)} className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-150 dark:hover:bg-gray-800" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-gray-150 dark:hover:bg-gray-800" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {task.description && <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">{task.description}</p>}
      
      <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
        <span className={clsx("text-xs px-2 py-1 rounded-full font-medium", {
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200": task.status === 'TODO',
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300": task.status === 'IN_PROGRESS',
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300": task.status === 'DONE',
        })}>
          {task.status.replace('_', ' ')}
        </span>
        <span className={clsx("text-xs px-2 py-1 rounded-full font-medium", {
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300": task.priority === 'LOW',
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300": task.priority === 'MEDIUM',
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300": task.priority === 'HIGH',
        })}>
          {task.priority}
        </span>
        {task.dueDate && (
          <div className={clsx("flex items-center text-xs ml-auto font-medium px-2 py-1 rounded-md", {
            "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300": isOverdue,
            "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300": !isOverdue && dueSoon,
            "text-gray-500 dark:text-gray-400": !isOverdue && !dueSoon,
          })}>
            <Clock className="w-3 h-3 mr-1" />
            {isOverdue ? 'Overdue' : new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
