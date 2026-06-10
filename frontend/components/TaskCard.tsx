import { Task } from '../types';
import clsx from 'clsx';
import { CheckCircle, Edit2, Trash2, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onToggleStatus }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const dueSoon = task.dueDate && new Date(task.dueDate).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000 && task.status !== 'DONE';

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 flex flex-col relative group border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className={clsx("text-lg font-semibold", {
          "text-gray-900": task.status !== 'DONE',
          "text-gray-400 line-through": task.status === 'DONE'
        })}>
          {task.title}
        </h3>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onToggleStatus(task)} 
            className={clsx("p-1 rounded hover:bg-gray-100", { "text-green-600": task.status === 'DONE', "text-gray-400": task.status !== 'DONE' })}
            title={task.status === 'DONE' ? 'Mark as Todo' : 'Mark as Done'}
          >
            <CheckCircle className="w-5 h-5" />
          </button>
          <button onClick={() => onEdit(task)} className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-100" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {task.description && <p className="text-gray-600 text-sm mb-4 flex-1">{task.description}</p>}
      
      <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-gray-100">
        <span className={clsx("text-xs px-2 py-1 rounded-full font-medium", {
          "bg-gray-100 text-gray-800": task.status === 'TODO',
          "bg-blue-100 text-blue-800": task.status === 'IN_PROGRESS',
          "bg-green-100 text-green-800": task.status === 'DONE',
        })}>
          {task.status.replace('_', ' ')}
        </span>
        <span className={clsx("text-xs px-2 py-1 rounded-full font-medium", {
          "bg-green-100 text-green-800": task.priority === 'LOW',
          "bg-yellow-100 text-yellow-800": task.priority === 'MEDIUM',
          "bg-red-100 text-red-800": task.priority === 'HIGH',
        })}>
          {task.priority}
        </span>
        {task.dueDate && (
          <div className={clsx("flex items-center text-xs ml-auto font-medium px-2 py-1 rounded-md", {
            "bg-red-100 text-red-800": isOverdue,
            "bg-orange-100 text-orange-800": !isOverdue && dueSoon,
            "text-gray-500": !isOverdue && !dueSoon,
          })}>
            <Clock className="w-3 h-3 mr-1" />
            {isOverdue ? 'Overdue' : new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
