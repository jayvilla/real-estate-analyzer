'use client';

import React from 'react';
import { DealRecommendation } from '@real-estate-analyzer/types';

interface DealRecommendationCardProps {
  recommendation: DealRecommendation;
  isLoading?: boolean;
}

export function DealRecommendationCard({ recommendation, isLoading }: DealRecommendationCardProps) {
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

  const recommendationColors = {
    highly_recommended: 'bg-green-500/20 text-green-300 border-green-500/50',
    recommended: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    neutral: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    not_recommended: 'bg-red-500/20 text-red-300 border-red-500/50',
  };

  const riskColors = {
    low: 'text-green-300',
    medium: 'text-yellow-300',
    high: 'text-red-300',
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">AI Deal Recommendation</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${recommendationColors[recommendation.recommendation]}`}>
          {recommendation.recommendation.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <p className="text-gray-300 mb-6">{recommendation.reasoning}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="text-sm font-semibold text-blue-300 mb-2">Key Factors</h4>
          <ul className="space-y-1">
            {recommendation.keyFactors.map((factor, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                {factor}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-green-300 mb-2">Suggested Actions</h4>
          <ul className="space-y-1">
            {recommendation.suggestedActions.map((action, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start">
                <span className="text-green-400 mr-2">→</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400 mr-4">Risk Level: </span>
          <span className={`text-sm font-semibold ${riskColors[recommendation.riskLevel]}`}>
            {recommendation.riskLevel.toUpperCase()}
          </span>
        </div>
        <span className="text-xs text-gray-400">Confidence: {recommendation.confidence}%</span>
      </div>
    </div>
  );
}

