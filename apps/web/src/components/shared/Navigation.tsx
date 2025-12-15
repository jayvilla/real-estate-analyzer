'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../stores/auth/auth-context';
import { useTheme } from '../../stores/theme/theme-context';
import { Button } from '@real-estate-analyzer/ui';

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-200/50 dark:border-neutral-700/50 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Real Estate Analyzer</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">{user?.organization?.name || 'Portfolio'}</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-brand-primary-600 dark:hover:text-brand-primary-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              href="/properties"
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-brand-primary-600 dark:hover:text-brand-primary-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200"
            >
              Properties
            </Link>
            <Link
              href="/deals"
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-brand-primary-600 dark:hover:text-brand-primary-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200"
            >
              Deals
            </Link>
            <Link
              href="/analytics"
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-brand-primary-600 dark:hover:text-brand-primary-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200"
            >
              Analytics
            </Link>
            <Link
              href="/ai-insights"
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-brand-primary-600 dark:hover:text-brand-primary-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200"
            >
              AI Insights
            </Link>
          </div>

          {/* User Menu & Logout */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{user?.email}</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="px-4 py-2 text-sm font-medium border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

