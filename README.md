# QuantForge — AI Trading Signal Platform

A professional-grade, dark-mode fintech dashboard for AI-powered trading signals, strategy management, real-time market data, and portfolio analytics. Built with a modern React + Express stack.

---

## Features

### Core Pages
- **Dashboard** — Live BTC/USDT chart with AI model overlay, open positions table, recent signals feed, and strategy toggle controls
- **Signals** — Real-time BUY/SELL/HOLD signals with AI confidence scoring, confidence breakdown bars (Technical / Sentiment / Macro), expandable "Why this signal?" intelligence panel, and one-click order execution
- **Strategy Builder** — Create strategies from templates (MA Crossover, RSI, MACD, Bollinger Bands, Volume Surge), edit parameters, run simulated backtests, and toggle strategies on/off
- **Market Explorer** — 15+ live cryptocurrency pairs fetched from the Binance public API, auto-refreshing every 10 seconds; sort by volume or 24h change, add pairs to a persistent watchlist, set price alerts, and download CSV exports
- **Portfolio Analytics** — Donut allocation chart, bar charts for asset distribution and monthly performance, open positions table with one-click simulated position closing
- **Settings** — Dark / Light / Auto theme switching, risk parameters, notification toggles, and API key management

### Platform Capabilities
- **Session-based authentication** — HMAC-hashed passwords, PostgreSQL session store
- **Live Binance market data** — Server-side proxy to the public Binance REST API with auto-refresh via TanStack Query
- **Decision Intelligence** — RSI/MACD-derived confidence scores, factor explanations, and bullish/bearish/sideways scenario analysis per signal
- **Mobile responsive** — Drawer sidebar on mobile with hamburger toggle, static sidebar on desktop
- **Theme switching** — Full light and dark mode with CSS custom properties; preference persisted to localStorage
- **CSV export** — Every widget exports real data (positions, allocation, performance, signals, pairs) as a downloadable CSV file
- **Functional widget menus** — All three-dot menus perform real actions: refresh data, export CSV, sort, watchlist toggle, trade confirmation, position closing

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Routing | Wouter |
| Data fetching | TanStack Query v5 |
| Backend | Express.js |
| Database | PostgreSQL + Drizzle ORM |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| Market data | Binance REST API (public) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Setup

1. Clone the repository:
```bash
git clone https://github.com/DevOP67/AxiomTrade-trading-platform.git
cd AxiomTrade-trading-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set environment variables:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/quantforge
SESSION_SECRET=your-secret-key
```

4. Push the database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The app runs on `http://localhost:5000`

---

## Project Structure

```
├── client/                    # React frontend
│   └── src/
│       ├── components/        # Reusable UI: Widget, MarketChart, Sidebar, Switch
│       ├── context/           # AuthContext (session-based auth)
│       ├── hooks/             # TanStack Query hooks for each resource
│       ├── lib/               # CSV download utility
│       └── pages/             # Dashboard, Markets, Signals, Strategies, Portfolio, Settings
├── server/                    # Express backend
│   ├── auth.ts                # Register / Login / Logout / Session
│   ├── routes.ts              # REST API + Binance market proxy
│   ├── signal-intelligence.ts # AI confidence scoring & explanation engine
│   └── storage.ts             # Drizzle ORM database access layer
└── shared/                    # Shared types across client and server
    └── schema.ts              # Drizzle schema (users, strategies, signals, portfolios, positions)
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/strategies` | List all strategies |
| POST | `/api/strategies` | Create strategy |
| PUT | `/api/strategies/:id` | Update strategy |
| DELETE | `/api/strategies/:id` | Delete strategy |
| GET | `/api/signals` | Get signals feed (enriched with AI analysis) |
| POST | `/api/signals` | Create signal |
| GET | `/api/portfolio` | Get portfolio + positions |
| GET | `/api/market/tickers` | Live market tickers (Binance proxy) |
| GET | `/api/health` | System health check |

---

## License

MIT
