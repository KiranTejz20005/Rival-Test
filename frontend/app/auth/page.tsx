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
import LoadingSpinner from '../../components/LoadingSpinner';
import { Eye, EyeOff } from 'lucide-react';

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user, login, signup, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/tasks');
      }
    }
  }, [isAuthenticated, user, router]);

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
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      showToast(axiosErr.response?.data?.error || 'Login failed', 'error');
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    try {
      await signup(data.email, data.password);
      showToast('Account created successfully!', 'success');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      showToast(axiosErr.response?.data?.error || 'Signup failed', 'error');
    }
  };

  if (isLoading || isAuthenticated) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div suppressHydrationWarning className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4 transition-colors duration-200">
      <div suppressHydrationWarning className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-2xl p-8">
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
              <div className="relative">
                <input
                  {...loginForm.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={clsx(
                    "block w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2 pr-10 text-sm text-neutral-900 dark:text-neutral-50 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:border-white dark:focus:ring-white transition",
                    { "border-red-500 dark:border-red-500": loginForm.formState.errors.password }
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
              <div className="relative">
                <input
                  {...signupForm.register('password')}
                  type={showSignupPassword ? 'text' : 'password'}
                  className={clsx(
                    "block w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2 pr-10 text-sm text-neutral-900 dark:text-neutral-50 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:border-white dark:focus:ring-white transition",
                    { "border-red-500 dark:border-red-500": signupForm.formState.errors.password }
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition"
                >
                  {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {signupForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <input
                  {...signupForm.register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={clsx(
                    "block w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2 pr-10 text-sm text-neutral-900 dark:text-neutral-50 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:border-white dark:focus:ring-white transition",
                    { "border-red-500 dark:border-red-500": signupForm.formState.errors.confirmPassword }
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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

        <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mb-3 font-semibold uppercase tracking-wider">For Testing Purposes</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                loginForm.setValue('email', 'admin@mail.com');
                loginForm.setValue('password', 'Test@1234');
                onLoginSubmit({ email: 'admin@mail.com', password: 'Test@1234' });
              }}
              className="flex-1 py-2 px-3 rounded-md bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition border border-neutral-200 dark:border-neutral-800"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                loginForm.setValue('email', 'testuser@mail.com');
                loginForm.setValue('password', 'Test@1234');
                onLoginSubmit({ email: 'testuser@mail.com', password: 'Test@1234' });
              }}
              className="flex-1 py-2 px-3 rounded-md bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition border border-neutral-200 dark:border-neutral-800"
            >
              Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
