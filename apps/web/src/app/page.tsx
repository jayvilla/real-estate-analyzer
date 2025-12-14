'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@real-estate-analyzer/ui';
import { useAuth } from '../stores/auth/auth-context';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
        <div className="text-center">
          <div className="inline-block relative">
            <div className="w-16 h-16 border-4 border-brand-primary-200 dark:border-brand-primary-800 border-t-brand-primary-600 dark:border-t-brand-primary-400 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-neutral-700 dark:text-neutral-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-bg opacity-10 dark:opacity-5" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-primary-300 dark:bg-brand-primary-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 dark:opacity-10 animate-float" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-brand-secondary-300 dark:bg-brand-secondary-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 dark:opacity-10 animate-float delay-300" />
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-brand-accent-300 dark:bg-brand-accent-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 dark:opacity-10 animate-float delay-200" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        {/* Hero Section */}
        <div className="text-center animate-fade-in-up">
          <div className="inline-block mb-6 animate-scale-in">
            <span className="px-4 py-2 text-sm font-semibold text-brand-primary-700 bg-brand-primary-100 rounded-full">
              Enterprise Real Estate Platform
            </span>
          </div>
          
          <h1 className="text-6xl md:text-display-lg lg:text-display-xl font-display font-bold mb-6 animate-fade-in-up delay-100">
            <span className="gradient-text">Real Estate</span>
            <br />
            <span className="text-neutral-900 dark:text-neutral-50">Analyzer</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Transform your real estate portfolio with powerful analytics, 
            intelligent valuations, and data-driven insights.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16 animate-fade-in-up delay-300">
            <Link href="/register">
              <Button 
                size="lg" 
                className="btn-glow px-8 py-4 text-lg font-semibold shadow-medium hover:shadow-glow-lg transition-all duration-300"
              >
                Get Started
                <svg 
                  className="ml-2 w-5 h-5 inline-block transition-transform group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-4 text-lg font-semibold shadow-medium hover:shadow-large transition-all duration-300"
              >
                Sign In
                <svg 
                  className="ml-2 w-5 h-5 inline-block" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
          <div className="group card-hover glass rounded-3xl p-8 border border-neutral-200/50 dark:border-neutral-700/50">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold text-neutral-900 dark:text-neutral-50 mb-3">
              Property Management
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Track and manage your real estate portfolio with comprehensive
              property details, analytics, and automated workflows.
            </p>
          </div>

          <div className="group card-hover glass rounded-3xl p-8 border border-neutral-200/50 dark:border-neutral-700/50">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-secondary-500 to-brand-secondary-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold text-neutral-900 dark:text-neutral-50 mb-3">
              Valuation Engine
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Get accurate property valuations using advanced algorithms, 
              machine learning, and real-time market data analysis.
            </p>
          </div>

          <div className="group card-hover glass rounded-3xl p-8 border border-neutral-200/50 dark:border-neutral-700/50">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-accent-500 to-brand-accent-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold text-neutral-900 dark:text-neutral-50 mb-3">
              Analytics & Insights
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Make data-driven decisions with powerful analytics, 
              predictive modeling, and comprehensive reporting tools.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in-up delay-500">
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-brand-primary-600 dark:text-brand-primary-400 mb-2">10K+</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Properties Managed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-brand-secondary-600 dark:text-brand-secondary-400 mb-2">$2B+</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Portfolio Value</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-brand-accent-600 dark:text-brand-accent-400 mb-2">99.9%</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-brand-primary-600 dark:text-brand-primary-400 mb-2">24/7</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Support</div>
          </div>
        </div>
      </div>
    </div>
  );
}
