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
import { MarketTrend } from '@real-estate-analyzer/types';

interface MarketTrendChartProps {
  trend: MarketTrend;
  metric?: 'price' | 'rent';
}

export function MarketTrendChart({ trend, metric = 'price' }: MarketTrendChartProps) {
  if (!trend.dataPoints || trend.dataPoints.length === 0) {
    return (
      <div className="glass rounded-3xl p-6 border border-neutral-200/50 shadow-medium flex items-center justify-center h-[300px] text-neutral-500">
        No market data available
      </div>
    );
  }

  const chartData = trend.dataPoints.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }),
    price: point.medianPrice,
    rent: point.medianRent,
    fullDate: point.date,
  }));

  const dataKey = metric === 'price' ? 'price' : 'rent';
  const color = metric === 'price' ? '#3b82f6' : '#10b981';
  const title = metric === 'price' ? 'Price Trend' : 'Rental Trend';

  return (
    <div className="glass rounded-3xl p-6 border border-neutral-200/50 shadow-medium">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-neutral-900">{title}</h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${
            trend.trend === 'up' ? 'text-brand-accent-600' :
            trend.trend === 'down' ? 'text-red-600' :
            'text-neutral-600'
          }`}>
            {trend.trend === 'up' ? '↑' : trend.trend === 'down' ? '↓' : '→'} {trend.trend}
          </span>
        </div>
      </div>
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
              `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
              title,
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
            name={title}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

