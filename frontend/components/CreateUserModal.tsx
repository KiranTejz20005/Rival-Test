'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAdminCreateUser } from '../hooks/useAdmin';
import { useToast } from '../hooks/useToast';

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUserModal({ onClose, onSuccess }: CreateUserModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [isActive, setIsActive] = useState(true);
  
  const { create, isLoading } = useAdminCreateUser();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Email and Password are required', 'error');
      return;
    }
    try {
      await create({ email, password, role, isActive });
      showToast('User created successfully', 'success');
      onSuccess();
    } catch (error: any) {
      showToast(error.response?.data?.message || error.message || 'Failed to create user', 'error');
    }
  };

  const inputClasses = "mt-1.5 block w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-neutral-350 p-2.5 text-sm transition-all duration-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full border border-neutral-200 dark:border-neutral-800/80 overflow-hidden transform transition-all duration-300">
        <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-800/60">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Create User</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputClasses}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white focus:ring-black dark:focus:ring-white"
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 cursor-pointer">Active Account</label>
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
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-black hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 dark:text-black focus:outline-none disabled:opacity-50 transition"
            >
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
