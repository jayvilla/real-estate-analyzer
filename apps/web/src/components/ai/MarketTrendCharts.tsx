'use client';

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MarketTrend } from '@real-estate-analyzer/types';

interface MarketTrendChartsProps {
  trend: MarketTrend;
  className?: string;
}

export function MarketTrendCharts({ trend, className }: MarketTrendChartsProps) {
  // Prepare chart data
  const priceData = trend.dataPoints.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }),
    price: point.medianPrice,
    inventory: point.inventoryCount,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Price Trend Chart */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Price Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={priceData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
              }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Chart */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Inventory Levels</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="inventory"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <div className="text-xs text-gray-400 mb-1">30-Day Change</div>
          <div
            className={`text-lg font-semibold ${
              (trend.priceChange30Days || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {(trend.priceChange30Days || 0) >= 0 ? '+' : ''}
            {(trend.priceChange30Days || 0).toFixed(2)}%
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <div className="text-xs text-gray-400 mb-1">90-Day Change</div>
          <div
            className={`text-lg font-semibold ${
              (trend.priceChange90Days || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {(trend.priceChange90Days || 0) >= 0 ? '+' : ''}
            {(trend.priceChange90Days || 0).toFixed(2)}%
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <div className="text-xs text-gray-400 mb-1">1-Year Change</div>
          <div
            className={`text-lg font-semibold ${
              (trend.priceChange1Year || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {(trend.priceChange1Year || 0) >= 0 ? '+' : ''}
            {(trend.priceChange1Year || 0).toFixed(2)}%
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <div className="text-xs text-gray-400 mb-1">Appreciation Rate</div>
          <div className="text-lg font-semibold text-blue-400">
            {trend.averageAppreciationRate.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}

