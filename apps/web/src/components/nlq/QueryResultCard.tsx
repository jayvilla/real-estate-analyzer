'use client';

import React from 'react';
import { QueryResult } from '@real-estate-analyzer/types';

interface QueryResultCardProps {
  result: QueryResult;
}

export function QueryResultCard({ result }: QueryResultCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Query Results</h3>
        <div className="text-sm text-gray-400">
          {result.resultCount} results in {result.executionTime}ms
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-1">Query:</div>
        <div className="text-white italic">"{result.query}"</div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Intent:</div>
        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
          {result.structuredQuery.intent}
        </span>
      </div>

      {result.results && result.results.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-gray-400 mb-2">Results:</div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {result.results.slice(0, 10).map((item, idx) => (
              <div
                key={idx}
                className="bg-white/5 rounded p-3 text-sm text-gray-300"
              >
                <pre className="whitespace-pre-wrap text-xs">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </div>
            ))}
            {result.results.length > 10 && (
              <div className="text-xs text-gray-400 text-center">
                ... and {result.results.length - 10} more results
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="text-sm text-gray-400 mb-2">Formatted Result:</div>
        <div className="bg-white/5 rounded p-3 text-sm text-gray-200 whitespace-pre-wrap">
          {result.formattedResults}
        </div>
      </div>
    </div>
  );
}

