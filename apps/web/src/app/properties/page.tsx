'use client';

import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '../../lib/api';
import {
  Property,
  CreatePropertyDto,
  UpdatePropertyDto,
} from '@real-estate-analyzer/types';
import { PropertyTable } from '../../components/property/PropertyTable';
import { PropertyForm } from '../../components/property/PropertyForm';
import { Button } from '@real-estate-analyzer/ui';
import PropertyDetailModal from '../../components/property/PropertyDetailModal';
import { PropertyListBoundary } from '../../components/property/PropertyListBoundary';
import { PropertyFormBoundary } from '../../components/property/PropertyFormBoundary';
import { PropertyModalBoundary } from '../../components/property/PropertyModalBoundary';
import { PropertyProvider } from '../../stores/context/PropertyContext';

export default function PropertiesPage() {
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] =
    React.useState<Property | null>(null);
  const [showForm, setShowForm] = React.useState(false);

  // Fetch properties using React Query
  const {
    data: properties = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['properties'],
    queryFn: propertyApi.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: propertyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setShowForm(false);
    },
  });

  // Memoize sorted properties for performance
  const sortedProperties = useMemo(() => {
    return [...properties].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [properties]);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleCreateProperty = async (
    data: CreatePropertyDto | UpdatePropertyDto
  ) => {
    await createMutation.mutateAsync(data as CreatePropertyDto);
  };

  const handleRetryList = () => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  };

  const handleRetryForm = () => {
    // Form-specific retry logic if needed
    createMutation.reset();
  };

  // Error state - isolated to page level
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="text-center glass rounded-3xl p-12 max-w-md mx-4 animate-scale-in">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-neutral-900 mb-2">
            Error loading properties
          </p>
          <p className="text-neutral-600 mb-6">
            Please try again or contact support if the problem persists.
          </p>
          <Button
            onClick={handleRetryList}
            className="btn-glow"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PropertyProvider>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float delay-300" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-down">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-2">
                Properties
              </h1>
              <p className="text-neutral-600">
                Manage your real estate portfolio
              </p>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="btn-glow shadow-medium hover:shadow-glow-lg transition-all duration-300"
            >
              {showForm ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Property
                </>
              )}
            </Button>
          </div>

          {/* Form Section - Isolated boundary */}
          {showForm && (
            <PropertyFormBoundary
              onRetry={handleRetryForm}
              isLoading={createMutation.isPending}
            >
              <div className="mb-8 glass rounded-3xl p-8 border border-neutral-200/50 shadow-medium animate-scale-in">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-display font-bold text-neutral-900">
                    Create New Property
                  </h2>
                </div>
                <PropertyForm
                  onSubmit={handleCreateProperty}
                  onCancel={() => setShowForm(false)}
                  isLoading={createMutation.isPending}
                />
              </div>
            </PropertyFormBoundary>
          )}

          {/* Properties Table Section - Isolated boundary */}
          <PropertyListBoundary onRetry={handleRetryList}>
            <div className="glass rounded-3xl border border-neutral-200/50 shadow-medium overflow-hidden animate-fade-in-up delay-100">
              {isLoading ? (
                <div className="p-20 text-center">
                  <div className="inline-block relative">
                    <div className="w-16 h-16 border-4 border-brand-primary-200 border-t-brand-primary-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-brand-secondary-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>
                  <p className="mt-6 text-lg font-medium text-neutral-700">
                    Loading properties...
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    Please wait while we fetch your data
                  </p>
                </div>
              ) : sortedProperties.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    No properties yet
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    Get started by adding your first property to the portfolio.
                  </p>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="btn-glow"
                  >
                    Add Your First Property
                  </Button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <PropertyTable
                    properties={sortedProperties}
                    onPropertyClick={handlePropertyClick}
                  />
                </div>
              )}
            </div>
          </PropertyListBoundary>

          {/* Property Detail Modal - Isolated boundary */}
          {selectedProperty && (
            <PropertyModalBoundary
              onRetry={() => {
                // Retry logic for modal if needed
                queryClient.invalidateQueries({ queryKey: ['properties'] });
              }}
              onClose={() => setSelectedProperty(null)}
            >
              <PropertyDetailModal
                property={selectedProperty}
                onClose={() => setSelectedProperty(null)}
              />
            </PropertyModalBoundary>
          )}
        </div>
      </div>
    </PropertyProvider>
  );
}
