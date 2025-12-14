'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AIPreferences {
  autoGenerateSummaries: boolean;
  enableNotifications: boolean;
  preferredProvider: 'ollama' | 'openai' | 'anthropic';
  defaultLanguage: 'en' | 'es' | 'fr' | 'de' | 'zh';
  enableCostTracking: boolean;
  enableFeatureFlags: boolean;
}

const defaultPreferences: AIPreferences = {
  autoGenerateSummaries: false,
  enableNotifications: true,
  preferredProvider: 'ollama',
  defaultLanguage: 'en',
  enableCostTracking: true,
  enableFeatureFlags: true,
};

export function AIPreferences({ className }: { className?: string }) {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<AIPreferences>(defaultPreferences);

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('ai_preferences');
    if (stored) {
      try {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPrefs: AIPreferences) => {
    localStorage.setItem('ai_preferences', JSON.stringify(newPrefs));
    setPreferences(newPrefs);
  };

  const updatePreference = <K extends keyof AIPreferences>(
    key: K,
    value: AIPreferences[K]
  ) => {
    const updated = { ...preferences, [key]: value };
    savePreferences(updated);
  };

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 ${className}`}>
      <h3 className="text-xl font-semibold text-white mb-6">AI Preferences</h3>

      <div className="space-y-6">
        {/* Auto-generate summaries */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-white">
              Auto-generate Summaries
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Automatically generate summaries when viewing properties or deals
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.autoGenerateSummaries}
              onChange={(e) =>
                updatePreference('autoGenerateSummaries', e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        {/* Enable notifications */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-white">
              Enable Notifications
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Receive notifications for AI-generated insights
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.enableNotifications}
              onChange={(e) =>
                updatePreference('enableNotifications', e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        {/* Preferred provider */}
        <div>
          <label className="text-sm font-medium text-white mb-2 block">
            Preferred AI Provider
          </label>
          <select
            value={preferences.preferredProvider}
            onChange={(e) =>
              updatePreference('preferredProvider', e.target.value as any)
            }
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="ollama">Ollama (Local)</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>

        {/* Default language */}
        <div>
          <label className="text-sm font-medium text-white mb-2 block">
            Default Language
          </label>
          <select
            value={preferences.defaultLanguage}
            onChange={(e) =>
              updatePreference('defaultLanguage', e.target.value as any)
            }
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
          </select>
        </div>

        {/* Enable cost tracking */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-white">
              Enable Cost Tracking
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Track AI API usage and costs
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.enableCostTracking}
              onChange={(e) =>
                updatePreference('enableCostTracking', e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        {/* Enable feature flags */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-white">
              Enable Feature Flags
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Use feature flags for AI features
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.enableFeatureFlags}
              onChange={(e) =>
                updatePreference('enableFeatureFlags', e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to get AI preferences
 */
export function useAIPreferences(): AIPreferences {
  const [preferences, setPreferences] = useState<AIPreferences>(defaultPreferences);

  useEffect(() => {
    const stored = localStorage.getItem('ai_preferences');
    if (stored) {
      try {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, []);

  return preferences;
}

