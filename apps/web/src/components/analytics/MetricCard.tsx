'use client';

import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'accent' | 'neutral';
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'primary',
}: MetricCardProps) {
  const colorClasses = {
    primary: 'bg-brand-primary-100 text-brand-primary-600',
    secondary: 'bg-brand-secondary-100 text-brand-secondary-600',
    accent: 'bg-brand-accent-100 text-brand-accent-600',
    neutral: 'bg-neutral-100 text-neutral-600',
  };

  return (
    <div className="glass rounded-3xl p-6 border border-neutral-200/50 shadow-medium hover:shadow-large transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-neutral-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="flex items-center mt-4">
          <span
            className={`text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-sm text-neutral-500 ml-2">vs previous period</span>
        </div>
      )}
    </div>
  );
}

