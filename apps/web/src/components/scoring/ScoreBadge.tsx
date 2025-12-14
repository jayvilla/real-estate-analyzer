'use client';

import React from 'react';
import { DealScore } from '@real-estate-analyzer/types';

interface ScoreBadgeProps {
  score: DealScore | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreBadge({ score, size = 'md', showLabel = false }: ScoreBadgeProps) {
  if (!score) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg border border-neutral-200">
        <span className="text-sm text-neutral-500">No score</span>
      </div>
    );
  }

  const scoreValue = Math.round(score.overallScore);
  
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-brand-accent-500 text-white border-brand-accent-600';
    if (score >= 60) return 'bg-brand-primary-500 text-white border-brand-primary-600';
    if (score >= 40) return 'bg-yellow-500 text-white border-yellow-600';
    return 'bg-red-500 text-white border-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-2 ${sizeClasses[size]} ${getScoreColor(
          scoreValue
        )} rounded-lg border font-semibold shadow-soft`}
      >
        <span>{scoreValue}</span>
        {showLabel && (
          <span className="text-xs opacity-90 font-normal">
            {getScoreLabel(scoreValue)}
          </span>
        )}
      </div>
    </div>
  );
}

