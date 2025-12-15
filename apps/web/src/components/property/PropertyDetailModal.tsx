'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Property, UpdatePropertyDto } from '@real-estate-analyzer/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '../../lib/api';
import { PropertyForm } from './PropertyForm';
import { Button } from '@real-estate-analyzer/ui';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
}

export default function PropertyDetailModal({
  property,
  onClose,
}: PropertyDetailModalProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);

  const handleCreateDeal = () => {
    onClose();
    router.push(`/deals?propertyId=${property.id}`);
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePropertyDto }) =>
      propertyApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: propertyApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      onClose();
    },
  });

  const handleUpdate = async (data: UpdatePropertyDto) => {
    await updateMutation.mutateAsync({ id: property.id, data });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this property?')) {
      await deleteMutation.mutateAsync(property.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              Property Details
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              <svg
                className="w-6 h-6"
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
            </button>
          </div>

          {isEditing ? (
            <PropertyForm
              initialData={property}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              isLoading={updateMutation.isPending}
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Address
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-50">{property.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    City, State ZIP
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-50">
                    {property.city}, {property.state} {property.zipCode}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Property Type
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-50">
                    {property.propertyType.replace('_', ' ')}
                  </p>
                </div>
                {property.bedrooms && (
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Bedrooms
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-50">{property.bedrooms}</p>
                  </div>
                )}
                {property.bathrooms && (
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Bathrooms
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-50">{property.bathrooms}</p>
                  </div>
                )}
                {property.squareFeet && (
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Square Feet
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-50">
                      {new Intl.NumberFormat('en-US').format(property.squareFeet)}
                    </p>
                  </div>
                )}
                {property.purchasePrice && (
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Purchase Price
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-50">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(property.purchasePrice)}
                    </p>
                  </div>
                )}
                {property.currentValue && (
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Current Value
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-50">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(property.currentValue)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  isLoading={deleteMutation.isPending}
                >
                  Delete
                </Button>
                <Button
                  onClick={handleCreateDeal}
                  className="bg-brand-primary-600 hover:bg-brand-primary-700 text-white"
                >
                  <svg
                    className="w-4 h-4 mr-2"
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
                  Create Deal
                </Button>
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

