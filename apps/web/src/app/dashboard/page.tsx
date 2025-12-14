'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Navigation } from '../../components/shared/Navigation';
import { propertyApi, analyticsApi } from '../../lib/api';
import { useAuth } from '../../stores/auth/auth-context';
import Link from 'next/link';
import { Button } from '@real-estate-analyzer/ui';

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch quick stats
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: propertyApi.getAll,
  });

  const { data: dashboard } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsApi.getDashboard(),
    enabled: properties.length > 0,
  });

  const portfolioValue = dashboard?.portfolioSummary?.totalPortfolioValue || 0;
  const totalProperties = properties.length;
  const activeDeals = dashboard?.portfolioSummary?.activeDeals || 0;
  const monthlyCashFlow = dashboard?.portfolioSummary?.totalMonthlyCashFlow || 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 transition-colors duration-300">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Header */}
          <div className="mb-8 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-50 mb-2">
              Welcome back, {user?.firstName} 👋
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Here's an overview of your real estate portfolio
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/50 shadow-medium hover:shadow-large transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-1">
                {totalProperties}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Properties</div>
            </div>

            <div className="glass rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/50 shadow-medium hover:shadow-large transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-secondary-500 to-brand-secondary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-1">
                ${portfolioValue.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Portfolio Value</div>
            </div>

            <div className="glass rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/50 shadow-medium hover:shadow-large transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-accent-500 to-brand-accent-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-1">
                {activeDeals}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Active Deals</div>
            </div>

            <div className="glass rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/50 shadow-medium hover:shadow-large transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-1">
                ${monthlyCashFlow.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Monthly Cash Flow</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-neutral-900 dark:text-neutral-50 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/analytics">
                <div className="glass rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/50 shadow-medium hover:shadow-large transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
                        Analytics Dashboard
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        View comprehensive portfolio analytics and insights
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-neutral-400 dark:text-neutral-500 group-hover:text-brand-primary-600 dark:group-hover:text-brand-primary-400 group-hover:translate-x-1 transition-all duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>

              <Link href="/ai-insights">
                <div className="glass rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/50 shadow-medium hover:shadow-large transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
                        AI Insights
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Get AI-powered analysis and recommendations
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-neutral-400 dark:text-neutral-500 group-hover:text-brand-primary-600 dark:group-hover:text-brand-primary-400 group-hover:translate-x-1 transition-all duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>

              <Link href="/properties">
                <div className="glass rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/50 shadow-medium hover:shadow-large transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-7 h-7 text-white"
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
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
                        Manage Properties
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        View and manage your property portfolio
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-neutral-400 dark:text-neutral-500 group-hover:text-brand-primary-600 dark:group-hover:text-brand-primary-400 group-hover:translate-x-1 transition-all duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          {dashboard?.recentActivity && dashboard.recentActivity.length > 0 && (
            <div className="glass rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-medium overflow-hidden">
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-2xl font-display font-bold text-neutral-900 dark:text-neutral-50">
                  Recent Activity
                </h2>
              </div>
              <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {dashboard.recentActivity.slice(0, 5).map((activity, index) => (
                  <div
                    key={index}
                    className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-brand-primary-100 dark:bg-brand-primary-900/30 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-brand-primary-600 dark:text-brand-primary-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                          {activity.description}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

