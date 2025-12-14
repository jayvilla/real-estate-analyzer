'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../stores/auth/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      router.push('/'); // Redirect to home if role doesn't match
    }
  }, [isAuthenticated, isLoading, requiredRole, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="text-center">
          <div className="inline-block relative">
            <div className="w-16 h-16 border-4 border-brand-primary-200 border-t-brand-primary-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-neutral-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

