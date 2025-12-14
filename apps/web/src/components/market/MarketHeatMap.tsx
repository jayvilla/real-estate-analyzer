'use client';

import React from 'react';
import { MarketHeatMapData } from '@real-estate-analyzer/types';

interface MarketHeatMapProps {
  data: MarketHeatMapData[];
}

export function MarketHeatMap({ data }: MarketHeatMapProps) {
  if (!data || data.length === 0) {
    return (
      <div className="glass rounded-3xl p-6 border border-neutral-200/50 shadow-medium flex items-center justify-center h-[400px] text-neutral-500">
        No heat map data available
      </div>
    );
  }

  const getColorClass = (color: MarketHeatMapData['color']) => {
    switch (color) {
      case 'green':
        return 'bg-brand-accent-500 text-white';
      case 'yellow':
        return 'bg-yellow-500 text-white';
      case 'orange':
        return 'bg-orange-500 text-white';
      case 'red':
        return 'bg-red-500 text-white';
      default:
        return 'bg-neutral-300 text-neutral-700';
    }
  };

  return (
    <div className="glass rounded-3xl p-6 border border-neutral-200/50 shadow-medium">
      <h3 className="text-xl font-semibold text-neutral-900 mb-4">Market Heat Map</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {data.map((item) => (
          <div
            key={item.zipCode}
            className={`p-4 rounded-lg border-2 ${getColorClass(item.color)} transition-transform hover:scale-105 cursor-pointer`}
            title={`${item.city}, ${item.state} ${item.zipCode} - Score: ${item.heatValue}`}
          >
            <div className="text-xs font-medium mb-1">{item.zipCode}</div>
            <div className="text-lg font-bold">{Math.round(item.heatValue)}</div>
            <div className="text-xs opacity-90">{item.city}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-brand-accent-500 rounded"></div>
          <span>High (75-100)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Medium (50-74)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span>Low (25-49)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Very Low (0-24)</span>
        </div>
      </div>
    </div>
  );
}

