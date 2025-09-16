import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tokens...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Tokens</h2>
          <p className="text-gray-400 mb-4">Unable to fetch token data. Please check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-navy-900 rounded-2xl shadow-2xl border border-navy-700 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white text-center mb-8">
              Currency Swap
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <TokenSelector
                  tokens={tokens}
                  selectedToken={formData.fromToken}
                  onTokenSelect={handleFromTokenSelect}
                  label="From"
                  placeholder="Select token to swap from"
                  excludeToken={formData.toToken}
                />

                {errors.fromToken && (
                  <p className="text-sm text-red-400" role="alert">{errors.fromToken}</p>
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
                  className="p-2 bg-navy-700 hover:bg-navy-600 rounded-full transition-all duration-200 transform hover:rotate-180 focus:outline-none focus:ring-2 focus:ring-navy-400"
                  aria-label="Swap tokens"
                  tabIndex={0}
                >
                  <svg className="w-6 h-6 text-navy-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <TokenSelector
                  tokens={tokens}
                  selectedToken={formData.toToken}
                  onTokenSelect={handleToTokenSelect}
                  label="To"
                  placeholder="Select token to receive"
                  excludeToken={formData.fromToken}
                />

                {errors.toToken && (
                  <p className="text-sm text-red-400" role="alert">{errors.toToken}</p>
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
                <div className="bg-navy-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Exchange Rate</span>
                    <span className="text-white" aria-label={`Exchange rate: 1 ${formData.fromToken.symbol} equals ${formatNumber(exchangeRate, 6)} ${formData.toToken.symbol}`}>
                      1 {formData.fromToken.symbol} = {formatNumber(exchangeRate, 6)} {formData.toToken.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Price Impact</span>
                    <span className="text-green-400" aria-label="Price impact approximately zero percent">~0.00%</span>
                  </div>
                </div>
              )}

              {errors.general && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-sm text-red-400" role="alert">{errors.general}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!isFormValid || isSwapping}
                className={`
                  w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200
                  ${isFormValid && !isSwapping
                    ? 'bg-navy-600 hover:bg-navy-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isSwapping ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
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