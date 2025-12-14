'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nlqApi } from '../../lib/api';
import { ChatMessage, QueryResult } from '@real-estate-analyzer/types';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  // Fetch suggestions on mount
  const { data: suggestions } = useQuery({
    queryKey: ['nlq-suggestions'],
    queryFn: () => nlqApi.getSuggestions(5),
  });

  // Fetch history on mount
  const { data: history } = useQuery({
    queryKey: ['nlq-history'],
    queryFn: () => nlqApi.getHistory(10),
  });

  const processQueryMutation = useMutation({
    mutationFn: (query: string) => nlqApi.processQuery(query),
    onSuccess: (result: QueryResult) => {
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
      setIsLoading(false);
      setInput('');
      
      // Invalidate history to refresh suggestions
      queryClient.invalidateQueries({ queryKey: ['nlq-history'] });
      queryClient.invalidateQueries({ queryKey: ['nlq-suggestions'] });
    },
    onError: (error: any) => {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: input,
        timestamp: new Date(),
      };

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I couldn't process that query. ${error?.response?.data?.message || error.message || 'Please try again.'}`,
        timestamp: new Date(),
        error: error.message,
      };

      setMessages((prev) => [...prev, userMessage, errorMessage]);
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    processQueryMutation.mutate(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Load recent history as initial messages
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
          <div className="text-center text-gray-400 mt-8">
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
                  ? 'bg-blue-500/20 text-white'
                  : 'bg-white/10 text-gray-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.queryResult && (
                <div className="mt-2 pt-2 border-t border-white/20 text-xs text-gray-400">
                  {message.queryResult.resultCount} results in {message.queryResult.executionTime}ms
                </div>
              )}
              {message.error && (
                <div className="mt-2 text-xs text-red-300">{message.error}</div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-lg p-3 text-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && input.length === 0 && (
        <div className="px-4 py-2 border-t border-white/20">
          <div className="text-xs text-gray-400 mb-2">Suggestions:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion.query)}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-sm text-gray-300 transition-colors"
              >
                {suggestion.query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/20">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your portfolio..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

