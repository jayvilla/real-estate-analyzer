'use client';

import React from 'react';
import { PortfolioInsight } from '@real-estate-analyzer/types';

interface PortfolioInsightsCardProps {
  insights: PortfolioInsight[];
  isLoading?: boolean;
}

export function PortfolioInsightsCard({ insights, isLoading }: PortfolioInsightsCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 animate-pulse">
        <div className="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-white/20 rounded"></div>
          <div className="h-4 bg-white/20 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  const categoryColors = {
    performance: 'bg-green-500/20 text-green-300 border-green-500/50',
    risk: 'bg-red-500/20 text-red-300 border-red-500/50',
    opportunity: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    optimization: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  };

  const priorityColors = {
    high: 'text-red-300',
    medium: 'text-yellow-300',
    low: 'text-green-300',
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-6">Portfolio Insights</h3>

      <div className="space-y-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-start justify-between mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium border ${categoryColors[insight.category]}`}>
                {insight.category.toUpperCase()}
              </span>
              <span className={`text-xs font-semibold ${priorityColors[insight.priority]}`}>
                {insight.priority.toUpperCase()} PRIORITY
              </span>
            </div>

            <p className="text-gray-300 mb-3">{insight.insight}</p>

            {insight.actionable && insight.actionItems && insight.actionItems.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <h5 className="text-xs font-semibold text-green-300 mb-2">Action Items:</h5>
                <ul className="space-y-1">
                  {insight.actionItems.map((action, actionIdx) => (
                    <li key={actionIdx} className="text-xs text-gray-300 flex items-start">
                      <span className="text-green-400 mr-2">→</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

