import React, { useMemo } from 'react';

// Original problematic code with issues highlighted

interface WalletBalance {
  currency: string;
  amount: number;
  // ISSUE #8: Missing 'blockchain' property that's used in the code
}

interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // ISSUE #9: Poor type declaration - should be properly typed
  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case 'Osmosis':
        return 100;
      case 'Ethereum':
        return 50;
      case 'Arbitrum':
        return 30;
      case 'Zilliqa':
        return 20;
      case 'Neo':
        return 20;
      default:
        return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // ISSUE #1: 'lhsPriority' is undefined - should be 'balancePriority'
        if (lhsPriority > -99) {
          // ISSUE #2: Logic is inverted - returns true for amount <= 0
          if (balance.amount <= 0) {
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
        // ISSUE #3: Missing return 0 for equal priorities
      });
    // ISSUE #4: 'prices' in dependencies but not used in computation
  }, [balances, prices]);

  // ISSUE #5: Not memoized - will recalculate on every render
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    };
  });

  // ISSUE #5: Not memoized - will recreate JSX on every render
  const rows = sortedBalances.map(
    // ISSUE #6: Type inconsistency - balance should be WalletBalance, not FormattedWalletBalance
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          // ISSUE #7: Using index as key instead of stable identifier
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;