'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle2, Layout, Zap, Shield, ArrowRight } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-50 selection:bg-indigo-500/30 transition-colors duration-300">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6 max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center shadow-lg">
            <span className="text-white dark:text-black font-black text-xl transition-colors">R</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Rival Tasks</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white backdrop-blur-sm transition-all"
            title="Toggle Theme"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          {isAuthenticated ? (
            <button
              onClick={() => router.push('/tasks')}
              className="font-medium px-5 py-2.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all text-sm"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={() => router.push('/auth')}
              className="font-medium px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-sm hover:shadow-md transition-all text-sm hover:scale-105 active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-indigo-500/20 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-500/20 dark:bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-40 -right-20 w-72 h-72 bg-pink-500/20 dark:bg-pink-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 backdrop-blur-md mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Rival Tasks 1.0 is Live</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
            Manage your work with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">absolute clarity.</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A beautiful, intuitive, and lightning-fast task management platform designed to help individuals and teams achieve their goals without the clutter.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push(isAuthenticated ? '/tasks' : '/auth')}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-base shadow-xl shadow-black/10 dark:shadow-white/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              {isAuthenticated ? 'Enter Dashboard' : 'Get Started for Free'}
              <ArrowRight className="w-5 h-5" />
            </button>
            {!isAuthenticated && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium sm:ml-4">
                No credit card required.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50 dark:bg-neutral-900/20 backdrop-blur-3xl border-y border-neutral-200 dark:border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
              We stripped away the complexity, leaving only what you need to track tasks effectively and efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-yellow-500" />}
              title="Lightning Fast"
              description="Built on Next.js to provide an immediate, snappy experience. No loading spinners here."
            />
            <FeatureCard 
              icon={<Layout className="w-6 h-6 text-indigo-500" />}
              title="Beautiful UI"
              description="A pixel-perfect interface with dark mode support to keep your eyes rested."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-6 h-6 text-green-500" />}
              title="Stay Organized"
              description="Sort, filter, and prioritize tasks effortlessly to ensure you always hit your deadlines."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-red-500" />}
              title="Secure Platform"
              description="Enterprise-grade security using JSON Web Tokens to protect your data."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-200 dark:border-neutral-800 text-center">
        <p className="text-neutral-500 dark:text-neutral-500 text-sm">
          &copy; {new Date().getFullYear()} Rival Tasks. Built for high achievers.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow duration-300">
      <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
