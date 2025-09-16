import React, { useState, useRef, useEffect } from 'react';
import type { Token } from '../types/token';
import { formatNumber } from '../utils/calculations';

interface TokenSelectorProps {
  tokens: Token[];
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  excludeToken?: Token | null;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  tokens,
  selectedToken,
  onTokenSelect,
  label,
  placeholder = 'Select token',
  disabled = false,
  excludeToken
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTokens = tokens.filter(token => {
    const matchesSearch = token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         token.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isNotExcluded = !excludeToken || token.symbol !== excludeToken.symbol;
    return matchesSearch && isNotExcluded;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-200 mb-2">
        {label}
      </label>

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative w-full bg-navy-800 border border-navy-600 rounded-lg px-4 py-3 text-left
          focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent
          transition-all duration-200 min-h-[56px]
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-navy-500 cursor-pointer'}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label}: ${selectedToken ? selectedToken.name : placeholder}`}
      >
        {selectedToken ? (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center mr-3 flex-shrink-0">
              <img
                src={selectedToken.iconUrl}
                alt={selectedToken.symbol}
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling!.textContent = selectedToken.symbol.slice(0, 2);
                }}
              />
              <span className="text-xs font-bold text-navy-200 hidden">
                {selectedToken.symbol.slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white">{selectedToken.symbol}</div>
              <div className="text-sm text-gray-400 truncate">{selectedToken.name}</div>
            </div>
            <div className="text-right text-sm text-gray-400 ml-2">
              ${formatNumber(selectedToken.price, 4)}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}

        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-navy-800 border border-navy-600 rounded-lg shadow-xl max-h-80 overflow-hidden">
          <div className="p-3 border-b border-navy-600">
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-navy-700 border border-navy-500 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto max-h-64">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <button
                  key={token.symbol}
                  type="button"
                  onClick={() => handleTokenSelect(token)}
                  className="w-full px-4 py-3 text-left hover:bg-navy-700 focus:bg-navy-700 focus:outline-none transition-colors duration-150 border-b border-navy-700 last:border-b-0"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center mr-3 flex-shrink-0">
                      <img
                        src={token.iconUrl}
                        alt={token.symbol}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.textContent = token.symbol.slice(0, 2);
                        }}
                      />
                      <span className="text-xs font-bold text-navy-200 hidden">
                        {token.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white">{token.symbol}</div>
                      <div className="text-sm text-gray-400 truncate">{token.name}</div>
                    </div>
                    <div className="text-right text-sm text-gray-400 ml-2">
                      ${formatNumber(token.price, 4)}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-400">
                No tokens found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};