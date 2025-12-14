'use client';

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TimeSeriesMetrics } from '@real-estate-analyzer/types';

interface LineChartProps {
  data: TimeSeriesMetrics;
  title?: string;
  color?: string;
}

export function LineChart({ data, title, color = '#3b82f6' }: LineChartProps) {
  if (!data || !data.dataPoints || !Array.isArray(data.dataPoints)) {
    return (
      <div className="glass rounded-3xl p-6 border border-neutral-200/50 shadow-medium">
        {title && (
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">{title}</h3>
        )}
        <div className="flex items-center justify-center h-[300px] text-neutral-500">
          No data available
        </div>
      </div>
    );
  }

  // Format data for recharts
  const chartData = data.dataPoints.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }),
    value: point.value ?? 0,
    fullDate: point.date,
  }));

  return (
    <div className="glass rounded-3xl p-6 border border-neutral-200/50 shadow-medium">
      {title && (
        <h3 className="text-xl font-semibold text-neutral-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [
              `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              data.metric.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
            name={data.metric.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

