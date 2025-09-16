import React from 'react';
import { Token } from '../types/token';

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
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-200">
        {label}
      </label>

      <div className={`
        relative bg-navy-800 border rounded-lg transition-all duration-200
        ${error ? 'border-red-500' : 'border-navy-600 focus-within:border-navy-400'}
        ${disabled ? 'opacity-50' : 'hover:border-navy-500'}
      `}>
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full bg-transparent px-4 py-4 text-xl font-medium text-white placeholder-gray-400
            focus:outline-none rounded-lg
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          aria-label={`${label} amount`}
          aria-describedby={error ? `${label}-error` : undefined}
        />

        {token && value && !isNaN(parseFloat(value)) && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {formatUsdValue()}
          </div>
        )}
      </div>

      {error && (
        <p id={`${label}-error`} className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};