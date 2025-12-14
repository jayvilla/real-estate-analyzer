'use client';

import React from 'react';
import { DealScore } from '@real-estate-analyzer/types';

interface ScoreCardProps {
  score: DealScore;
  dealId: string;
}

export function ScoreCard({ score, dealId }: ScoreCardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-brand-accent-600';
    if (value >= 60) return 'text-brand-primary-600';
    if (value >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (value: number) => {
    if (value >= 80) return 'bg-brand-accent-500';
    if (value >= 60) return 'bg-brand-primary-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const criteriaLabels = {
    capRate: 'Cap Rate',
    cashOnCash: 'Cash-on-Cash',
    dscr: 'DSCR',
    location: 'Location',
    marketTrends: 'Market Trends',
  };

  return (
    <div className="glass rounded-2xl p-6 border border-neutral-200/50 shadow-medium">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">Deal Score</h3>
          <p className="text-sm text-neutral-500">
            Calculated {new Date(score.calculatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(score.overallScore)}`}>
            {Math.round(score.overallScore)}
          </div>
          <div className="text-xs text-neutral-500">out of 100</div>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(score.criteria).map(([key, value]) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-neutral-700">
                {criteriaLabels[key as keyof typeof criteriaLabels]}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${getScoreColor(value)}`}>
                  {Math.round(value)}
                </span>
                <span className="text-xs text-neutral-400">
                  ({((score.weights[key as keyof typeof score.weights] || 0) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getScoreBarColor(value)}`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

