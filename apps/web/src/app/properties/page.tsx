'use client';

import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SuspenseBoundary } from '../../components/shared';
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error loading properties. Please try again.
          </p>
          <Button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ['properties'] })
            }
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Property'}
          </Button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Property</h2>
            <PropertyForm
              onSubmit={handleCreateProperty}
              onCancel={() => setShowForm(false)}
              isLoading={createMutation.isPending}
            />
          </div>
        )}

        <SuspenseBoundary message="Loading properties...">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading properties...</p>
              </div>
            ) : (
              <PropertyTable
                properties={sortedProperties}
                onPropertyClick={handlePropertyClick}
              />
            )}
          </div>
        </SuspenseBoundary>

        {selectedProperty && (
          <PropertyDetailModal
            property={selectedProperty}
            onClose={() => setSelectedProperty(null)}
          />
        )}
      </div>
    </div>
  );
}
