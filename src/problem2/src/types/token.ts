export interface TokenPrice {
  currency: string;
  date: string;
  price: number;
}

export interface Token {
  symbol: string;
  name: string;
  price: number;
  iconUrl: string;
}

export interface SwapFormData {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
}

export interface SwapCalculation {
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  fromToken: Token;
  toToken: Token;
}