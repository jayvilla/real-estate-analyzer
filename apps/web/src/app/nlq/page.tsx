'use client';

import React from 'react';
import { ChatInterface } from '../../components/nlq/ChatInterface';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function NLQPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Natural Language Query</h1>
            <p className="text-gray-400">
              Ask questions about your portfolio in natural language
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/20 h-[calc(100vh-200px)]">
            <ChatInterface className="h-full" />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

