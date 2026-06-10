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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-gray-500 mt-2">{isLogin ? 'Enter your credentials to access your tasks' : 'Sign up to start managing your tasks'}</p>
        </div>

        {isLogin ? (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                {...loginForm.register('email')}
                type="email"
                className={clsx("mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border", {
                  "border-red-500": loginForm.formState.errors.email
                })}
              />
              {loginForm.formState.errors.email && <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                {...loginForm.register('password')}
                type="password"
                className={clsx("mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border", {
                  "border-red-500": loginForm.formState.errors.password
                })}
              />
              {loginForm.formState.errors.password && <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.password.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loginForm.formState.isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loginForm.formState.isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                {...signupForm.register('email')}
                type="email"
                className={clsx("mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border", {
                  "border-red-500": signupForm.formState.errors.email
                })}
              />
              {signupForm.formState.errors.email && <p className="text-red-500 text-sm mt-1">{signupForm.formState.errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                {...signupForm.register('password')}
                type="password"
                className={clsx("mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border", {
                  "border-red-500": signupForm.formState.errors.password
                })}
              />
              {signupForm.formState.errors.password && <p className="text-red-500 text-sm mt-1">{signupForm.formState.errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                {...signupForm.register('confirmPassword')}
                type="password"
                className={clsx("mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border", {
                  "border-red-500": signupForm.formState.errors.confirmPassword
                })}
              />
              {signupForm.formState.errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{signupForm.formState.errors.confirmPassword.message}</p>}
            </div>
            <button
              type="submit"
              disabled={signupForm.formState.isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {signupForm.formState.isSubmitting ? 'Signing up...' : 'Sign up'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
