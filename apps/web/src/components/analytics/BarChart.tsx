'use client';

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../stores/theme/theme-context';

interface BarChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  dataKey?: string;
  color?: string;
  yAxisFormatter?: (value: number) => string;
}

export function BarChart({
  data,
  title,
  dataKey = 'value',
  color = '#3b82f6',
  yAxisFormatter = (value) => `$${value.toLocaleString()}`,
}: BarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="glass rounded-3xl p-6 border border-neutral-200/50 dark:border-neutral-700/50 shadow-medium">
        {title && (
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">{title}</h3>
        )}
        <div className="flex items-center justify-center h-[300px] text-neutral-500 dark:text-neutral-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-6 border border-neutral-200/50 dark:border-neutral-700/50 shadow-medium">
      {title && (
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
          <XAxis
            dataKey="name"
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px' }}
            tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px' }}
            tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
            tickFormatter={yAxisFormatter}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : 'white',
              border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
              borderRadius: '8px',
              color: isDark ? '#f9fafb' : '#111827',
            }}
            formatter={(value: number) => [
              yAxisFormatter(value),
              dataKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            ]}
          />
          <Legend 
            wrapperStyle={{ color: isDark ? '#9ca3af' : '#6b7280' }}
          />
          <Bar
            dataKey={dataKey}
            fill={color}
            radius={[8, 8, 0, 0]}
            name={dataKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

