import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema } from '../lib/validation';
import { z } from 'zod';
import clsx from 'clsx';
import { CreateTaskRequest, Task } from '../types';
import { X } from 'lucide-react';

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: CreateTaskRequest) => Promise<void>;
  onClose: () => void;
}

export default function TaskForm({ initialData, onSubmit, onClose }: TaskFormProps) {
  const isEdit = !!initialData;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      status: initialData?.status || 'TODO',
      priority: initialData?.priority || 'MEDIUM',
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : ''
    }
  });

  const handleFormSubmit = async (data: TaskFormValues) => {
    try {
      await onSubmit({
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined
      });
    } catch (error) {
      // Error handled by parent
    }
  };

  const inputClasses = "mt-1.5 block w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-neutral-350 p-2.5 text-sm transition-all duration-200";

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800/80 overflow-hidden transform transition-all duration-300">
        <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-800/60">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50">{isEdit ? 'Edit Task' : 'Create Task'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
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
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Due Date</label>
            <input
              type="date"
              {...register('dueDate')}
              className={inputClasses}
            />
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-black hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 dark:text-black focus:outline-none disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

