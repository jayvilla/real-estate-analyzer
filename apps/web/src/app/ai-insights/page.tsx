'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">AI Insights</h1>
            <p className="text-gray-400">
              Get AI-powered insights about your portfolio, properties, and deals
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/20">
            <button
              onClick={() => setActiveView('insights')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeView === 'insights'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Insights
            </button>
            <button
              onClick={() => setActiveView('chat')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeView === 'chat'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveView('preferences')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeView === 'preferences'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Preferences
            </button>
          </div>

          {/* Property Selector */}
          {activeView === 'insights' && properties && properties.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Select Property
              </label>
              <select
                value={selectedPropertyId || ''}
                onChange={(e) => setSelectedPropertyId(e.target.value || undefined)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
            <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/20 h-[calc(100vh-300px)]">
              <EnhancedChatInterface className="h-full" />
            </div>
          )}

          {activeView === 'preferences' && (
            <AIPreferences className="max-w-2xl" />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

