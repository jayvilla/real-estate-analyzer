'use client';

import React, { useMemo } from 'react';
import { Table, TableColumn } from '@real-estate-analyzer/ui';
import { Property, PropertyType } from '@real-estate-analyzer/types';

interface PropertyTableProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
}

export function PropertyTable({
  properties,
  onPropertyClick,
}: PropertyTableProps) {
  // Memoize columns to prevent unnecessary re-renders
  const columns: TableColumn<Property>[] = useMemo(
    () => [
      {
        key: 'address',
        header: 'Address',
        render: (property) => (
          <div>
            <div className="font-medium">{property.address}</div>
            <div className="text-gray-500 text-xs">
              {property.city}, {property.state} {property.zipCode}
            </div>
          </div>
        ),
      },
      {
        key: 'propertyType',
        header: 'Type',
        render: (property) => (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {property.propertyType.replace('_', ' ')}
          </span>
        ),
      },
      {
        key: 'bedrooms',
        header: 'Beds',
        render: (property) => property.bedrooms ?? '—',
      },
      {
        key: 'bathrooms',
        header: 'Baths',
        render: (property) => property.bathrooms ?? '—',
      },
      {
        key: 'squareFeet',
        header: 'Sq Ft',
        render: (property) =>
          property.squareFeet
            ? new Intl.NumberFormat('en-US').format(property.squareFeet)
            : '—',
      },
      {
        key: 'purchasePrice',
        header: 'Purchase Price',
        render: (property) =>
          property.purchasePrice
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
              }).format(property.purchasePrice)
            : '—',
      },
      {
        key: 'currentValue',
        header: 'Current Value',
        render: (property) =>
          property.currentValue
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
              }).format(property.currentValue)
            : '—',
      },
    ],
    []
  );

  return (
    <Table
      data={properties}
      columns={columns}
      onRowClick={onPropertyClick}
      emptyMessage="No properties found. Create your first property to get started!"
    />
  );
}

