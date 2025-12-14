'use client';

import React from 'react';
import { SummaryCard } from '../summary/SummaryCard';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import {
  PortfolioSummaryReport,
  PropertyPerformanceSummary,
  DealAnalysisSummary,
  MarketReport,
  ExecutiveDashboardSummary,
} from '@real-estate-analyzer/types';

type Summary =
  | PortfolioSummaryReport
  | PropertyPerformanceSummary
  | DealAnalysisSummary
  | MarketReport
  | ExecutiveDashboardSummary;

interface SummaryDisplayProps {
  summary: Summary | null;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onExportPDF?: () => void;
  onSendEmail?: () => void;
  className?: string;
}

export function SummaryDisplay({
  summary,
  isLoading = false,
  error = null,
  onRetry,
  onExportPDF,
  onSendEmail,
  className,
}: SummaryDisplayProps) {
  if (isLoading) {
    return (
      <div className={className}>
        <LoadingState message="Generating AI summary..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorState error={error} onRetry={onRetry} />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className={`text-center py-12 text-gray-400 ${className}`}>
        No summary available
      </div>
    );
  }

  return (
    <div className={className}>
      <SummaryCard
        summary={summary}
        onExportPDF={onExportPDF}
        onSendEmail={onSendEmail}
      />
    </div>
  );
}

