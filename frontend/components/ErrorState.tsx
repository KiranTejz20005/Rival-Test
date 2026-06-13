import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({ title = "Something went wrong", message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={clsx("flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900/30 shadow-sm", className)}>
      <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
      </div>
      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm mx-auto leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 justify-center px-4 py-2 border border-neutral-200 dark:border-neutral-800 text-sm font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
