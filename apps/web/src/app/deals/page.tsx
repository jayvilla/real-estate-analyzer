'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealApi, propertyApi } from '../../lib/api';
import {
  Deal,
  CreateDealDto,
  UpdateDealDto,
  DealStatus,
  Property,
} from '@real-estate-analyzer/types';
import { Button } from '@real-estate-analyzer/ui';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Navigation } from '../../components/shared/Navigation';
import { useAuth } from '../../stores/auth/auth-context';
import { DealForm } from '../../components/deal/DealForm';
import { DealDetailModal } from '../../components/deal/DealDetailModal';

function DealsPageContent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<DealStatus | 'ALL'>('ALL');

  // Check for propertyId in URL query params
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const propertyId = params.get('propertyId');
      if (propertyId) {
        setSelectedPropertyId(propertyId);
        setShowForm(true);
        // Clean up URL
        window.history.replaceState({}, '', '/deals');
      }
    }
  }, []);

  // Fetch deals
  const {
    data: deals = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['deals'],
    queryFn: dealApi.getAll,
  });

  // Fetch properties for the create form
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: propertyApi.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: dealApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setShowForm(false);
      setSelectedPropertyId(null);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDealDto }) =>
      dealApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setSelectedDeal(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: dealApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setSelectedDeal(null);
    },
  });

  // Filter and sort deals
  const filteredAndSortedDeals = useMemo(() => {
    let filtered = deals;
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    return [...filtered].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [deals, statusFilter]);

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
  };

  const handleCreateDeal = async (data: CreateDealDto | UpdateDealDto) => {
    await createMutation.mutateAsync(data as CreateDealDto);
  };

  const handleUpdateDeal = async (data: CreateDealDto | UpdateDealDto) => {
    if (selectedDeal) {
      await updateMutation.mutateAsync({
        id: selectedDeal.id,
        data: data as UpdateDealDto,
      });
    }
  };

  const handleDeleteDeal = async () => {
    if (selectedDeal && confirm('Are you sure you want to delete this deal?')) {
      await deleteMutation.mutateAsync(selectedDeal.id);
    }
  };

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['deals'] });
  };

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
          <Navigation />
          <div className="flex items-center justify-center h-[calc(100vh-64px)]">
            <div className="text-center glass rounded-3xl p-12 max-w-md mx-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
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
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                Error loading deals
              </p>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Please try again or contact support if the problem persists.
              </p>
              <Button onClick={handleRetry} className="btn-glow">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
        <Navigation />
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary-200 dark:bg-brand-primary-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary-200 dark:bg-brand-secondary-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float delay-300" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8 animate-fade-in-down">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-50 mb-2">
                  Deals
                </h1>
                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                  Manage your real estate deal analysis
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowForm(true);
                  setSelectedPropertyId(null);
                }}
                className="btn-glow shadow-medium hover:shadow-glow-lg transition-all duration-300"
              >
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Deal
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex items-center gap-4">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Filter by Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DealStatus | 'ALL')}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            >
              <option value="ALL">All Statuses</option>
              {Object.values(DealStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {filteredAndSortedDeals.length} {filteredAndSortedDeals.length === 1 ? 'deal' : 'deals'}
            </span>
          </div>

          {/* Create Deal Form */}
          {showForm && (
            <div className="mb-8 glass rounded-3xl p-8 border border-neutral-200/50 dark:border-neutral-700/50 shadow-medium animate-scale-in card-hover">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-neutral-200/50 dark:border-neutral-700/50">
                <div>
                  <h2 className="text-2xl font-display font-bold text-neutral-900 dark:text-neutral-50">
                    Create New Deal
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Add a new deal analysis for a property
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedPropertyId(null);
                  }}
                >
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
                </Button>
              </div>
              <DealForm
                properties={properties}
                initialPropertyId={selectedPropertyId || undefined}
                onSubmit={handleCreateDeal}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedPropertyId(null);
                }}
                isLoading={createMutation.isPending}
              />
            </div>
          )}

          {/* Deals Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block relative mb-4">
                  <div className="w-16 h-16 border-4 border-brand-primary-200 dark:border-brand-primary-800 border-t-brand-primary-600 dark:border-t-brand-primary-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                  Loading deals...
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Please wait while we fetch your data
                </p>
              </div>
            </div>
          ) : filteredAndSortedDeals.length === 0 ? (
            <div className="p-16 md:p-20 text-center glass rounded-3xl border border-neutral-200/50 dark:border-neutral-700/50">
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
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                No deals found
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                {statusFilter !== 'ALL'
                  ? `No deals with status "${statusFilter.replace('_', ' ')}" found.`
                  : 'Get started by creating your first deal analysis.'}
              </p>
              <Button
                onClick={() => {
                  setShowForm(true);
                  setSelectedPropertyId(null);
                }}
                className="btn-glow"
              >
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Your First Deal
              </Button>
            </div>
          ) : (
            <div className="glass rounded-3xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-medium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 dark:bg-neutral-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Purchase Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Cash Invested
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Monthly Cash Flow
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                    {filteredAndSortedDeals.map((deal) => {
                      const property = (deal as any).property as Property | undefined;
                      const totalCashInvested =
                        (deal.downPayment || 0) +
                        (deal.closingCosts || 0) +
                        (deal.rehabCosts || 0);
                      
                      // Calculate monthly cash flow using the same logic as the valuation service
                      // This matches what analytics shows
                      const calculateMonthlyCashFlow = (deal: Deal) => {
                        // Helper to safely convert to number
                        const toNum = (val: any): number => {
                          if (val === null || val === undefined) return 0;
                          const num = typeof val === 'string' ? parseFloat(val) : Number(val);
                          return isNaN(num) ? 0 : num;
                        };
                        
                        // 1. Calculate Gross Rental Income (annual)
                        const annualRental = toNum(deal.annualRentalIncome);
                        const monthlyRental = toNum(deal.monthlyRentalIncome);
                        const grossRentalIncome = annualRental > 0 ? annualRental : monthlyRental * 12;
                        
                        // 2. Calculate Vacancy Loss
                        const vacancyRate = toNum(deal.vacancyRate);
                        const vacancyLoss = (grossRentalIncome * vacancyRate) / 100;
                        const effectiveGrossIncome = grossRentalIncome - vacancyLoss;
                        
                        // 3. Calculate Operating Expenses (annual)
                        const annualExpenses = toNum(deal.annualExpenses);
                        const monthlyExpenses = toNum(deal.monthlyExpenses);
                        const insurance = toNum(deal.insurance);
                        const propertyTax = toNum(deal.propertyTax);
                        const hoaFees = toNum(deal.hoaFees);
                        const capExReserve = toNum(deal.capExReserve);
                        
                        let operatingExpenses = annualExpenses > 0 
                          ? annualExpenses
                          : (monthlyExpenses * 12 +
                             insurance * 12 +
                             propertyTax * 12 +
                             hoaFees * 12 +
                             capExReserve * 12);
                        
                        // 4. Add Property Management Fee (percentage of effective gross income)
                        const propertyManagementRate = toNum(deal.propertyManagementRate);
                        if (propertyManagementRate > 0) {
                          const managementFee = (effectiveGrossIncome * propertyManagementRate) / 100;
                          operatingExpenses = operatingExpenses + managementFee;
                        }
                        
                        // 5. Calculate NOI
                        const noi = Math.max(0, effectiveGrossIncome - operatingExpenses);
                        
                        // 6. Calculate Debt Service (mortgage payment)
                        let annualDebtService = 0;
                        const loanAmount = toNum(deal.loanAmount);
                        const interestRate = toNum(deal.interestRate);
                        const loanTerm = toNum(deal.loanTerm);
                        
                        if (loanAmount > 0 && interestRate >= 0 && loanTerm > 0) {
                          const principal = loanAmount;
                          const monthlyRate = interestRate / 100 / 12;
                          const numberOfPayments = loanTerm;
                          
                          if (monthlyRate > 0) {
                            const monthlyPayment = 
                              (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                              (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
                            annualDebtService = monthlyPayment * 12;
                          } else {
                            // Interest-free loan
                            annualDebtService = (principal / numberOfPayments) * 12;
                          }
                        }
                        
                        // 7. Calculate Cash Flow
                        const annualCashFlow = noi - annualDebtService;
                        const monthlyCashFlow = annualCashFlow / 12;
                        
                        return Math.round(monthlyCashFlow * 100) / 100;
                      };
                      
                      const monthlyCashFlow = calculateMonthlyCashFlow(deal);

                      return (
                        <tr
                          key={deal.id}
                          onClick={() => handleDealClick(deal)}
                          className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                              {property
                                ? `${property.address}, ${property.city}, ${property.state}`
                                : 'Unknown Property'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-900 dark:text-neutral-50">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(deal.purchasePrice)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                deal.status === DealStatus.CLOSED
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                  : deal.status === DealStatus.UNDER_CONTRACT
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                  : deal.status === DealStatus.CANCELLED
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300'
                              }`}
                            >
                              {deal.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-900 dark:text-neutral-50">
                              {totalCashInvested > 0
                                ? new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(totalCashInvested)
                                : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-900 dark:text-neutral-50">
                              {monthlyCashFlow !== 0
                                ? new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(monthlyCashFlow)
                                : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
                            {new Date(deal.purchaseDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDealClick(deal);
                              }}
                              className="text-brand-primary-600 dark:text-brand-primary-400 hover:text-brand-primary-800 dark:hover:text-brand-primary-300"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Deal Detail Modal */}
        {selectedDeal && (
          <DealDetailModal
            deal={selectedDeal}
            onClose={() => setSelectedDeal(null)}
            onUpdate={handleUpdateDeal}
            onDelete={handleDeleteDeal}
            isLoading={updateMutation.isPending || deleteMutation.isPending}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function DealsPage() {
  return <DealsPageContent />;
}
