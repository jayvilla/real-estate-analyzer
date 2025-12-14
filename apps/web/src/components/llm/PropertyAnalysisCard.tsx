'use client';

import React from 'react';
import { PropertyAnalysis } from '@real-estate-analyzer/types';

interface PropertyAnalysisCardProps {
  analysis: PropertyAnalysis;
  isLoading?: boolean;
}

export function PropertyAnalysisCard({ analysis, isLoading }: PropertyAnalysisCardProps) {
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
    strong_buy: 'bg-green-500/20 text-green-300 border-green-500/50',
    buy: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    hold: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    avoid: 'bg-red-500/20 text-red-300 border-red-500/50',
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">AI Property Analysis</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${recommendationColors[analysis.investmentRecommendation]}`}>
          {analysis.investmentRecommendation.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <p className="text-gray-300 mb-6">{analysis.summary}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="text-sm font-semibold text-green-300 mb-2">Strengths</h4>
          <ul className="space-y-1">
            {analysis.strengths.map((strength, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-red-300 mb-2">Weaknesses</h4>
          <ul className="space-y-1">
            {analysis.weaknesses.map((weakness, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start">
                <span className="text-red-400 mr-2">✗</span>
                {weakness}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-blue-300 mb-2">Opportunities</h4>
          <ul className="space-y-1">
            {analysis.opportunities.map((opportunity, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                {opportunity}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-orange-300 mb-2">Risks</h4>
          <ul className="space-y-1">
            {analysis.risks.map((risk, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start">
                <span className="text-orange-400 mr-2">⚠</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {analysis.keyMetrics && analysis.keyMetrics.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/20">
          <h4 className="text-sm font-semibold text-white mb-3">Key Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {analysis.keyMetrics.map((metric, idx) => (
              <div key={idx} className="bg-white/5 rounded p-3">
                <div className="text-xs text-gray-400 mb-1">{metric.metric}</div>
                <div className="text-lg font-semibold text-white mb-1">{metric.value}</div>
                <div className="text-xs text-gray-300">{metric.insight}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
        <span className="text-xs text-gray-400">Confidence: {analysis.confidence}%</span>
      </div>
    </div>
  );
}

