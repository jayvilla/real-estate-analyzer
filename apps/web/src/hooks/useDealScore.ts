'use client';

import { useQuery } from '@tanstack/react-query';
import { scoringApi } from '../lib/api';
import { DealScore } from '@real-estate-analyzer/types';

export function useDealScore(dealId: string | null | undefined) {
  return useQuery<DealScore | null>({
    queryKey: ['deal-score', dealId],
    queryFn: () => (dealId ? scoringApi.getDealScore(dealId) : Promise.resolve(null)),
    enabled: !!dealId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDealScoreHistory(dealId: string | null | undefined) {
  return useQuery<DealScore[]>({
    queryKey: ['deal-score-history', dealId],
    queryFn: () => (dealId ? scoringApi.getDealScoreHistory(dealId) : Promise.resolve([])),
    enabled: !!dealId,
  });
}

