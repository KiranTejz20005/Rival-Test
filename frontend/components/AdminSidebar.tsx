'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { Shield, ListTodo, Users, LogOut, Moon, Sun, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { useState, useEffect } from 'react';

export default function AdminSidebar() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  const links = [
    { href: '/tasks', label: 'All Tasks', icon: ListTodo },
    { href: '/admin', label: 'Dashboard', icon: Shield },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col sticky top-0 h-screen transition-colors duration-300 hidden md:flex">
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <span className="text-white font-black text-lg">A</span>
        </div>
        <div className="overflow-hidden">
          <h1 className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50 truncate">Admin Panel</h1>
          <p className="text-xs text-neutral-500 truncate" title={user.email}>{user.email}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Navigation</p>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                {
                  "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400": isActive,
                  "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100": !isActive,
                }
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-all duration-200"
        >
          {isDarkMode ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={async () => { await logout(); router.push('/auth'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
