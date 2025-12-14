'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { nlqApi } from '../../lib/api';
import { QueryResult } from '@real-estate-analyzer/types';

interface NLQInputProps {
  onResult?: (result: QueryResult) => void;
  placeholder?: string;
  className?: string;
  suggestions?: string[];
}

export function NLQInput({
  onResult,
  placeholder = 'Ask a question about your portfolio...',
  className,
  suggestions = [],
}: NLQInputProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processQueryMutation = useMutation({
    mutationFn: (q: string) => nlqApi.processQuery(q),
    onSuccess: (result) => {
      onResult?.(result);
      setQuery('');
    },
    onError: (error: any) => {
      console.error('Query failed:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || processQueryMutation.isPending) return;

    processQueryMutation.mutate(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    // Fetch suggestions on mount
    if (suggestions.length === 0) {
      // Could fetch from API here
    }
  }, []);

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                // Delay to allow suggestion click
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder={placeholder}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              disabled={processQueryMutation.isPending}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!query.trim() || processQueryMutation.isPending}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center gap-2"
          >
            {processQueryMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Ask</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick suggestions */}
      {suggestions.length > 0 && !showSuggestions && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-gray-400">Try:</span>
          {suggestions.slice(0, 3).map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-300 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

