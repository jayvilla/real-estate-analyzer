'use client';

import React, { useState } from 'react';
import { Deal, UpdateDealDto, Property } from '@real-estate-analyzer/types';
import { Button } from '@real-estate-analyzer/ui';
import { DealForm } from './DealForm';
import { useQuery } from '@tanstack/react-query';
import { propertyApi } from '../../lib/api';

interface DealDetailModalProps {
  deal: Deal;
  onClose: () => void;
  onUpdate: (data: UpdateDealDto) => Promise<void>;
  onDelete: () => Promise<void>;
  isLoading?: boolean;
}

export function DealDetailModal({
  deal,
  onClose,
  onUpdate,
  onDelete,
  isLoading = false,
}: DealDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch property details
  const { data: property } = useQuery({
    queryKey: ['property', deal.propertyId],
    queryFn: () => propertyApi.getById(deal.propertyId),
    enabled: !!deal.propertyId,
  });

  // Fetch all properties for the form
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: propertyApi.getAll,
  });

  const totalCashInvested =
    (typeof deal.downPayment === 'number' ? deal.downPayment : parseFloat(String(deal.downPayment || 0))) +
    (typeof deal.closingCosts === 'number' ? deal.closingCosts : parseFloat(String(deal.closingCosts || 0))) +
    (typeof deal.rehabCosts === 'number' ? deal.rehabCosts : parseFloat(String(deal.rehabCosts || 0)));

  const monthlyRental =
    typeof deal.monthlyRentalIncome === 'number'
      ? deal.monthlyRentalIncome
      : parseFloat(String(deal.monthlyRentalIncome || 0));
  const monthlyExpenses =
    typeof deal.monthlyExpenses === 'number'
      ? deal.monthlyExpenses
      : parseFloat(String(deal.monthlyExpenses || 0));
  const estimatedMonthlyCashFlow = monthlyRental - monthlyExpenses;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              Deal Details
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
            <DealForm
              properties={properties}
              initialData={deal}
              onSubmit={onUpdate}
              onCancel={() => setIsEditing(false)}
              isLoading={isLoading}
            />
          ) : (
            <div className="space-y-6">
              {/* Property Info */}
              {property && (
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                    Property
                  </h3>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                    {property.address}, {property.city}, {property.state} {property.zipCode}
                  </p>
                </div>
              )}

              {/* Purchase Information */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-3">
                  Purchase Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Purchase Price
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-50">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(deal.purchasePrice)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Purchase Date
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-50">
                      {new Date(deal.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                  {deal.closingCosts && (
                    <div>
                      <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        Closing Costs
                      </label>
                      <p className="text-neutral-900 dark:text-neutral-50">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(deal.closingCosts)}
                      </p>
                    </div>
                  )}
                  {deal.rehabCosts && (
                    <div>
                      <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        Rehab Costs
                      </label>
                      <p className="text-neutral-900 dark:text-neutral-50">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(deal.rehabCosts)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financing Details */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-3">
                  Financing Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Loan Type
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-50">
                      {deal.loanType.replace('_', ' ')}
                    </p>
                  </div>
                  {deal.downPayment && (
                    <div>
                      <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        Down Payment
                      </label>
                      <p className="text-neutral-900 dark:text-neutral-50">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(deal.downPayment)}
                        {deal.downPaymentPercent &&
                          ` (${
                            typeof deal.downPaymentPercent === 'number'
                              ? deal.downPaymentPercent
                              : parseFloat(String(deal.downPaymentPercent || 0))
                          }%)`}
                      </p>
                    </div>
                  )}
                  {deal.loanAmount && (
                    <div>
                      <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        Loan Amount
                      </label>
                      <p className="text-neutral-900 dark:text-neutral-50">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(deal.loanAmount)}
                      </p>
                    </div>
                  )}
                  {deal.interestRate && (
                    <div>
                      <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        Interest Rate
                      </label>
                      <p className="text-neutral-900 dark:text-neutral-50">
                        {typeof deal.interestRate === 'number'
                          ? deal.interestRate.toFixed(2)
                          : parseFloat(String(deal.interestRate || 0)).toFixed(2)}%
                      </p>
                    </div>
                  )}
                  {deal.loanTerm && (
                    <div>
                      <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        Loan Term
                      </label>
                      <p className="text-neutral-900 dark:text-neutral-50">
                        {typeof deal.loanTerm === 'number'
                          ? deal.loanTerm
                          : parseInt(String(deal.loanTerm || 0), 10)}{' '}
                        months (
                        {Math.round(
                          (typeof deal.loanTerm === 'number'
                            ? deal.loanTerm
                            : parseInt(String(deal.loanTerm || 0), 10)) / 12
                        )}{' '}
                        years)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Operating Assumptions */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-3">
                  Operating Assumptions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {deal.monthlyRentalIncome && (
                    <div>
                      <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        Monthly Rental Income
                      </label>
                      <p className="text-neutral-900 dark:text-neutral-50">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(deal.monthlyRentalIncome)}
                      </p>
                    </div>
                  )}
                  {deal.annualRentalIncome && (
                    <div>
                      <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        Annual Rental Income
                      </label>
                      <p className="text-neutral-900 dark:text-neutral-50">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(deal.annualRentalIncome)}
                      </p>
                    </div>
                  )}
                  {deal.monthlyExpenses && (
                    <div>
                      <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        Monthly Expenses
                      </label>
                      <p className="text-neutral-900 dark:text-neutral-50">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(deal.monthlyExpenses)}
                      </p>
                    </div>
                  )}
                  {deal.vacancyRate && (
                    <div>
                      <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        Vacancy Rate
                      </label>
                      <p className="text-neutral-900 dark:text-neutral-50">
                        {typeof deal.vacancyRate === 'number'
                          ? deal.vacancyRate
                          : parseFloat(String(deal.vacancyRate || 0))}%
                      </p>
                    </div>
                  )}
                  {deal.propertyManagementRate && (
                    <div>
                      <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        Property Management Rate
                      </label>
                      <p className="text-neutral-900 dark:text-neutral-50">
                        {typeof deal.propertyManagementRate === 'number'
                          ? deal.propertyManagementRate
                          : parseFloat(String(deal.propertyManagementRate || 0))}%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="bg-gradient-to-br from-brand-primary-50 to-brand-secondary-50 dark:from-brand-primary-900/20 dark:to-brand-secondary-900/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-3">
                  Quick Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Total Cash Invested
                    </label>
                    <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                      {totalCashInvested > 0
                        ? new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(totalCashInvested)
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Estimated Monthly Cash Flow
                    </label>
                    <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                      {estimatedMonthlyCashFlow !== 0
                        ? new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(estimatedMonthlyCashFlow)
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Status
                </label>
                <p className="text-neutral-900 dark:text-neutral-50">
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      deal.status === 'CLOSED'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : deal.status === 'UNDER_CONTRACT'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        : deal.status === 'CANCELLED'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    {deal.status.replace('_', ' ')}
                  </span>
                </p>
              </div>

              {/* Notes */}
              {deal.notes && (
                <div>
                  <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Notes
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-50 whitespace-pre-wrap">
                    {deal.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <Button
                  variant="danger"
                  onClick={onDelete}
                  isLoading={isLoading}
                >
                  Delete
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

