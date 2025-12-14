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
  if (!data || !Array.isArray(data) || data.length === 0) {
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

  return (
    <div className="glass rounded-3xl p-6 border border-neutral-200/50 shadow-medium">
      {title && (
        <h3 className="text-xl font-semibold text-neutral-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={yAxisFormatter}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [
              yAxisFormatter(value),
              dataKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            ]}
          />
          <Legend />
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

