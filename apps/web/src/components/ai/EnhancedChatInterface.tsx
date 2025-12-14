'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nlqApi } from '../../lib/api';
import { ChatMessage, QueryResult } from '@real-estate-analyzer/types';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { useAIWithRetry } from '../../hooks/useAIWithRetry';

interface EnhancedChatInterfaceProps {
  className?: string;
  onQueryResult?: (result: QueryResult) => void;
}

export function EnhancedChatInterface({
  className,
  onQueryResult,
}: EnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  // Fetch suggestions
  const { data: suggestions } = useQuery({
    queryKey: ['nlq-suggestions'],
    queryFn: () => nlqApi.getSuggestions(5),
  });

  // Fetch history
  const { data: history } = useQuery({
    queryKey: ['nlq-history'],
    queryFn: () => nlqApi.getHistory(10),
  });

  // Retry mechanism
  const { execute: executeWithRetry, retry, canRetry, retryCount } = useAIWithRetry(
    async () => {
      if (!input.trim()) throw new Error('Query cannot be empty');
      return await nlqApi.processQuery(input);
    },
    { maxRetries: 3, retryDelay: 1000 }
  );

  const processQueryMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await executeWithRetry();
        if (!result) throw new Error('Query failed');

        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: result.query,
          timestamp: new Date(),
        };

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.formattedResults,
          timestamp: new Date(),
          queryResult: result,
        };

        setMessages((prev) => [...prev, userMessage, assistantMessage]);
        onQueryResult?.(result);
        setInput('');
        setError(null);

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['nlq-history'] });
        queryClient.invalidateQueries({ queryKey: ['nlq-suggestions'] });

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);

        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: input,
          timestamp: new Date(),
        };

        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Sorry, I couldn't process that query. ${error.message}`,
          timestamp: new Date(),
          error: error.message,
        };

        setMessages((prev) => [...prev, userMessage, errorMessage]);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    processQueryMutation.mutate();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleRetry = () => {
    if (canRetry) {
      retry();
    } else {
      processQueryMutation.mutate();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (history && history.length > 0 && messages.length === 0) {
      const initialMessages: ChatMessage[] = history.slice(0, 3).flatMap((h) => [
        {
          id: `history-user-${h.id}`,
          role: 'user' as const,
          content: h.query,
          timestamp: h.timestamp,
        },
        {
          id: `history-assistant-${h.id}`,
          role: 'assistant' as const,
          content: `Found ${h.resultCount} results.`,
          timestamp: h.timestamp,
        },
      ]);
      setMessages(initialMessages);
    }
  }, [history]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-neutral-500 dark:text-neutral-400 mt-8">
            <p className="text-lg mb-2">Ask me anything about your portfolio!</p>
            <p className="text-sm">Try: "Show me all properties in California" or "What's my average cap rate?"</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-brand-primary-100 dark:bg-brand-primary-900/30 text-brand-primary-900 dark:text-brand-primary-50'
                  : message.error
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.queryResult && (
                <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700 text-xs text-neutral-500 dark:text-neutral-400">
                  {message.queryResult.resultCount} results in {message.queryResult.executionTime}ms
                </div>
              )}
              {message.error && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">{message.error}</div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 text-neutral-900 dark:text-neutral-50">
              <LoadingState message="Processing your query..." size="sm" />
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex justify-start">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 max-w-[80%]">
              <ErrorState error={error} onRetry={handleRetry} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && input.length === 0 && (
        <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Suggestions:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion.query)}
                className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-sm text-neutral-700 dark:text-neutral-300 transition-colors"
              >
                {suggestion.query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your portfolio..."
            className="flex-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg px-4 py-2 text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 dark:focus:ring-brand-primary-400 focus:border-transparent transition-colors duration-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-2 bg-brand-primary-600 dark:bg-brand-primary-500 hover:bg-brand-primary-700 dark:hover:bg-brand-primary-600 disabled:bg-neutral-400 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        {retryCount > 0 && (
          <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
            Retrying... ({retryCount}/3)
          </div>
        )}
      </form>
    </div>
  );
}

