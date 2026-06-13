import { Task, Attachment } from '../types';
import clsx from 'clsx';
import { CheckCircle, Edit2, Trash2, Calendar, AlertCircle, User, Shield, Paperclip } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  attachments?: Attachment[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
  onViewHistory: (task: Task) => void;
  isAdmin?: boolean;
}

export default function TaskCard({ task, attachments, onEdit, onDelete, onToggleStatus, onViewHistory, isAdmin }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const dueSoon = task.dueDate && new Date(task.dueDate).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000 && task.status !== 'DONE';

  return (
    <div className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-sm hover:shadow-neutral-200 dark:hover:shadow-none transition-all duration-300 flex flex-col justify-between h-[180px]">
      <div>
        <div className="flex justify-between items-start gap-3">
          <h3 className={clsx("font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight line-clamp-1 text-base", {
            "text-neutral-400 dark:text-neutral-600 line-through": task.status === 'DONE'
          })}>
            {task.title}
          </h3>
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button 
              onClick={() => onToggleStatus(task)} 
              className={clsx("p-1 rounded-md hover:bg-neutral-105 dark:hover:bg-neutral-800 transition", { 
                "text-green-600": task.status === 'DONE', 
                "text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100": task.status !== 'DONE' 
              })}
              title={task.status === 'DONE' ? 'Mark as Todo' : 'Mark as Done'}
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onViewHistory(task)} 
              className="p-1 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md hover:bg-neutral-105 dark:hover:bg-neutral-800 transition" 
              title="View History"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onEdit(task)} 
              className="p-1 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md hover:bg-neutral-105 dark:hover:bg-neutral-800 transition" 
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => onDelete(task.id)} 
              className="p-1 text-neutral-400 dark:text-neutral-500 hover:text-red-650 rounded-md hover:bg-red-500/10 dark:hover:bg-red-500/20 transition" 
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {task.description && (
          <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-2 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
        {attachments && attachments.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-neutral-400 dark:text-neutral-500">
            <Paperclip className="w-3 h-3" />
            <span>{attachments.length} file{attachments.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/60">
        <div className="flex items-center gap-2">
          {/* Status badge */}
          <span className={clsx("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider", {
            "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300": task.status === 'TODO',
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

          {/* Priority badge */}
          <span className={clsx("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider", {
            "bg-neutral-50 text-neutral-600 dark:bg-neutral-900/50 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800": task.priority === 'LOW',
            "bg-yellow-50 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400": task.priority === 'MEDIUM',
            "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400": task.priority === 'HIGH',
          })}>
            {task.priority === 'HIGH' && <AlertCircle className="w-2.5 h-2.5" />}
            {task.priority}
          </span>

          {isAdmin && (
            <>
              {task.user?.email && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 max-w-[100px] sm:max-w-[120px]" title={task.user.email}>
                  <User className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{task.user.email.split('@')[0]}</span>
                </span>
              )}
              {task.assignedRole && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50" title={`Assigned to all ${task.assignedRole}s`}>
                  <Shield className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{task.assignedRole}</span>
                </span>
              )}
            </>
          )}
        </div>

        {task.dueDate && (
          <span className={clsx("inline-flex items-center text-[11px] font-medium transition-colors", {
            "text-red-600 dark:text-red-400 font-semibold": isOverdue,
            "text-orange-600 dark:text-orange-400": !isOverdue && dueSoon,
            "text-neutral-400 dark:text-neutral-500": !isOverdue && !dueSoon,
          })}>
            {isOverdue ? 'Overdue' : new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}
