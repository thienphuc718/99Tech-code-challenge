# React Wallet Component Issues

## Main Problems Found

**Critical Bug**: `lhsPriority` is undefined on line 57 - this will crash the app. Should be `balancePriority`.

**Filter Logic**: The balance filter is backwards. Currently shows balances with amount <= 0 instead of filtering them out.

**Sort Function**: Missing return value when priorities are equal, causing unstable sorts.

**Performance Issues**:

- `prices` dependency in useMemo but not used in the calculation
- Missing memoization for `formattedBalances` and `rows`
- Using array index as React key instead of stable identifer

**Type Problems**:

- Missing `blockchain` property in WalletBalance interface
- `blockchain: any` should be properly typed
- Type mismatch between `FormattedWalletBalance` and `WalletBalance` in rows mapping
- Missing declarations for `BoxProps`, `useWalletBalances`, `usePrices`, `WalletRow`, and `classes`

## Quick Fixes Applied

- Fixed undefined variable bug
- Corrected filter logic to show positive balance only
- Added missing return value in sort
- Removed unused `prices` from dependencies
- Added memoization where needed
- Used `balance.currency` as stable key
- Added missing interface properties
- Improved type safety with correct blockchain types
- Fixed type inconsistency in rows mapping to use correct data flow
- Added all missing declarations (hooks, components, interfaces)
