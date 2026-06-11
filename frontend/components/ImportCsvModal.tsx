'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { useAdminCreateUsersBatch } from '../hooks/useAdmin';
import { useToast } from '../hooks/useToast';

interface ImportCsvModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportCsvModal({ onClose, onSuccess }: ImportCsvModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createBatch, isLoading } = useAdminCreateUsersBatch();
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          showToast('CSV must contain headers and at least one user', 'error');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const emailIndex = headers.indexOf('email');
        
        if (emailIndex === -1) {
          showToast('CSV must contain an "email" column', 'error');
          return;
        }

        const passwordIndex = headers.indexOf('password');
        const roleIndex = headers.indexOf('role');
        const isActiveIndex = headers.indexOf('isactive');

        if (roleIndex === -1 || isActiveIndex === -1) {
          showToast('CSV must contain "role" and "isActive" columns', 'error');
          return;
        }

        const users = lines.slice(1).map(line => {
          const cols = line.split(',').map(c => c.trim());
          return {
            email: cols[emailIndex],
            password: passwordIndex !== -1 && cols[passwordIndex] ? cols[passwordIndex] : undefined,
            role: cols[roleIndex],
            isActive: cols[isActiveIndex].toLowerCase() === 'true'
          };
        }).filter(u => u.email && u.role);

        const result = await createBatch(users);
        showToast(`Successfully created ${result.createdCount} users (Skipped ${result.skippedCount})`, 'success');
        onSuccess();
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
        showToast(axiosErr.response?.data?.message || axiosErr.message || 'Failed to import CSV', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full border border-neutral-200 dark:border-neutral-800/80 overflow-hidden transform transition-all duration-300 max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-800/60 shrink-0">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Import CSV</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto min-h-0">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-neutral-50/50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {file ? (
              <>
                <FileText className="w-10 h-10 text-neutral-900 dark:text-white mb-3" />
                <p className="font-semibold text-center text-neutral-900 dark:text-white">{file.name}</p>
                <p className="text-xs text-neutral-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-neutral-400 mb-3" />
                <p className="font-semibold text-center mb-1 text-neutral-900 dark:text-white">Click to upload CSV file</p>
                <p className="text-xs text-neutral-500 text-center">Required columns: email, role, isActive. Optional: password.</p>
              </>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100 dark:border-neutral-800/60 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none transition min-h-[44px]"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-black hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 dark:text-black focus:outline-none disabled:opacity-50 transition min-h-[44px]"
            >
              {isLoading ? 'Importing...' : 'Import Users'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
