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
    <div className={`glass rounded-lg border border-neutral-200/50 dark:border-neutral-700/50 ${className}`}>
      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-700">
        {propertyId && (
          <button
            onClick={() => setActiveTab('property')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'property'
                ? 'text-brand-primary-600 dark:text-brand-primary-400 border-b-2 border-brand-primary-600 dark:border-brand-primary-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50'
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
                ? 'text-brand-primary-600 dark:text-brand-primary-400 border-b-2 border-brand-primary-600 dark:border-brand-primary-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50'
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
                ? 'text-brand-primary-600 dark:text-brand-primary-400 border-b-2 border-brand-primary-600 dark:border-brand-primary-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50'
            }`}
          >
            Risk Assessment
          </button>
        )}
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'portfolio'
              ? 'text-brand-primary-600 dark:text-brand-primary-400 border-b-2 border-brand-primary-600 dark:border-brand-primary-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50'
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
              <div className="w-8 h-8 border-4 border-brand-primary-500 dark:border-brand-primary-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">Generating AI insights...</p>
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
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
              Select a property to view AI analysis
            </div>
          )}

        {!isLoading &&
          activeTab === 'deal' &&
          !dealRecommendation &&
          !dealId && (
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
              Select a deal to view AI recommendation
            </div>
          )}
      </div>
    </div>
  );
}

