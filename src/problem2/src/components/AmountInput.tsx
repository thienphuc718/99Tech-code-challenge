import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { Token } from '../types/token';

interface AmountInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  token: Token | null;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  label,
  value,
  onChange,
  token,
  placeholder = '0.0',
  disabled = false,
  error
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    const cleanedValue = inputValue.replace(/[^0-9.]/g, '');

    const parts = cleanedValue.split('.');
    if (parts.length > 2) {
      const reconstructed = parts[0] + '.' + parts.slice(1).join('');
      onChange(reconstructed);
    } else {
      onChange(cleanedValue);
    }
  };

  const formatUsdValue = (): string => {
    if (!token || !value || isNaN(parseFloat(value))) {
      return '$0.00';
    }
    const usdValue = parseFloat(value) * token.price;
    return `$${usdValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-neutral-200">
        {label}
      </label>

      <div className={`
        relative bg-neutral-800 border rounded-card transition-all duration-200 shadow-card
        ${error
          ? 'border-red-500 ring-1 ring-red-500/20'
          : 'border-neutral-600 focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-500/20'
        }
        ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-neutral-500 hover:shadow-card-lg'
        }
      `}>
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full bg-transparent px-3 sm:px-4 py-3 sm:py-4 text-xl sm:text-2xl font-semibold text-white placeholder-neutral-400
            focus:outline-none rounded-card text-right pr-4
            ${disabled ? 'cursor-not-allowed' : ''}
            ${token && value && !isNaN(parseFloat(value)) ? 'pr-20 sm:pr-24' : 'pr-4'}
          `}
          aria-label={`${label} amount`}
          aria-describedby={error ? `${label}-error` : undefined}
          style={{ fontFeatureSettings: '"tnum"' }}
        />

        {token && value && !isNaN(parseFloat(value)) && (
          <div className="absolute right-3 sm:right-4 bottom-2 text-xs font-medium text-neutral-400 bg-neutral-800 px-1 rounded">
            {formatUsdValue()}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-950/30 border border-red-500/30 rounded-card-sm">
          <ExclamationTriangleIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p id={`${label}-error`} className="text-sm font-medium text-red-400" role="alert">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};