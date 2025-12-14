'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@real-estate-analyzer/ui';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyType,
} from '@real-estate-analyzer/types';

interface PropertyFormProps {
  initialData?: Partial<CreatePropertyDto | UpdatePropertyDto>;
  onSubmit: (data: CreatePropertyDto | UpdatePropertyDto) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function PropertyForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: PropertyFormProps) {
  const [formData, setFormData] = useState({
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    propertyType:
      initialData?.propertyType || PropertyType.SINGLE_FAMILY,
    bedrooms: initialData?.bedrooms?.toString() || '',
    bathrooms: initialData?.bathrooms?.toString() || '',
    squareFeet: initialData?.squareFeet?.toString() || '',
    lotSize: initialData?.lotSize?.toString() || '',
    yearBuilt: initialData?.yearBuilt?.toString() || '',
    purchasePrice: initialData?.purchasePrice?.toString() || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: CreatePropertyDto | UpdatePropertyDto = {
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      propertyType: formData.propertyType as PropertyType,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms, 10) : undefined,
      bathrooms: formData.bathrooms
        ? parseInt(formData.bathrooms, 10)
        : undefined,
      squareFeet: formData.squareFeet
        ? parseFloat(formData.squareFeet)
        : undefined,
      lotSize: formData.lotSize ? parseFloat(formData.lotSize) : undefined,
      yearBuilt: formData.yearBuilt
        ? parseInt(formData.yearBuilt, 10)
        : undefined,
      purchasePrice: formData.purchasePrice
        ? parseFloat(formData.purchasePrice)
        : undefined,
    };
    await onSubmit(submitData);
  };

  // Memoize property type options
  const propertyTypeOptions = useMemo(() => Object.values(PropertyType), []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Address *
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            State *
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            maxLength={2}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            ZIP Code *
          </label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Property Type *
          </label>
          <select
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
          >
            {propertyTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Bedrooms
          </label>
          <input
            type="number"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Bathrooms
          </label>
          <input
            type="number"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleChange}
            min="0"
            step="0.5"
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Square Feet
          </label>
          <input
            type="number"
            name="squareFeet"
            value={formData.squareFeet}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Lot Size (sq ft)
          </label>
          <input
            type="number"
            name="lotSize"
            value={formData.lotSize}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Year Built
          </label>
          <input
            type="number"
            name="yearBuilt"
            value={formData.yearBuilt}
            onChange={handleChange}
            min="1800"
            max={new Date().getFullYear()}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Purchase Price ($)
          </label>
          <input
            type="number"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            min="0"
            step="1000"
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Property' : 'Create Property'}
        </Button>
      </div>
    </form>
  );
}

