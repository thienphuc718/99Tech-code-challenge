import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExclamationTriangleIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import type { Token, SwapFormData } from '../types/token';
import { TokenSelector } from './TokenSelector';
import { AmountInput } from './AmountInput';
import { tokenService } from '../services/tokenService';
import { calculateSwapAmount, getExchangeRate, isValidAmount, formatNumber } from '../utils/calculations';

interface SwapFormProps {
  onSwap: (data: SwapFormData) => Promise<void>;
}

export const SwapForm: React.FC<SwapFormProps> = ({ onSwap }) => {
  const [formData, setFormData] = useState<SwapFormData>({
    fromToken: null,
    toToken: null,
    fromAmount: '',
    toAmount: ''
  });

  const [errors, setErrors] = useState<{
    fromAmount?: string;
    fromToken?: string;
    toToken?: string;
    general?: string;
  }>({});

  const [isSwapping, setIsSwapping] = useState(false);

  const { data: tokens = [], isLoading, error } = useQuery({
    queryKey: ['tokens'],
    queryFn: () => tokenService.getTokens(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000)
  });

  const updateToAmount = useCallback(() => {
    if (formData.fromToken && formData.toToken && formData.fromAmount && isValidAmount(formData.fromAmount)) {
      const fromAmountNum = parseFloat(formData.fromAmount);
      const toAmountNum = calculateSwapAmount(formData.fromToken, formData.toToken, fromAmountNum);
      setFormData(prev => ({
        ...prev,
        toAmount: formatNumber(toAmountNum, 8)
      }));
    } else {
      setFormData(prev => ({ ...prev, toAmount: '' }));
    }
  }, [formData.fromToken, formData.toToken, formData.fromAmount]);

  useEffect(() => {
    updateToAmount();
  }, [updateToAmount]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.fromToken) {
      newErrors.fromToken = 'Please select a token to swap from';
    }

    if (!formData.toToken) {
      newErrors.toToken = 'Please select a token to swap to';
    }

    if (formData.fromToken && formData.toToken && formData.fromToken.symbol === formData.toToken.symbol) {
      newErrors.general = 'Cannot swap the same token';
    }

    if (!formData.fromAmount) {
      newErrors.fromAmount = 'Please enter an amount';
    } else if (!isValidAmount(formData.fromAmount)) {
      newErrors.fromAmount = 'Please enter a valid amount greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFromAmountChange = (value: string) => {
    setFormData(prev => ({ ...prev, fromAmount: value }));
    if (errors.fromAmount && value && isValidAmount(value)) {
      setErrors(prev => ({ ...prev, fromAmount: undefined }));
    }
  };

  const handleFromTokenSelect = (token: Token) => {
    setFormData(prev => ({ ...prev, fromToken: token }));
    if (errors.fromToken) {
      setErrors(prev => ({ ...prev, fromToken: undefined }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  const handleToTokenSelect = (token: Token) => {
    setFormData(prev => ({ ...prev, toToken: token }));
    if (errors.toToken) {
      setErrors(prev => ({ ...prev, toToken: undefined }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  const handleSwapTokens = () => {
    if (formData.fromToken && formData.toToken) {
      setFormData(prev => ({
        ...prev,
        fromToken: prev.toToken,
        toToken: prev.fromToken,
        fromAmount: prev.toAmount,
        toAmount: prev.fromAmount
      }));
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSwapping(true);
    try {
      await onSwap(formData);
    } catch (error) {
      console.error('Swap failed:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Swap failed. Please try again.'
      }));
    } finally {
      setIsSwapping(false);
    }
  };

  const exchangeRate = formData.fromToken && formData.toToken
    ? getExchangeRate(formData.fromToken, formData.toToken)
    : 0;

  const isFormValid = formData.fromToken &&
                     formData.toToken &&
                     formData.fromAmount &&
                     isValidAmount(formData.fromAmount) &&
                     formData.fromToken.symbol !== formData.toToken.symbol;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-neutral-800 rounded-card shadow-card-lg p-8 border border-neutral-700">
          <ArrowPathIcon className="animate-spin h-12 w-12 text-accent-500 mx-auto mb-4" />
          <p className="text-neutral-300 font-medium">Loading tokens...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-neutral-800 rounded-card shadow-card-lg p-8 border border-neutral-700 max-w-md">
          <div className="text-red-400 mb-6">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-3">Failed to Load Tokens</h2>
          <p className="text-neutral-400 mb-6 font-medium">Unable to fetch token data. Please check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-card transition-all duration-200 shadow-card hover:shadow-card-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-neutral-800 rounded-card shadow-card-xl border border-neutral-700 backdrop-blur-sm">
          <div className="p-4 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2" id="swap-form-title">
                Currency Swap
              </h1>
              <p className="text-sm sm:text-base text-neutral-400 font-medium" id="swap-form-description">Swap tokens instantly with competitive rates</p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 sm:space-y-8"
              aria-labelledby="swap-form-title"
              aria-describedby="swap-form-description"
              noValidate
            >
              <div className="space-y-4 sm:space-y-6">
                <TokenSelector
                  tokens={tokens}
                  selectedToken={formData.fromToken}
                  onTokenSelect={handleFromTokenSelect}
                  label="From"
                  placeholder="Select token to swap from"
                  excludeToken={formData.toToken}
                />

                {errors.fromToken && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-950/30 border border-red-500/30 rounded-card-sm">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm font-medium text-red-400" role="alert">{errors.fromToken}</p>
                  </div>
                )}

                <AmountInput
                  label="Amount"
                  value={formData.fromAmount}
                  onChange={handleFromAmountChange}
                  token={formData.fromToken}
                  placeholder="0.0"
                  error={errors.fromAmount}
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSwapTokens}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSwapTokens();
                    }
                  }}
                  className="p-3 bg-neutral-700 hover:bg-accent-600 rounded-full transition-all duration-300 transform hover:rotate-180 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent-500 shadow-card hover:shadow-card-lg border border-neutral-600 hover:border-accent-500 button-press"
                  aria-label="Swap tokens"
                  tabIndex={0}
                >
                  <ArrowsUpDownIcon className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <TokenSelector
                  tokens={tokens}
                  selectedToken={formData.toToken}
                  onTokenSelect={handleToTokenSelect}
                  label="To"
                  placeholder="Select token to receive"
                  excludeToken={formData.fromToken}
                />

                {errors.toToken && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-950/30 border border-red-500/30 rounded-card-sm">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm font-medium text-red-400" role="alert">{errors.toToken}</p>
                  </div>
                )}

                <AmountInput
                  label="You'll receive"
                  value={formData.toAmount}
                  onChange={() => {}}
                  token={formData.toToken}
                  placeholder="0.0"
                  disabled={true}
                />
              </div>

              {exchangeRate > 0 && formData.fromToken && formData.toToken && (
                <div className="bg-neutral-700 border border-neutral-600 rounded-card p-4 shadow-card">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300 font-medium text-sm">Exchange Rate</span>
                    <span className="text-white font-semibold text-sm" aria-label={`Exchange rate: 1 ${formData.fromToken.symbol} equals ${formatNumber(exchangeRate, 6)} ${formData.toToken.symbol}`}>
                      1 {formData.fromToken.symbol} = {formatNumber(exchangeRate, 6)} {formData.toToken.symbol}
                    </span>
                  </div>
                </div>
              )}

              {errors.general && (
                <div className="flex items-center gap-3 bg-red-950/30 border border-red-500/30 rounded-card p-4 shadow-card">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm font-medium text-red-400" role="alert">{errors.general}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!isFormValid || isSwapping}
                className={`
                  w-full py-3 sm:py-4 px-4 sm:px-6 rounded-card font-bold text-base sm:text-lg transition-all duration-200 shadow-card button-press
                  ${isFormValid && !isSwapping
                    ? 'bg-accent-600 hover:bg-accent-700 text-white hover:shadow-card-lg transform hover:-translate-y-0.5 focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-neutral-800 hover-scale'
                    : 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
                  }
                `}
              >
                {isSwapping ? (
                  <div className="flex items-center justify-center">
                    <ArrowPathIcon className="animate-spin h-5 w-5 text-white mr-2" />
                    Processing Swap...
                  </div>
                ) : (
                  'Confirm Swap'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};