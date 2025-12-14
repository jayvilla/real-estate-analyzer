'use client';

import React from 'react';
import { DealScore } from '@real-estate-analyzer/types';
import { ScoreBadge } from '../scoring/ScoreBadge';

interface DealScoreVisualizationProps {
  score: DealScore;
  showDetails?: boolean;
  className?: string;
}

export function DealScoreVisualization({
  score,
  showDetails = true,
  className,
}: DealScoreVisualizationProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    if (value >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (value: number) => {
    if (value >= 80) return 'bg-green-500/20 border-green-500/50';
    if (value >= 60) return 'bg-yellow-500/20 border-yellow-500/50';
    if (value >= 40) return 'bg-orange-500/20 border-orange-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Deal Score</h3>
        <ScoreBadge score={score} />
      </div>

      {/* Score Breakdown */}
      {showDetails && score.criteria && (
        <div className="space-y-4">
          {Object.entries(score.criteria).map(([criteria, value]) => (
            <div key={criteria}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300 capitalize">
                  {criteria.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className={`text-sm font-semibold ${getScoreColor(value)}`}>
                  {value.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getScoreBgColor(value)}`}
                  style={{ width: `${value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Score Gauge */}
      <div className="mt-6 pt-6 border-t border-white/20">
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-white/10"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(score.overallScore / 100) * 352} 352`}
                className={getScoreColor(score.overallScore)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(score.overallScore)}`}>
                  {score.overallScore.toFixed(0)}
                </div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

