'use client';

import { useToast } from '../hooks/useToast';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import clsx from 'clsx';

export default function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={clsx(
            "flex items-center p-4 min-w-[300px] rounded-md shadow-lg transition-all",
            {
              "bg-green-100 text-green-800 border border-green-200": toast.type === 'success',
              "bg-red-100 text-red-800 border border-red-200": toast.type === 'error',
              "bg-yellow-100 text-yellow-800 border border-yellow-200": toast.type === 'warning',
              "bg-blue-100 text-blue-800 border border-blue-200": toast.type === 'info',
            }
          )}
        >
          <div className="mr-3">
            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5" />}
            {toast.type === 'info' && <Info className="w-5 h-5" />}
          </div>
          <div className="flex-1 text-sm font-medium">{toast.message}</div>
          <button onClick={() => removeToast(toast.id)} className="ml-4 opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
