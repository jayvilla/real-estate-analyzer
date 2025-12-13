import Link from 'next/link';
import { Button } from '@real-estate-analyzer/ui';

export default function Index() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-bg opacity-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-brand-secondary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-300" />
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-brand-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-200" />

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
            <span className="text-neutral-900">Analyzer</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Transform your real estate portfolio with powerful analytics, 
            intelligent valuations, and data-driven insights.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16 animate-fade-in-up delay-300">
            <Link href="/properties">
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
            <button className="px-8 py-4 text-lg font-semibold text-neutral-700 hover:text-neutral-900 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
          <div className="group card-hover glass rounded-3xl p-8 border border-neutral-200/50">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold text-neutral-900 mb-3">
              Property Management
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              Track and manage your real estate portfolio with comprehensive
              property details, analytics, and automated workflows.
            </p>
          </div>

          <div className="group card-hover glass rounded-3xl p-8 border border-neutral-200/50">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-secondary-500 to-brand-secondary-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold text-neutral-900 mb-3">
              Valuation Engine
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              Get accurate property valuations using advanced algorithms, 
              machine learning, and real-time market data analysis.
            </p>
          </div>

          <div className="group card-hover glass rounded-3xl p-8 border border-neutral-200/50">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-accent-500 to-brand-accent-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold text-neutral-900 mb-3">
              Analytics & Insights
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              Make data-driven decisions with powerful analytics, 
              predictive modeling, and comprehensive reporting tools.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in-up delay-500">
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-brand-primary-600 mb-2">10K+</div>
            <div className="text-sm text-neutral-600">Properties Managed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-brand-secondary-600 mb-2">$2B+</div>
            <div className="text-sm text-neutral-600">Portfolio Value</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-brand-accent-600 mb-2">99.9%</div>
            <div className="text-sm text-neutral-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-brand-primary-600 mb-2">24/7</div>
            <div className="text-sm text-neutral-600">Support</div>
          </div>
        </div>
      </div>
    </div>
  );
}
