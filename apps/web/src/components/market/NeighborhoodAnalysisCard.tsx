'use client';

import React from 'react';
import { NeighborhoodAnalysis } from '@real-estate-analyzer/types';

interface NeighborhoodAnalysisCardProps {
  analysis: NeighborhoodAnalysis;
}

export function NeighborhoodAnalysisCard({ analysis }: NeighborhoodAnalysisCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-brand-accent-600';
    if (score >= 50) return 'text-brand-primary-600';
    if (score >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 75) return 'bg-brand-accent-50 border-brand-accent-200';
    if (score >= 50) return 'bg-brand-primary-50 border-brand-primary-200';
    if (score >= 25) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="glass rounded-3xl p-6 border border-neutral-200/50 shadow-medium">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-1">
            Neighborhood Analysis
          </h3>
          <p className="text-sm text-neutral-500">
            {analysis.city}, {analysis.state} {analysis.zipCode}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl border ${getScoreBgColor(analysis.overallScore)}`}>
          <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
            {Math.round(analysis.overallScore)}
          </div>
          <div className="text-xs text-neutral-500 text-center">Score</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-neutral-50 rounded-lg">
          <div className="text-xs text-neutral-500 mb-1">Price Trend</div>
          <div className="text-sm font-semibold text-neutral-900 capitalize">
            {analysis.metrics.priceTrend}
          </div>
        </div>
        <div className="p-4 bg-neutral-50 rounded-lg">
          <div className="text-xs text-neutral-500 mb-1">Rental Yield</div>
          <div className="text-sm font-semibold text-neutral-900">
            {analysis.metrics.rentalYield.toFixed(2)}%
          </div>
        </div>
        <div className="p-4 bg-neutral-50 rounded-lg">
          <div className="text-xs text-neutral-500 mb-1">Appreciation Rate</div>
          <div className="text-sm font-semibold text-neutral-900">
            {analysis.metrics.appreciationRate.toFixed(2)}%
          </div>
        </div>
        <div className="p-4 bg-neutral-50 rounded-lg">
          <div className="text-xs text-neutral-500 mb-1">Days on Market</div>
          <div className="text-sm font-semibold text-neutral-900">
            {analysis.metrics.daysOnMarket}
          </div>
        </div>
      </div>

      {analysis.recommendations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-neutral-900 mb-2">Recommendations</h4>
          <ul className="space-y-1">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-neutral-600 flex items-start gap-2">
                <span className="text-brand-primary-600 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.riskFactors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-red-600 mb-2">Risk Factors</h4>
          <ul className="space-y-1">
            {analysis.riskFactors.map((risk, idx) => (
              <li key={idx} className="text-sm text-neutral-600 flex items-start gap-2">
                <span className="text-red-600 mt-1">⚠</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

