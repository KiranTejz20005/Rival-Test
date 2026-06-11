import { useState, useEffect } from 'react';
import { X, Calendar, Info } from 'lucide-react';
import api from '../lib/api';
import type { ActivityLog } from '../types';

interface TaskHistoryModalProps {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
}

export default function TaskHistoryModal({ taskId, taskTitle, onClose }: TaskHistoryModalProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get(`/api/tasks/${taskId}/activity`);
        setLogs(data.data);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Failed to load task history');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [taskId]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] border border-neutral-200 dark:border-neutral-800/80">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-950">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Task Activity History</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate max-w-[320px]">{taskTitle}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 dark:text-neutral-300">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : logs.length === 0 ? (
            <div className="text-neutral-500 text-center py-8">No activity recorded for this task.</div>
          ) : (
            <div className="relative border-l border-neutral-200 dark:border-neutral-800 ml-3 space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6">
                  <span className="absolute -left-2.5 top-1.5 flex items-center justify-center w-5 h-5 rounded-full ring-4 ring-white dark:ring-neutral-900 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                    <Info className="w-3 h-3" />
                  </span>

                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                      Task {log.action}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleString()}
                    </span>

                    {log.changes && log.changes.length > 0 && (
                      <div className="mt-2 text-xs bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 space-y-1">
                        {log.changes.map((change, index: number) => {
                          const formatValue = (field: string, val: unknown) => {
                            if (val === null || val === undefined) return '';
                            if (field === 'dueDate') {
                              return new Date(val).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                            }
                            return String(val);
                          };

                          return (
                            <div key={index} className="text-neutral-600 dark:text-neutral-400">
                              <span className="font-semibold text-neutral-700 dark:text-neutral-300 capitalize mr-1">{change.field}:</span>
                              {change.oldValue !== null && change.oldValue !== undefined ? (
                                <>
                                  <span className="line-through text-red-500 bg-red-50 dark:bg-red-950/20 px-1 rounded">{formatValue(change.field, change.oldValue)}</span>
                                  <span className="mx-1">→</span>
                                </>
                              ) : null}
                              <span className="text-green-600 bg-green-50 dark:bg-green-950/20 px-1 rounded font-medium">{formatValue(change.field, change.newValue)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
