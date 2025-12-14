'use client';

import React from 'react';
import { useDealScore } from '../../hooks/useDealScore';
import { ScoreBadge, ScoreCard } from './index';

interface DealScoreDisplayProps {
  dealId: string;
  variant?: 'badge' | 'card';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onCalculate?: () => void;
}

export function DealScoreDisplay({
  dealId,
  variant = 'badge',
  size = 'md',
  showLabel = false,
  onCalculate,
}: DealScoreDisplayProps) {
  const { data: score, isLoading, error, refetch } = useDealScore(dealId);

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg border border-neutral-200">
        <div className="w-4 h-4 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-neutral-500">Calculating...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inline-flex items-center gap-2">
        <div className="px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
          <span className="text-sm text-red-600">Score unavailable</span>
        </div>
        {onCalculate && (
          <button
            onClick={() => {
              onCalculate();
              setTimeout(() => refetch(), 1000);
            }}
            className="text-xs text-brand-primary-600 hover:text-brand-primary-700 underline"
          >
            Calculate
          </button>
        )}
      </div>
    );
  }

  if (variant === 'card' && score) {
    return <ScoreCard score={score} dealId={dealId} />;
  }

  return <ScoreBadge score={score || null} size={size} showLabel={showLabel} />;
}

