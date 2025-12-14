'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Navigation } from '../../components/shared/Navigation';
import { AIInsightsPanel } from '../../components/ai/AIInsightsPanel';
import { EnhancedChatInterface } from '../../components/ai/EnhancedChatInterface';
import { AIPreferences } from '../../components/ai/AIPreferences';
import { useQuery } from '@tanstack/react-query';
import { propertyApi } from '../../lib/api';

export default function AIInsightsPage() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
  const [activeView, setActiveView] = useState<'insights' | 'chat' | 'preferences'>('insights');

  // Fetch properties for selection
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertyApi.getAll(),
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 transition-colors duration-300">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-50 mb-2">
              AI Insights
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Get AI-powered insights about your portfolio, properties, and deals
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setActiveView('insights')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeView === 'insights'
                  ? 'text-brand-primary-600 dark:text-brand-primary-400 border-b-2 border-brand-primary-600 dark:border-brand-primary-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50'
              }`}
            >
              Insights
            </button>
            <button
              onClick={() => setActiveView('chat')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeView === 'chat'
                  ? 'text-brand-primary-600 dark:text-brand-primary-400 border-b-2 border-brand-primary-600 dark:border-brand-primary-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveView('preferences')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeView === 'preferences'
                  ? 'text-brand-primary-600 dark:text-brand-primary-400 border-b-2 border-brand-primary-600 dark:border-brand-primary-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50'
              }`}
            >
              Preferences
            </button>
          </div>

          {/* Property Selector */}
          {activeView === 'insights' && properties && properties.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Select Property
              </label>
              <select
                value={selectedPropertyId || ''}
                onChange={(e) => setSelectedPropertyId(e.target.value || undefined)}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-brand-primary-500 dark:focus:ring-brand-primary-400 focus:border-transparent transition-colors duration-200"
              >
                <option value="">Select a property...</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.address}, {p.city}, {p.state}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Content */}
          {activeView === 'insights' && (
            <AIInsightsPanel
              propertyId={selectedPropertyId}
              className="min-h-[600px]"
            />
          )}

          {activeView === 'chat' && (
            <div className="glass rounded-2xl border border-neutral-200/50 shadow-medium h-[calc(100vh-400px)] min-h-[600px]">
              <EnhancedChatInterface className="h-full" />
            </div>
          )}

          {activeView === 'preferences' && (
            <div className="glass rounded-2xl border border-neutral-200/50 shadow-medium p-6">
              <AIPreferences className="max-w-2xl" />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

