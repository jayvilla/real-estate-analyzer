import Link from 'next/link';
import { Button } from '@real-estate-analyzer/ui';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Real Estate Analyzer
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Enterprise-grade real estate analysis platform
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/properties">
              <Button size="lg">View Properties</Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">Property Management</h3>
            <p className="text-gray-600">
              Track and manage your real estate portfolio with comprehensive
              property details and analytics.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">Valuation Engine</h3>
            <p className="text-gray-600">
              Get accurate property valuations using advanced algorithms and
              market data analysis.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">Analytics & Insights</h3>
            <p className="text-gray-600">
              Make data-driven decisions with powerful analytics and reporting
              tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
