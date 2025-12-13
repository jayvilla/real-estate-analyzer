'use client';

import React, { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Property } from '@real-estate-analyzer/types';

interface PropertyTableProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
}

const ROW_HEIGHT = 72; // Height of each row in pixels

export function PropertyTable({
  properties,
  onPropertyClick,
}: PropertyTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtualizer for rows
  const rowVirtualizer = useVirtualizer({
    count: properties.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5, // Render 5 extra rows above/below viewport for smooth scrolling
  });

  // Memoize column definitions
  const columns = useMemo(
    () => [
      { key: 'address', header: 'Address', width: '25%' },
      { key: 'propertyType', header: 'Type', width: '12%' },
      { key: 'bedrooms', header: 'Beds', width: '8%' },
      { key: 'bathrooms', header: 'Baths', width: '8%' },
      { key: 'squareFeet', header: 'Sq Ft', width: '10%' },
      { key: 'purchasePrice', header: 'Purchase Price', width: '15%' },
      { key: 'currentValue', header: 'Current Value', width: '15%' },
    ],
    []
  );

  // Render cell content
  const renderCell = (property: Property, columnKey: string) => {
    switch (columnKey) {
      case 'address':
        return (
          <div>
            <div className="font-medium text-neutral-900">{property.address}</div>
            <div className="text-neutral-500 text-xs mt-1">
              {property.city}, {property.state} {property.zipCode}
            </div>
          </div>
        );
      case 'propertyType':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-brand-primary-100 text-brand-primary-700">
            {property.propertyType.replace(/_/g, ' ')}
          </span>
        );
      case 'bedrooms':
        return <span className="text-neutral-700">{property.bedrooms ?? '—'}</span>;
      case 'bathrooms':
        return <span className="text-neutral-700">{property.bathrooms ?? '—'}</span>;
      case 'squareFeet':
        return (
          <span className="text-neutral-700">
            {property.squareFeet
              ? new Intl.NumberFormat('en-US').format(property.squareFeet)
              : '—'}
          </span>
        );
      case 'purchasePrice':
        return (
          <span className="text-neutral-700 font-medium">
            {property.purchasePrice
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(property.purchasePrice)
              : '—'}
          </span>
        );
      case 'currentValue':
        return (
          <span className="text-neutral-900 font-semibold">
            {property.currentValue
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(property.currentValue)
              : '—'}
          </span>
        );
      default:
        return null;
    }
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>
        <p className="text-neutral-600 font-medium">
          No properties found. Create your first property to get started!
        </p>
      </div>
    );
  }

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  // Padding for virtual scrolling
  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start ?? 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0)
      : 0;

  return (
    <div className="w-full">
      {/* Table Header - Fixed */}
      <div className="sticky top-0 z-10 bg-neutral-50 border-b border-neutral-200">
        <div className="flex">
          {columns.map((column) => (
            <div
              key={column.key}
              className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider"
              style={{ width: column.width }}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Virtualized Table Body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: '600px', maxHeight: 'calc(100vh - 300px)' }}
      >
        <div
          style={{
            height: `${totalSize}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {paddingTop > 0 && <div style={{ height: `${paddingTop}px` }} />}
          {virtualRows.map((virtualRow) => {
            const property = properties[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                onClick={() => onPropertyClick?.(property)}
                className={`flex border-b border-neutral-200 hover:bg-brand-primary-50 transition-all duration-200 ${
                  onPropertyClick ? 'cursor-pointer active:bg-brand-primary-100' : ''
                }`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className="px-6 py-4 flex items-center"
                    style={{ width: column.width }}
                  >
                    {renderCell(property, column.key)}
                  </div>
                ))}
              </div>
            );
          })}
          {paddingBottom > 0 && <div style={{ height: `${paddingBottom}px` }} />}
        </div>
      </div>

      {/* Footer with row count */}
      <div className="sticky bottom-0 bg-neutral-50 border-t border-neutral-200 px-6 py-3">
        <div className="text-xs text-neutral-500">
          Showing {virtualRows.length} of {properties.length} properties
        </div>
      </div>
    </div>
  );
}
