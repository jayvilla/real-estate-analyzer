'use client';

import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '../../lib/api';
import {
  Property,
  CreatePropertyDto,
  UpdatePropertyDto,
} from '@real-estate-analyzer/types';
import { Button } from '@real-estate-analyzer/ui';
import { PropertyProvider } from '../../stores/context/PropertyContext';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Navigation } from '../../components/shared/Navigation';
import { useAuth } from '../../stores/auth/auth-context';

// Dynamic imports for better code splitting
import {
  PropertyTable,
  PropertyForm,
  PropertyDetailModal,
} from '../../components/property/dynamic-imports';
import {
  PropertyListBoundary,
  PropertyFormBoundary,
  PropertyModalBoundary,
} from '../../components/property/dynamic-boundaries';

function PropertiesPageContent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
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
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-neutral-900 mb-2">
            Error loading properties
          </p>
          <p className="text-neutral-600 mb-6">
            Please try again or contact support if the problem persists.
          </p>
          <Button onClick={handleRetryList} className="btn-glow">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PropertyProvider>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 transition-colors duration-300">
        <Navigation />
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary-200 dark:bg-brand-primary-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary-200 dark:bg-brand-secondary-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float delay-300" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-50 mb-2">
              Properties
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Manage your real estate portfolio
            </p>
          </div>
          
          <div className="flex justify-end mb-6">
                <Button
                  onClick={() => setShowForm(!showForm)}
                  className="btn-glow shadow-medium hover:shadow-glow-lg transition-all duration-300 whitespace-nowrap"
                >
                  {showForm ? (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Cancel
                    </>
                  ) : (
                    <>Add Property</>
                  )}
                </Button>
          </div>

          {/* Form Section - Dynamically loaded with boundary */}
          {showForm && (
            <PropertyFormBoundary
              onRetry={handleRetryForm}
              isLoading={createMutation.isPending}
            >
              <div className="mb-8 glass rounded-3xl p-8 border border-neutral-200/50 shadow-medium animate-scale-in card-hover">
                <div className="flex items-center mb-6 pb-6 border-b border-neutral-200/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-primary-500 to-brand-secondary-500 rounded-xl flex items-center justify-center mr-4 shadow-soft">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-neutral-900">
                      Create New Property
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                      Add a new property to your portfolio
                    </p>
                  </div>
                </div>
                <PropertyForm
                  onSubmit={handleCreateProperty}
                  onCancel={() => setShowForm(false)}
                  isLoading={createMutation.isPending}
                />
              </div>
            </PropertyFormBoundary>
          )}

          {/* Properties Table Section - Dynamically loaded with boundary */}
          <PropertyListBoundary onRetry={handleRetryList}>
            <div className="glass rounded-3xl border border-neutral-200/50 shadow-medium overflow-hidden animate-fade-in-up delay-100 card-hover">
              {isLoading ? (
                <div className="p-16 md:p-20 text-center">
                  <div className="inline-block relative mb-6">
                    <div className="w-16 h-16 border-4 border-brand-primary-200 dark:border-brand-primary-800 border-t-brand-primary-600 dark:border-t-brand-primary-500 rounded-full animate-spin"></div>
                    <div
                      className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-brand-secondary-600 dark:border-t-brand-secondary-500 rounded-full animate-spin"
                      style={{
                        animationDirection: 'reverse',
                        animationDuration: '1.5s',
                      }}
                    ></div>
                  </div>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                    Loading properties...
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Please wait while we fetch your data
                  </p>
                </div>
              ) : sortedProperties.length === 0 ? (
                <div className="p-16 md:p-20 text-center">
                  <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-200/50 dark:from-brand-primary-900/30 to-brand-secondary-200/50 dark:to-brand-secondary-900/30 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-brand-primary-100 dark:from-brand-primary-900/50 to-brand-secondary-100 dark:to-brand-secondary-900/50 rounded-full flex items-center justify-center border-4 border-white dark:border-neutral-800 shadow-medium">
                      <svg
                        className="w-12 h-12 text-brand-primary-600 dark:text-brand-primary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-neutral-900 dark:text-neutral-50 mb-3">
                    No properties yet
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto text-lg">
                    Get started by adding your first property to the portfolio
                    and begin tracking your real estate investments.
                  </p>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="btn-glow shadow-medium hover:shadow-glow-lg px-8 py-4 text-base whitespace-nowrap"
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

          {/* Property Detail Modal - Dynamically loaded with boundary */}
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

export default function PropertiesPage() {
  return (
    <ProtectedRoute>
      <PropertiesPageContent />
    </ProtectedRoute>
  );
}
