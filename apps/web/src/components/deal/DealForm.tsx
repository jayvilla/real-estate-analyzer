'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@real-estate-analyzer/ui';
import {
  CreateDealDto,
  UpdateDealDto,
  LoanType,
  DealStatus,
  Property,
} from '@real-estate-analyzer/types';

interface DealFormProps {
  properties: Property[];
  initialData?: Partial<CreateDealDto | UpdateDealDto>;
  initialPropertyId?: string;
  onSubmit: (data: CreateDealDto | UpdateDealDto) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function DealForm({
  properties,
  initialData,
  initialPropertyId,
  onSubmit,
  onCancel,
  isLoading = false,
}: DealFormProps) {
  const [formData, setFormData] = useState({
    propertyId: initialPropertyId || initialData?.propertyId || '',
    purchasePrice: initialData?.purchasePrice?.toString() || '',
    purchaseDate: initialData?.purchaseDate
      ? new Date(initialData.purchaseDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    closingCosts: initialData?.closingCosts?.toString() || '',
    rehabCosts: initialData?.rehabCosts?.toString() || '',
    loanType: initialData?.loanType || LoanType.CONVENTIONAL,
    loanAmount: initialData?.loanAmount?.toString() || '',
    downPayment: initialData?.downPayment?.toString() || '',
    downPaymentPercent: initialData?.downPaymentPercent?.toString() || '',
    interestRate: initialData?.interestRate?.toString() || '',
    loanTerm: initialData?.loanTerm?.toString() || '360',
    monthlyRentalIncome: initialData?.monthlyRentalIncome?.toString() || '',
    annualRentalIncome: initialData?.annualRentalIncome?.toString() || '',
    monthlyExpenses: initialData?.monthlyExpenses?.toString() || '',
    annualExpenses: initialData?.annualExpenses?.toString() || '',
    vacancyRate: initialData?.vacancyRate?.toString() || '5',
    propertyManagementRate: initialData?.propertyManagementRate?.toString() || '8',
    annualAppreciationRate: initialData?.annualAppreciationRate?.toString() || '3',
    annualInflationRate: initialData?.annualInflationRate?.toString() || '2.5',
    capExReserve: initialData?.capExReserve?.toString() || '',
    insurance: initialData?.insurance?.toString() || '',
    propertyTax: initialData?.propertyTax?.toString() || '',
    hoaFees: initialData?.hoaFees?.toString() || '',
    status: initialData?.status || DealStatus.DRAFT,
    notes: initialData?.notes || '',
  });

  // Auto-calculate annual rental income from monthly
  useEffect(() => {
    if (formData.monthlyRentalIncome && !formData.annualRentalIncome) {
      const monthly = parseFloat(formData.monthlyRentalIncome);
      if (!isNaN(monthly)) {
        setFormData((prev) => ({
          ...prev,
          annualRentalIncome: (monthly * 12).toString(),
        }));
      }
    }
  }, [formData.monthlyRentalIncome]);

  // Auto-calculate annual expenses from monthly
  useEffect(() => {
    if (formData.monthlyExpenses && !formData.annualExpenses) {
      const monthly = parseFloat(formData.monthlyExpenses);
      if (!isNaN(monthly)) {
        setFormData((prev) => ({
          ...prev,
          annualExpenses: (monthly * 12).toString(),
        }));
      }
    }
  }, [formData.monthlyExpenses]);

  // Auto-calculate down payment and loan amount
  useEffect(() => {
    const purchasePrice = parseFloat(formData.purchasePrice);
    const downPaymentPercent = parseFloat(formData.downPaymentPercent);
    
    if (!isNaN(purchasePrice) && !isNaN(downPaymentPercent) && downPaymentPercent > 0) {
      const downPayment = Math.round(purchasePrice * (downPaymentPercent / 100));
      const loanAmount = purchasePrice - downPayment;
      setFormData((prev) => ({
        ...prev,
        downPayment: downPayment.toString(),
        loanAmount: loanAmount.toString(),
      }));
    }
  }, [formData.purchasePrice, formData.downPaymentPercent]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: CreateDealDto | UpdateDealDto = {
      propertyId: formData.propertyId,
      purchasePrice: parseFloat(formData.purchasePrice),
      purchaseDate: new Date(formData.purchaseDate),
      closingCosts: formData.closingCosts ? parseFloat(formData.closingCosts) : undefined,
      rehabCosts: formData.rehabCosts ? parseFloat(formData.rehabCosts) : undefined,
      loanType: formData.loanType as LoanType,
      loanAmount: formData.loanAmount ? parseFloat(formData.loanAmount) : undefined,
      downPayment: formData.downPayment ? parseFloat(formData.downPayment) : undefined,
      downPaymentPercent: formData.downPaymentPercent
        ? parseFloat(formData.downPaymentPercent)
        : undefined,
      interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
      loanTerm: formData.loanTerm ? parseInt(formData.loanTerm, 10) : undefined,
      monthlyRentalIncome: formData.monthlyRentalIncome
        ? parseFloat(formData.monthlyRentalIncome)
        : undefined,
      annualRentalIncome: formData.annualRentalIncome
        ? parseFloat(formData.annualRentalIncome)
        : undefined,
      monthlyExpenses: formData.monthlyExpenses
        ? parseFloat(formData.monthlyExpenses)
        : undefined,
      annualExpenses: formData.annualExpenses
        ? parseFloat(formData.annualExpenses)
        : undefined,
      vacancyRate: formData.vacancyRate ? parseFloat(formData.vacancyRate) : undefined,
      propertyManagementRate: formData.propertyManagementRate
        ? parseFloat(formData.propertyManagementRate)
        : undefined,
      annualAppreciationRate: formData.annualAppreciationRate
        ? parseFloat(formData.annualAppreciationRate)
        : undefined,
      annualInflationRate: formData.annualInflationRate
        ? parseFloat(formData.annualInflationRate)
        : undefined,
      capExReserve: formData.capExReserve ? parseFloat(formData.capExReserve) : undefined,
      insurance: formData.insurance ? parseFloat(formData.insurance) : undefined,
      propertyTax: formData.propertyTax ? parseFloat(formData.propertyTax) : undefined,
      hoaFees: formData.hoaFees ? parseFloat(formData.hoaFees) : undefined,
      status: formData.status as DealStatus,
      notes: formData.notes || undefined,
    };
    await onSubmit(submitData);
  };

  const loanTypeOptions = useMemo(() => Object.values(LoanType), []);
  const statusOptions = useMemo(() => Object.values(DealStatus), []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Property Selection */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Property *
        </label>
        <select
          name="propertyId"
          value={formData.propertyId}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
        >
          <option value="">Select a property</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.address}, {property.city}, {property.state}
            </option>
          ))}
        </select>
      </div>

      {/* Purchase Information */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
          Purchase Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Purchase Price *
            </label>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              required
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Purchase Date *
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Closing Costs
            </label>
            <input
              type="number"
              name="closingCosts"
              value={formData.closingCosts}
              onChange={handleChange}
              min="0"
              step="100"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Rehab Costs
            </label>
            <input
              type="number"
              name="rehabCosts"
              value={formData.rehabCosts}
              onChange={handleChange}
              min="0"
              step="100"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
        </div>
      </div>

      {/* Financing Details */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
          Financing Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Loan Type *
            </label>
            <select
              name="loanType"
              value={formData.loanType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            >
              {loanTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Down Payment Percent (%)
            </label>
            <input
              type="number"
              name="downPaymentPercent"
              value={formData.downPaymentPercent}
              onChange={handleChange}
              min="0"
              max="100"
              step="1"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Down Payment ($)
            </label>
            <input
              type="number"
              name="downPayment"
              value={formData.downPayment}
              onChange={handleChange}
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Loan Amount ($)
            </label>
            <input
              type="number"
              name="loanAmount"
              value={formData.loanAmount}
              onChange={handleChange}
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Interest Rate (%)
            </label>
            <input
              type="number"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleChange}
              min="0"
              max="20"
              step="0.125"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Loan Term (months)
            </label>
            <input
              type="number"
              name="loanTerm"
              value={formData.loanTerm}
              onChange={handleChange}
              min="0"
              step="12"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
        </div>
      </div>

      {/* Operating Assumptions */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
          Operating Assumptions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Monthly Rental Income
            </label>
            <input
              type="number"
              name="monthlyRentalIncome"
              value={formData.monthlyRentalIncome}
              onChange={handleChange}
              min="0"
              step="100"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Annual Rental Income
            </label>
            <input
              type="number"
              name="annualRentalIncome"
              value={formData.annualRentalIncome}
              onChange={handleChange}
              min="0"
              step="100"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Monthly Expenses
            </label>
            <input
              type="number"
              name="monthlyExpenses"
              value={formData.monthlyExpenses}
              onChange={handleChange}
              min="0"
              step="100"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Annual Expenses
            </label>
            <input
              type="number"
              name="annualExpenses"
              value={formData.annualExpenses}
              onChange={handleChange}
              min="0"
              step="100"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Vacancy Rate (%)
            </label>
            <input
              type="number"
              name="vacancyRate"
              value={formData.vacancyRate}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.5"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Property Management Rate (%)
            </label>
            <input
              type="number"
              name="propertyManagementRate"
              value={formData.propertyManagementRate}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.5"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Insurance (monthly)
            </label>
            <input
              type="number"
              name="insurance"
              value={formData.insurance}
              onChange={handleChange}
              min="0"
              step="10"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Property Tax (monthly)
            </label>
            <input
              type="number"
              name="propertyTax"
              value={formData.propertyTax}
              onChange={handleChange}
              min="0"
              step="10"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              CapEx Reserve (monthly)
            </label>
            <input
              type="number"
              name="capExReserve"
              value={formData.capExReserve}
              onChange={handleChange}
              min="0"
              step="10"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              HOA Fees (monthly)
            </label>
            <input
              type="number"
              name="hoaFees"
              value={formData.hoaFees}
              onChange={handleChange}
              min="0"
              step="10"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Annual Appreciation Rate (%)
            </label>
            <input
              type="number"
              name="annualAppreciationRate"
              value={formData.annualAppreciationRate}
              onChange={handleChange}
              min="0"
              max="20"
              step="0.1"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Annual Inflation Rate (%)
            </label>
            <input
              type="number"
              name="annualInflationRate"
              value={formData.annualInflationRate}
              onChange={handleChange}
              min="0"
              max="10"
              step="0.1"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            />
          </div>
        </div>
      </div>

      {/* Status and Notes */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
          Status & Notes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
            placeholder="Additional notes about this deal..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Deal' : 'Create Deal'}
        </Button>
      </div>
    </form>
  );
}

