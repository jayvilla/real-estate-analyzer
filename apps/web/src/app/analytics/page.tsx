'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Navigation } from '../../components/shared/Navigation';
import { analyticsApi } from '../../lib/api';
import { MetricCard, LineChart, BarChart } from '../../components/analytics';
import { AnalyticsDashboard } from '@real-estate-analyzer/types';

function AnalyticsPageContent() {
  const {
    data: dashboard,
    isLoading,
    error,
  } = useQuery<AnalyticsDashboard>({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsApi.getDashboard(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Format portfolio summary for metric cards
  const portfolioMetrics = useMemo(() => {
    if (!dashboard || !dashboard.portfolioSummary) return null;

    const { portfolioSummary } = dashboard;

    return {
      totalValue: (portfolioSummary.totalPortfolioValue ?? 0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
      totalCashInvested: (portfolioSummary.totalCashInvested ?? 0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
      monthlyCashFlow: (portfolioSummary.totalMonthlyCashFlow ?? 0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      annualCashFlow: (portfolioSummary.totalAnnualCashFlow ?? 0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
      avgCapRate: portfolioSummary.averageCapRate
        ? `${portfolioSummary.averageCapRate.toFixed(2)}%`
        : 'N/A',
      avgCashOnCash: portfolioSummary.averageCashOnCashReturn
        ? `${portfolioSummary.averageCashOnCashReturn.toFixed(2)}%`
        : 'N/A',
    };
  }, [dashboard]);

  // Format top performers for bar chart
  const topPerformersData = useMemo(() => {
    if (!dashboard || !dashboard.topPerformers || !Array.isArray(dashboard.topPerformers)) return [];

    return dashboard.topPerformers.slice(0, 10).map((deal) => ({
      name: (deal.propertyAddress || 'Unknown').substring(0, 20) + ((deal.propertyAddress && deal.propertyAddress.length > 20) ? '...' : ''),
      value: deal.cashOnCashReturn ?? 0,
      fullAddress: deal.propertyAddress || 'Unknown',
    }));
  }, [dashboard]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 transition-colors duration-300">
        <div className="text-center">
          <div className="inline-block relative">
            <div className="w-16 h-16 border-4 border-brand-primary-200 dark:border-brand-primary-800 border-t-brand-primary-600 dark:border-t-brand-primary-500 rounded-full animate-spin"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-brand-secondary-600 dark:border-t-brand-secondary-500 rounded-full animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
            ></div>
          </div>
          <p className="mt-6 text-lg font-medium text-neutral-700 dark:text-neutral-300">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 transition-colors duration-300">
        <div className="text-center glass rounded-3xl p-12 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
            Error loading analytics
          </p>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please try again or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
        <Navigation />
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary-200 dark:bg-brand-primary-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary-200 dark:bg-brand-secondary-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float delay-300" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-50 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Comprehensive insights into your real estate portfolio
            </p>
          </div>

        {/* Portfolio Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-stagger-children">
          <MetricCard
            title="Total Portfolio Value"
            value={portfolioMetrics?.totalValue || '$0'}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            }
            color="primary"
          />
          <MetricCard
            title="Total Cash Invested"
            value={portfolioMetrics?.totalCashInvested || '$0'}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="secondary"
          />
          <MetricCard
            title="Monthly Cash Flow"
            value={portfolioMetrics?.monthlyCashFlow || '$0'}
            subtitle={`Annual: ${portfolioMetrics?.annualCashFlow || '$0'}`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            }
            color="accent"
          />
          <MetricCard
            title="Average Cap Rate"
            value={portfolioMetrics?.avgCapRate || 'N/A'}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
            color="neutral"
          />
          <MetricCard
            title="Avg Cash-on-Cash Return"
            value={portfolioMetrics?.avgCashOnCash || 'N/A'}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
            color="primary"
          />
          <MetricCard
            title="Active Deals"
            value={`${dashboard?.portfolioSummary?.activeDeals ?? 0} / ${dashboard?.portfolioSummary?.totalDeals ?? 0}`}
            subtitle={`${dashboard?.portfolioSummary?.totalProperties ?? 0} properties`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="secondary"
          />
        </div>

        {/* Charts Section */}
        {dashboard?.cashFlowTrend && dashboard?.portfolioGrowth && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <LineChart
              data={dashboard.cashFlowTrend}
              title="Cash Flow Trend"
              color="#3b82f6"
            />
            <LineChart
              data={dashboard.portfolioGrowth}
              title="Portfolio Growth"
              color="#10b981"
            />
          </div>
        )}

        {/* Top Performers */}
        {topPerformersData && topPerformersData.length > 0 && (
          <div className="mb-8 animate-fade-in-up delay-200">
            <BarChart
              data={topPerformersData}
              title="Top 10 Performers (Cash-on-Cash Return)"
              dataKey="value"
              color="#10b981"
              yAxisFormatter={(value) => `${value.toFixed(2)}%`}
            />
          </div>
        )}

        {/* Property Performance Table */}
        {dashboard.propertyPerformance && dashboard.propertyPerformance.length > 0 && (
          <div className="glass rounded-3xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-medium overflow-hidden mb-8 animate-fade-in-up delay-300">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-2xl font-display font-bold text-neutral-900 dark:text-neutral-50">
                Property Performance
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Deals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Cash Invested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Annual Cash Flow
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Avg Cap Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Avg Cash-on-Cash
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {dashboard.propertyPerformance.map((property) => (
                    <tr key={property.propertyId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                          {property.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
                        {property.totalDeals}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
                        ${(property.totalCashInvested ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
                        ${(property.totalAnnualCashFlow ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
                        {property.averageCapRate
                          ? `${property.averageCapRate.toFixed(2)}%`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
                        {property.averageCashOnCashReturn
                          ? `${property.averageCashOnCashReturn.toFixed(2)}%`
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AnalyticsPage() {
  return <AnalyticsPageContent />;
}

