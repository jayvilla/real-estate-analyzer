'use client';

import React from 'react';
import { RiskAssessment } from '@real-estate-analyzer/types';

interface RiskAssessmentCardProps {
  assessment: RiskAssessment;
  isLoading?: boolean;
}

export function RiskAssessmentCard({ assessment, isLoading }: RiskAssessmentCardProps) {
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

  const riskColors = {
    low: 'bg-green-500/20 text-green-300 border-green-500/50',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    high: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
    very_high: 'bg-red-500/20 text-red-300 border-red-500/50',
  };

  const severityColors = {
    low: 'text-green-300',
    medium: 'text-yellow-300',
    high: 'text-red-300',
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Risk Assessment</h3>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${riskColors[assessment.overallRisk]}`}>
            {assessment.overallRisk.replace('_', ' ').toUpperCase()}
          </span>
          <span className="text-sm text-gray-300">Score: {assessment.riskScore}/100</span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-semibold text-white mb-3">Risk Factors</h4>
        <div className="space-y-3">
          {assessment.riskFactors.map((factor, idx) => (
            <div key={idx} className="bg-white/5 rounded p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">{factor.factor}</span>
                <span className={`text-xs font-semibold ${severityColors[factor.severity]}`}>
                  {factor.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-300 mb-2">{factor.description}</p>
              {factor.mitigation && (
                <p className="text-xs text-green-300">
                  <span className="font-semibold">Mitigation: </span>
                  {factor.mitigation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {assessment.recommendations && assessment.recommendations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/20">
          <h4 className="text-sm font-semibold text-blue-300 mb-3">Recommendations</h4>
          <ul className="space-y-2">
            {assessment.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

