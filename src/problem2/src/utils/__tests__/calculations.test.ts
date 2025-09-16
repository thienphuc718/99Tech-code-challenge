import { describe, it, expect } from 'vitest';
import { calculateSwapAmount, getExchangeRate, formatNumber, parseNumericInput, isValidAmount } from '../calculations';
import type { Token } from '../../types/token';

const mockTokenA: Token = {
  symbol: 'ETH',
  name: 'Ethereum',
  price: 2000,
  iconUrl: 'https://example.com/eth.svg'
};

const mockTokenB: Token = {
  symbol: 'USDC',
  name: 'USD Coin',
  price: 1,
  iconUrl: 'https://example.com/usdc.svg'
};

describe('calculateSwapAmount', () => {
  it('should calculate correct swap amount', () => {
    const result = calculateSwapAmount(mockTokenA, mockTokenB, 1);
    expect(result).toBe(2000);
  });

  it('should return 0 for invalid amounts', () => {
    expect(calculateSwapAmount(mockTokenA, mockTokenB, 0)).toBe(0);
    expect(calculateSwapAmount(mockTokenA, mockTokenB, -1)).toBe(0);
  });

  it('should return 0 when tokens have no price', () => {
    const tokenWithoutPrice = { ...mockTokenA, price: 0 };
    expect(calculateSwapAmount(tokenWithoutPrice, mockTokenB, 1)).toBe(0);
  });
});

describe('getExchangeRate', () => {
  it('should calculate correct exchange rate', () => {
    const rate = getExchangeRate(mockTokenA, mockTokenB);
    expect(rate).toBe(2000);
  });

  it('should return 0 when tokens have no price', () => {
    const tokenWithoutPrice = { ...mockTokenA, price: 0 };
    expect(getExchangeRate(tokenWithoutPrice, mockTokenB)).toBe(0);
  });
});

describe('formatNumber', () => {
  it('should format large numbers with suffixes', () => {
    expect(formatNumber(1500000)).toBe('1.50M');
    expect(formatNumber(1500)).toBe('1.50K');
  });

  it('should format small numbers with appropriate decimals', () => {
    expect(formatNumber(0.123456)).toBe('0.123456');
    expect(formatNumber(0.0000001)).toBe('1.00e-7');
  });

  it('should return "0" for zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('parseNumericInput', () => {
  it('should parse valid numeric strings', () => {
    expect(parseNumericInput('123.45')).toBe(123.45);
    expect(parseNumericInput('0.001')).toBe(0.001);
  });

  it('should handle invalid characters', () => {
    expect(parseNumericInput('abc123.45def')).toBe(123.45);
    expect(parseNumericInput('$123.45')).toBe(123.45);
  });

  it('should handle multiple decimal points', () => {
    expect(parseNumericInput('123.45.67')).toBe(123.4567);
  });
});

describe('isValidAmount', () => {
  it('should validate positive numbers', () => {
    expect(isValidAmount('123.45')).toBe(true);
    expect(isValidAmount('0.001')).toBe(true);
  });

  it('should reject invalid amounts', () => {
    expect(isValidAmount('0')).toBe(false);
    expect(isValidAmount('-123')).toBe(false);
    expect(isValidAmount('abc')).toBe(false);
    expect(isValidAmount('')).toBe(false);
  });
});