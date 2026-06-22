# Investment Planner

A web app for planning investments and estimating taxes, built with [Next.js](https://nextjs.org). It offers a Dollar-Cost Averaging (DCA) projection tool and a Thailand personal income tax calculator, with bilingual (English / Thai), multi-currency, and dark/light theme support.

## Features

- **DCA Calculator** (`/dca`) — Project the growth of a recurring investment over time. Models an initial principal, fixed monthly contributions, expected annual return, an active investing period, and an optional "coast" period (Coast FIRE) where contributions stop but the balance keeps compounding. Visualizes balance vs. principal with [Recharts](https://recharts.org) and estimates passive income.
- **Tax Calculator** (`/tax`) — Estimate Thailand personal income tax for tax year 2569 (2026). Supports multiple income items, the full set of personal/family allowances, savings & insurance deductions (social security, life/health/pension insurance, home-loan interest), retirement funds (RMF, Thai ESG), and donations, then computes tax across the progressive brackets with an effective-rate breakdown.
- **Live stock lookup** — API routes (`/api/stock-search`, `/api/stock-price`) proxy Yahoo Finance to search equities/ETFs and fetch current prices.
- **Internationalization** — Toggle between English and Thai.
- **Multi-currency** — Switch between THB and USD.
- **Theming** — Dark and light modes, persisted across sessions.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev)
- [Material UI 9](https://mui.com) with [Emotion](https://emotion.sh)
- [Recharts](https://recharts.org) for data visualization
- [Tailwind CSS 4](https://tailwindcss.com)
- TypeScript
- [Jest](https://jestjs.io) + [React Testing Library](https://testing-library.com) for tests

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format files with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm run test` | Run the Jest test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with a coverage report |

## Project Structure

```
src/
  app/              # Next.js App Router pages & API routes
    api/            # stock-search, stock-price (Yahoo Finance proxy)
    dca/            # DCA calculator page
    tax/            # Tax calculator page
  components/       # Shared UI (e.g. Navbar)
  context/          # Theme, Language, and Currency providers
  lib/              # Core logic (dca, tax, theme, persistentStore)
  modules/          # Feature-specific components (dca, tax)
  locales/          # Translation strings
```

## Testing

Tests live in `src/__tests__/` and cover the calculation logic, context providers, components, pages, and API routes.

```bash
npm run test
```
