'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { llmApi } from '../../lib/api';
import { PropertyAnalysisCard } from '../llm/PropertyAnalysisCard';
import { DealRecommendationCard } from '../llm/DealRecommendationCard';
import { RiskAssessmentCard } from '../llm/RiskAssessmentCard';
import { PortfolioInsightsCard } from '../llm/PortfolioInsightsCard';
import { PropertyAnalysis, DealRecommendation, RiskAssessment, PortfolioInsight } from '@real-estate-analyzer/types';

interface AIInsightsPanelProps {
  propertyId?: string;
  dealId?: string;
  organizationId?: string;
  className?: string;
}

type InsightType = 'property' | 'deal' | 'risk' | 'portfolio';

export function AIInsightsPanel({
  propertyId,
  dealId,
  organizationId,
  className,
}: AIInsightsPanelProps) {
  const [activeTab, setActiveTab] = useState<InsightType>('property');

  // Property analysis
  const { data: propertyAnalysis, isLoading: loadingProperty } = useQuery({
    queryKey: ['property-analysis', propertyId],
    queryFn: () => llmApi.analyzeProperty(propertyId!),
    enabled: !!propertyId && activeTab === 'property',
  });

  // Deal recommendation
  const { data: dealRecommendation, isLoading: loadingDeal } = useQuery({
    queryKey: ['deal-recommendation', dealId],
    queryFn: () => llmApi.getDealRecommendation(dealId!),
    enabled: !!dealId && activeTab === 'deal',
  });

  // Risk assessment
  const { data: riskAssessment, isLoading: loadingRisk } = useQuery({
    queryKey: ['risk-assessment', propertyId, dealId],
    queryFn: () => llmApi.assessRisk(propertyId, dealId),
    enabled: (!!propertyId || !!dealId) && activeTab === 'risk',
  });

  // Portfolio insights
  const { data: portfolioInsights, isLoading: loadingPortfolio } = useQuery({
    queryKey: ['portfolio-insights'],
    queryFn: () => llmApi.getPortfolioInsights(),
    enabled: activeTab === 'portfolio',
  });

  const isLoading =
    (activeTab === 'property' && loadingProperty) ||
    (activeTab === 'deal' && loadingDeal) ||
    (activeTab === 'risk' && loadingRisk) ||
    (activeTab === 'portfolio' && loadingPortfolio);

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-lg border border-white/20 ${className}`}>
      {/* Tabs */}
      <div className="flex border-b border-white/20">
        {propertyId && (
          <button
            onClick={() => setActiveTab('property')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'property'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Property Analysis
          </button>
        )}
        {dealId && (
          <button
            onClick={() => setActiveTab('deal')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'deal'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Deal Recommendation
          </button>
        )}
        {(propertyId || dealId) && (
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'risk'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Risk Assessment
          </button>
        )}
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'portfolio'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Portfolio Insights
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-sm">Generating AI insights...</p>
            </div>
          </div>
        )}

        {!isLoading && activeTab === 'property' && propertyAnalysis && (
          <PropertyAnalysisCard analysis={propertyAnalysis} />
        )}

        {!isLoading && activeTab === 'deal' && dealRecommendation && (
          <DealRecommendationCard recommendation={dealRecommendation} />
        )}

        {!isLoading && activeTab === 'risk' && riskAssessment && (
          <RiskAssessmentCard assessment={riskAssessment} />
        )}

        {!isLoading && activeTab === 'portfolio' && portfolioInsights && (
          <PortfolioInsightsCard insights={portfolioInsights} />
        )}

        {!isLoading &&
          activeTab === 'property' &&
          !propertyAnalysis &&
          !propertyId && (
            <div className="text-center py-12 text-gray-400">
              Select a property to view AI analysis
            </div>
          )}

        {!isLoading &&
          activeTab === 'deal' &&
          !dealRecommendation &&
          !dealId && (
            <div className="text-center py-12 text-gray-400">
              Select a deal to view AI recommendation
            </div>
          )}
      </div>
    </div>
  );
}

