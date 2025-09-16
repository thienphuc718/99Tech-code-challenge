import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
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
      <label className="block text-sm font-semibold text-neutral-200 mb-2 sm:mb-3">
        {label}
      </label>

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative w-full bg-neutral-800 border rounded-card px-3 sm:px-4 py-3 sm:py-4 text-left
          shadow-card backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500
          transition-all duration-200 min-h-[56px] sm:min-h-[64px]
          ${disabled
            ? 'opacity-50 cursor-not-allowed border-neutral-600'
            : 'hover:border-neutral-500 hover:shadow-card-lg cursor-pointer border-neutral-600 hover:bg-neutral-750'
          }
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label}: ${selectedToken ? selectedToken.name : placeholder}`}
      >
        {selectedToken ? (
          <div className="flex items-center">
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 shadow-sm">
              <img
                src={selectedToken.iconUrl}
                alt={selectedToken.symbol}
                className="w-5 sm:w-7 h-5 sm:h-7 rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling!.textContent = selectedToken.symbol.slice(0, 2);
                }}
              />
              <span className="text-xs font-bold text-white hidden">
                {selectedToken.symbol.slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white text-sm sm:text-base">{selectedToken.symbol}</div>
              <div className="text-xs sm:text-sm text-neutral-400 truncate font-medium">{selectedToken.name}</div>
            </div>
            <div className="text-right ml-2 sm:ml-3 mr-8 sm:mr-10">
              <div className="text-xs sm:text-sm font-semibold text-white">
                ${formatNumber(selectedToken.price, 4)}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-neutral-400 font-medium">{placeholder}</span>
        )}

        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <ChevronDownIcon
            className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-neutral-800 border border-neutral-600 rounded-card shadow-card-xl backdrop-blur-sm max-h-80 overflow-hidden animate-slide-up">
          <div className="p-4 border-b border-neutral-700">
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-700 border border-neutral-600 rounded-card-sm px-3 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-medium transition-all duration-200"
              autoFocus
              aria-label="Search for tokens by name or symbol"
              role="searchbox"
              aria-expanded={filteredTokens.length > 0}
              aria-controls="token-list"
            />
          </div>

          <div className="overflow-y-auto max-h-64" role="listbox" id="token-list" aria-label={`${label} token options`}>
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <button
                  key={token.symbol}
                  type="button"
                  onClick={() => handleTokenSelect(token)}
                  className="w-full px-4 py-3 text-left hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none transition-all duration-150 border-b border-neutral-700 last:border-b-0 group"
                  role="option"
                  aria-selected={selectedToken?.symbol === token.symbol}
                >
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center mr-3 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow duration-150">
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
                      <span className="text-xs font-bold text-white hidden">
                        {token.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white group-hover:text-accent-400 transition-colors duration-150">{token.symbol}</div>
                      <div className="text-sm text-neutral-400 truncate font-medium">{token.name}</div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-sm font-semibold text-neutral-300">
                        ${formatNumber(token.price, 4)}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-neutral-400 font-medium">
                No tokens found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};