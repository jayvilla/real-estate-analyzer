/**
 * Dynamic imports for property components.
 * Using Next.js dynamic() instead of React.lazy() to avoid SWC parser issues.
 */

import React from 'react';
import dynamic from 'next/dynamic';

// Loading components
const ModalLoading = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="glass rounded-2xl p-8 animate-scale-in">
      <div className="inline-block relative mb-4">
        <div className="w-12 h-12 border-4 border-brand-primary-200 border-t-brand-primary-600 rounded-full animate-spin"></div>
        <div
          className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-brand-secondary-600 rounded-full animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>
      </div>
      <p className="text-neutral-600 text-center">
        Loading property details...
      </p>
    </div>
  </div>
);

const FormLoading = () => (
  <div className="glass rounded-3xl p-8 border border-neutral-200/50 shadow-medium animate-scale-in">
    <div className="flex items-center mb-6">
      <div className="w-10 h-10 bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 rounded-xl flex items-center justify-center mr-4">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h2 className="text-2xl font-display font-bold text-neutral-900">
        Loading form...
      </h2>
    </div>
  </div>
);

const TableLoading = () => (
  <div className="glass rounded-3xl border border-neutral-200/50 shadow-medium overflow-hidden">
    <div className="p-20 text-center">
      <div className="inline-block relative">
        <div className="w-16 h-16 border-4 border-brand-primary-200 border-t-brand-primary-600 rounded-full animate-spin"></div>
        <div
          className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-brand-secondary-600 rounded-full animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>
      </div>
      <p className="mt-6 text-lg font-medium text-neutral-700">
        Loading table...
      </p>
    </div>
  </div>
);

/**
 * PropertyDetailModal - Lazy loaded modal component
 * Only loads when the modal needs to be displayed
 */
export const PropertyDetailModal = dynamic(
  () => import('./PropertyDetailModal'),
  {
    loading: () => <ModalLoading />,
    ssr: false, // Modals don't need SSR
  }
) as React.ComponentType<{
  property: import('@real-estate-analyzer/types').Property;
  onClose: () => void;
}>;

/**
 * PropertyForm - Lazy loaded form component
 * Only loads when the form needs to be displayed
 */
export const PropertyForm = dynamic(
  () => import('./PropertyForm').then((mod) => ({ default: mod.PropertyForm })),
  {
    loading: () => <FormLoading />,
    ssr: true, // Forms can be SSR'd
  }
) as React.ComponentType<{
  initialData?: Partial<
    | import('@real-estate-analyzer/types').CreatePropertyDto
    | import('@real-estate-analyzer/types').UpdatePropertyDto
  >;
  onSubmit: (
    data:
      | import('@real-estate-analyzer/types').CreatePropertyDto
      | import('@real-estate-analyzer/types').UpdatePropertyDto
  ) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}>;

/**
 * PropertyTable - Lazy loaded table component
 * Can be lazy loaded for better initial page load
 */
export const PropertyTable = dynamic(
  () =>
    import('./PropertyTable').then((mod) => ({ default: mod.PropertyTable })),
  {
    loading: () => <TableLoading />,
    ssr: true, // Tables can be SSR'd
  }
) as React.ComponentType<{
  properties: import('@real-estate-analyzer/types').Property[];
  onPropertyClick?: (
    property: import('@real-estate-analyzer/types').Property
  ) => void;
}>;
