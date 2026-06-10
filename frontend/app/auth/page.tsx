'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToast } from '../../hooks/useToast';
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, signupSchema } from '../../lib/validation';
import { z } from 'zod';
import clsx from 'clsx';

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/tasks');
    }
  }, [isAuthenticated, router]);

  const loginForm = useReactHookForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const signupForm = useReactHookForm<SignupFormValues>({
    resolver: zodResolver(signupSchema)
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      showToast('Successfully logged in!', 'success');
      router.push('/tasks');
    } catch (err: any) {
      // Error handled by hook, but toast can be shown
      showToast(err.response?.data?.error || 'Login failed', 'error');
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    try {
      await signup(data.email, data.password);
      showToast('Account created successfully!', 'success');
      router.push('/tasks');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Signup failed', 'error');
    }
  };

  if (isLoading || isAuthenticated) return null;

  return (
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{isLogin ? 'Sign In' : 'Create Account'}</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm">
            {isLogin ? 'Enter your credentials to access your tasks' : 'Sign up to start managing your tasks'}
          </p>
        </div>

        {isLogin ? (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Email</label>
              <input
                {...loginForm.register('email')}
                type="email"
                className={clsx(
                  "block w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2 text-sm text-neutral-900 dark:text-neutral-50 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:border-white dark:focus:ring-white transition",
                  { "border-red-500 dark:border-red-500": loginForm.formState.errors.email }
                )}
                placeholder="you@example.com"
              />
              {loginForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Password</label>
              <input
                {...loginForm.register('password')}
                type="password"
                className={clsx(
                  "block w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2 text-sm text-neutral-900 dark:text-neutral-50 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:border-white dark:focus:ring-white transition",
                  { "border-red-500 dark:border-red-500": loginForm.formState.errors.password }
                )}
                placeholder="••••••••"
              />
              {loginForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loginForm.formState.isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              {loginForm.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Email</label>
              <input
                {...signupForm.register('email')}
                type="email"
                className={clsx(
                  "block w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2 text-sm text-neutral-900 dark:text-neutral-50 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:border-white dark:focus:ring-white transition",
                  { "border-red-500 dark:border-red-500": signupForm.formState.errors.email }
                )}
                placeholder="you@example.com"
              />
              {signupForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Password</label>
              <input
                {...signupForm.register('password')}
                type="password"
                className={clsx(
                  "block w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2 text-sm text-neutral-900 dark:text-neutral-50 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:border-white dark:focus:ring-white transition",
                  { "border-red-500 dark:border-red-500": signupForm.formState.errors.password }
                )}
                placeholder="••••••••"
              />
              {signupForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Confirm Password</label>
              <input
                {...signupForm.register('confirmPassword')}
                type="password"
                className={clsx(
                  "block w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2 text-sm text-neutral-900 dark:text-neutral-50 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:border-white dark:focus:ring-white transition",
                  { "border-red-500 dark:border-red-500": signupForm.formState.errors.confirmPassword }
                )}
                placeholder="••••••••"
              />
              {signupForm.formState.errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.confirmPassword.message}</p>}
            </div>
            <button
              type="submit"
              disabled={signupForm.formState.isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              {signupForm.formState.isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white font-semibold underline underline-offset-4"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
