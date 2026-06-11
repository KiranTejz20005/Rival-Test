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
  const [isOpen, setIsOpen] = useState(false);



  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  const links = [
    { href: '/admin', label: 'Dashboard', icon: Shield },
    { href: '/tasks', label: 'All Tasks', icon: ListTodo },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-3 left-4 z-50 p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition"
        aria-label="Open Navigation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={clsx(
        "w-64 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col transition-transform duration-300 z-50",
        "fixed inset-y-0 left-0 md:sticky md:top-0 md:h-screen md:translate-x-0",
        {
          "-translate-x-full": !isOpen,
          "translate-x-0": isOpen
        }
      )}>
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <div className="overflow-hidden">
              <h1 className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50 truncate">Admin Panel</h1>
              <p className="text-xs text-neutral-500 truncate">Administrator</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Navigation</p>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <button
                key={link.href}
                onClick={() => { router.push(link.href); setIsOpen(false); }}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 min-h-[44px]",
                  {
                    "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400": isActive,
                    "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100": !isActive,
                  }
                )}
              >
                <Icon className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
