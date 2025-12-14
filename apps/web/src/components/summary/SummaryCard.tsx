'use client';

import React from 'react';
import {
  PortfolioSummaryReport,
  PropertyPerformanceSummary,
  DealAnalysisSummary,
  MarketReport,
  ExecutiveDashboardSummary,
} from '@real-estate-analyzer/types';

type Summary = PortfolioSummaryReport | PropertyPerformanceSummary | DealAnalysisSummary | MarketReport | ExecutiveDashboardSummary;

interface SummaryCardProps {
  summary: Summary;
  onExportPDF?: () => void;
  onSendEmail?: () => void;
}

export function SummaryCard({ summary, onExportPDF, onSendEmail }: SummaryCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">
          {summary.type ? summary.type.charAt(0).toUpperCase() + summary.type.slice(1) + ' Summary' : 'Summary'}
        </h3>
        <div className="flex gap-2">
          {onExportPDF && (
            <button
              onClick={onExportPDF}
              className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-sm transition-colors"
            >
              Export PDF
            </button>
          )}
          {onSendEmail && (
            <button
              onClick={onSendEmail}
              className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded text-sm transition-colors"
            >
              Email
            </button>
          )}
        </div>
      </div>

      {summary.period && (
        <div className="text-sm text-gray-400 mb-4">
          Period: {summary.period.start.toLocaleDateString()} - {summary.period.end.toLocaleDateString()}
        </div>
      )}

      {summary.overview && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white mb-2">Overview</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{summary.overview}</p>
        </div>
      )}

      {'executiveSummary' in summary && summary.executiveSummary && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white mb-2">Executive Summary</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{summary.executiveSummary}</p>
        </div>
      )}

      {'keyMetrics' in summary && summary.keyMetrics && summary.keyMetrics.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white mb-3">Key Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.keyMetrics.map((metric, idx) => (
              <div key={idx} className="bg-white/5 rounded p-3">
                <div className="text-xs text-gray-400 mb-1">{metric.label}</div>
                <div className="text-lg font-semibold text-white">{metric.value}</div>
                {metric.change && (
                  <div className={`text-xs ${metric.trend === 'up' ? 'text-green-300' : metric.trend === 'down' ? 'text-red-300' : 'text-gray-300'}`}>
                    {metric.change}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {'portfolioOverview' in summary && summary.portfolioOverview && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white mb-3">Portfolio Overview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/5 rounded p-3">
              <div className="text-xs text-gray-400 mb-1">Properties</div>
              <div className="text-lg font-semibold text-white">{summary.portfolioOverview.totalProperties}</div>
            </div>
            <div className="bg-white/5 rounded p-3">
              <div className="text-xs text-gray-400 mb-1">Total Value</div>
              <div className="text-lg font-semibold text-white">{summary.portfolioOverview.totalValue}</div>
            </div>
            <div className="bg-white/5 rounded p-3">
              <div className="text-xs text-gray-400 mb-1">Cash Flow</div>
              <div className="text-lg font-semibold text-white">{summary.portfolioOverview.totalCashFlow}</div>
            </div>
            <div className="bg-white/5 rounded p-3">
              <div className="text-xs text-gray-400 mb-1">Avg Cap Rate</div>
              <div className="text-lg font-semibold text-white">{summary.portfolioOverview.averageCapRate}</div>
            </div>
          </div>
        </div>
      )}

      {'recommendations' in summary && summary.recommendations && summary.recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-green-300 mb-2">Recommendations</h4>
          <ul className="space-y-1">
            {summary.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start">
                <span className="text-green-400 mr-2">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {'risks' in summary && summary.risks && summary.risks.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-red-300 mb-2">Risks</h4>
          <ul className="space-y-1">
            {summary.risks.map((risk, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start">
                <span className="text-red-400 mr-2">⚠</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {'opportunities' in summary && summary.opportunities && summary.opportunities.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-blue-300 mb-2">Opportunities</h4>
          <ul className="space-y-1">
            {summary.opportunities.map((opp, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                {opp}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/20 text-xs text-gray-400">
        Generated on {summary.generatedAt.toLocaleString()}
      </div>
    </div>
  );
}

