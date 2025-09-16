import type { Token } from '../types/token';

export const calculateSwapAmount = (
  fromToken: Token,
  toToken: Token,
  fromAmount: number
): number => {
  if (fromAmount <= 0 || !fromToken.price || !toToken.price) {
    return 0;
  }

  const usdValue = fromAmount * fromToken.price;
  return usdValue / toToken.price;
};

export const getExchangeRate = (fromToken: Token, toToken: Token): number => {
  if (!fromToken.price || !toToken.price) {
    return 0;
  }
  return fromToken.price / toToken.price;
};

export const formatNumber = (value: number, decimals: number = 6): string => {
  if (value === 0) return '0';

  if (value < 0.000001) {
    return value.toExponential(2);
  }

  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M';
  }

  if (value >= 1000) {
    return (value / 1000).toFixed(2) + 'K';
  }

  return parseFloat(value.toFixed(decimals)).toString();
};

export const parseNumericInput = (value: string): number => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');

  if (parts.length > 2) {
    return parseFloat(parts[0] + '.' + parts.slice(1).join(''));
  }

  return parseFloat(cleaned) || 0;
};

export const isValidAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && isFinite(num);
};