import type { Token, TokenPrice } from '../types/token';

const PRICES_API_URL = 'https://interview.switcheo.com/prices.json';
const TOKEN_ICONS_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

const tokenNameMap: Record<string, string> = {
  BLUR: 'Blur',
  bNEO: 'Binance NEO',
  BUSD: 'Binance USD',
  USD: 'US Dollar',
  ETH: 'Ethereum',
  GMX: 'GMX',
  STEVMOS: 'Stride Staked EVMOS',
  LUNA: 'Terra Luna',
  RATOM: 'Stride Staked ATOM',
  STRD: 'Stride',
  EVMOS: 'Evmos',
  IBCX: 'IBCX',
  IRIS: 'IRISnet',
  ampLUNA: 'Amplified Luna',
  KUJI: 'Kujira',
  STOSMO: 'Stride Staked OSMO',
  USDC: 'USD Coin',
  axlUSDC: 'Axelar USD Coin',
  ATOM: 'Cosmos',
  STATOM: 'Stride Staked ATOM',
  OSMO: 'Osmosis',
  rSWTH: 'Demex Reward Token',
  STLUNA: 'Stride Staked Luna',
  LSI: 'Liquid Staking Index',
  OKB: 'OKB',
  OKT: 'OKExChain Token',
  SWTH: 'Switcheo',
  USC: 'USD Coin',
  WBTC: 'Wrapped Bitcoin',
  wstETH: 'Wrapped Staked Ether',
  YieldUSD: 'Yield USD',
  ZIL: 'Zilliqa'
};

class TokenService {
  private cachedTokens: Token[] | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async fetchTokenPrices(): Promise<TokenPrice[]> {
    try {
      const response = await fetch(PRICES_API_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch prices: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching token prices:', error);
      throw new Error('Unable to fetch token prices. Please try again later.');
    }
  }

  async getTokens(): Promise<Token[]> {
    const now = Date.now();

    if (this.cachedTokens && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.cachedTokens;
    }

    try {
      const priceData = await this.fetchTokenPrices();
      const latestPrices = this.getLatestPrices(priceData);

      this.cachedTokens = Object.entries(latestPrices).map(([symbol, price]) => ({
        symbol,
        name: tokenNameMap[symbol] || symbol,
        price,
        iconUrl: `${TOKEN_ICONS_BASE_URL}/${symbol}.svg`
      }));

      this.lastFetchTime = now;
      return this.cachedTokens;
    } catch (error) {
      if (this.cachedTokens) {
        console.warn('Using cached token data due to fetch error');
        return this.cachedTokens;
      }
      throw error;
    }
  }

  private getLatestPrices(priceData: TokenPrice[]): Record<string, number> {
    const priceMap: Record<string, { price: number; date: string }> = {};

    priceData.forEach((item) => {
      const existing = priceMap[item.currency];
      if (!existing || new Date(item.date) > new Date(existing.date)) {
        priceMap[item.currency] = { price: item.price, date: item.date };
      }
    });

    return Object.fromEntries(
      Object.entries(priceMap).map(([currency, data]) => [currency, data.price])
    );
  }

  calculateSwap(fromToken: Token, toToken: Token, fromAmount: number): number {
    if (fromAmount <= 0 || !fromToken.price || !toToken.price) {
      return 0;
    }

    const usdValue = fromAmount * fromToken.price;
    return usdValue / toToken.price;
  }

  getExchangeRate(fromToken: Token, toToken: Token): number {
    if (!fromToken.price || !toToken.price) {
      return 0;
    }
    return fromToken.price / toToken.price;
  }
}

export const tokenService = new TokenService();