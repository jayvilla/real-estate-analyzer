'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../stores/auth/auth-context';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    organizationName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.organizationName || undefined
      );
      router.push('/properties');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-display font-bold text-neutral-900 mb-2">
            Create Account
          </h2>
          <p className="text-neutral-600">Get started with your real estate portfolio</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-neutral-200/50 shadow-medium">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-neutral-500">Must be at least 8 characters</p>
            </div>

            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-neutral-700 mb-2">
                Organization Name
              </label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                required
                value={formData.organizationName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
                placeholder="My Real Estate Company"
              />
              <p className="mt-1 text-xs text-neutral-500">Your organization or portfolio name</p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-primary-600 hover:bg-brand-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-neutral-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-brand-primary-600 hover:text-brand-primary-500">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

