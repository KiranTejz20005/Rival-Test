import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema } from '../lib/validation';
import { z } from 'zod';
import clsx from 'clsx';
import { CreateTaskRequest, Task, UserOption } from '../types';
import { X, User, Shield } from 'lucide-react';

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: CreateTaskRequest) => Promise<void>;
  onClose: () => void;
  users?: UserOption[];
  isAdmin?: boolean;
}

export default function TaskForm({ initialData, onSubmit, onClose, users, isAdmin }: TaskFormProps) {
  const isEdit = !!initialData;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      status: initialData?.status || 'TODO',
      priority: initialData?.priority || 'MEDIUM',
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
      userId: initialData?.userId || '',
      assignedRole: (initialData?.assignedRole as '' | 'ADMIN' | 'USER') || ''
    }
  });

  const [assignType, setAssignType] = useState<'USER' | 'ROLE'>(initialData?.assignedRole ? 'ROLE' : 'USER');

  const handleFormSubmit = async (data: TaskFormValues) => {
    try {
      await onSubmit({
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        userId: isAdmin && assignType === 'USER' && data.userId ? data.userId : undefined,
        assignedRole: isAdmin && assignType === 'ROLE' && data.assignedRole ? data.assignedRole : undefined
      });
    } catch (error) {
      // Error handled by parent
    }
  };

  const inputClasses = "mt-1.5 block w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-neutral-350 p-2.5 text-sm transition-all duration-200 min-h-[44px]";

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800/80 overflow-hidden transform transition-all duration-300 max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-800/60 shrink-0">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50">{isEdit ? 'Edit Task' : 'Create Task'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4 overflow-y-auto min-h-0">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Title</label>
            <input
              {...register('title')}
              className={clsx(inputClasses, {
                "border-red-500 focus:ring-red-500 dark:focus:ring-red-500": errors.title
              })}
              placeholder="e.g. Design Landing Page"
            />
            {errors.title && <p className="text-red-550 text-xs mt-1 font-medium">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className={clsx(inputClasses, {
                "border-red-500 focus:ring-red-500 dark:focus:ring-red-500": errors.description
              })}
              placeholder="Provide a detailed description..."
            />
            {errors.description && <p className="text-red-555 text-xs mt-1 font-medium">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Status</label>
              <select
                {...register('status')}
                className={inputClasses}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Priority</label>
              <select
                {...register('priority')}
                className={inputClasses}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Deadline</label>
            <input
              type="date"
              {...register('dueDate')}
              className={clsx(inputClasses, {
                "border-red-500 focus:ring-red-500 dark:focus:ring-red-500": errors.dueDate
              })}
            />
            {errors.dueDate && <p className="text-red-550 text-xs mt-1 font-medium">{errors.dueDate.message}</p>}
          </div>

          {isAdmin && users && (
            <div className="bg-neutral-50 dark:bg-neutral-800/30 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4 mt-2">
              <div className="flex gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input type="radio" checked={assignType === 'USER'} onChange={() => setAssignType('USER')} className="text-indigo-600 focus:ring-indigo-500" />
                  <User className="w-4 h-4 text-neutral-500" />
                  Assign to User
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input type="radio" checked={assignType === 'ROLE'} onChange={() => setAssignType('ROLE')} className="text-indigo-600 focus:ring-indigo-500" />
                  <Shield className="w-4 h-4 text-neutral-500" />
                  Assign to Role
                </label>
              </div>

              {assignType === 'USER' ? (
                <div>
                  <select
                    {...register('userId')}
                    className={inputClasses}
                  >
                    <option value="">{initialData ? 'Keep current owner' : 'Select a user...'}</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.email}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <select
                    {...register('assignedRole')}
                    className={inputClasses}
                  >
                    <option value="">Select a role...</option>
                    <option value="USER">All Users</option>
                    <option value="ADMIN">All Admins</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800/60 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none transition min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-black hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 dark:text-black focus:outline-none disabled:opacity-50 transition min-h-[44px]"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

