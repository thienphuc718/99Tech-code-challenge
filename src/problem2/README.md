# Problem 2: Currency Swap App

React + TypeScript currency swap interface using the Switcheo API.

## What it does

- Swap between tokens with live price data
- Search/filter tokens
- Basic validation (no same-token swaps, proper amounts)
- Shows exchange rates and USD values

## Features

- Token price fetching from Switcheo API
- Responsive design with Tailwind
- TypeScript for type safety
- Basic error handling
- Mobile-friendly

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Query for API calls

## Setup

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Scripts

- `npm run dev` - dev server
- `npm run build` - production build
- `npm run test` - run tests
- `npm run lint` - lint check

## Structure

```
src/
├── components/
│   ├── AmountInput.tsx
│   ├── SwapForm.tsx
│   ├── TokenSelector.tsx
│   └── Toast.tsx
├── hooks/
│   └── useToast.ts
├── services/
│   └── tokenService.ts
├── types/
│   └── token.ts
└── utils/
    ├── calculations.ts
    └── __tests__/
```

## API

Uses Switcheo's price API: `https://interview.switcheo.com/prices.json`

Token icons from: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/`

## Notes

- Prices cached for 5min to avoid spam
- Basic input validation
- Fallback initials for missing token icons
- Responsive but prioritized desktop first
- Tests cover the calculation logic
