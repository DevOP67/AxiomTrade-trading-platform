# QuantForge — AI Trading Signal Platform

A professional-grade, dark-mode fintech dashboard for AI-powered trading signals, strategy management, and portfolio analytics.

---

## Features

- **Authentication** — Secure login and signup with session-based auth
- **Live Signal Feed** — Real-time BUY/SELL/HOLD signals with AI confidence scoring
- **Strategy Builder** — Create, edit, backtest, and delete AI trading strategies
- **Market Explorer** — 15+ cryptocurrency trading pairs with live charts
- **Portfolio Analytics** — P&L tracking, asset distribution, and monthly performance charts
- **Settings** — Customizable preferences with persistent storage

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Routing | Wouter |
| State | TanStack Query v5 |
| Backend | Express.js |
| Database | PostgreSQL + Drizzle ORM |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |

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

## Project Structure

```
├── client/               # React frontend
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── context/      # Auth context
│       ├── hooks/        # TanStack Query hooks
│       └── pages/        # Dashboard, Markets, Signals, Strategies, Portfolio, Settings
├── server/               # Express backend
│   ├── auth.ts           # Authentication routes
│   ├── routes.ts         # API routes
│   └── storage.ts        # Database access layer
└── shared/               # Shared types and schemas
    ├── schema.ts          # Drizzle ORM schema
    └── routes.ts          # API route definitions
```

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
| GET | `/api/signals` | Get signals feed |
| POST | `/api/signals` | Create signal |
| GET | `/api/portfolio` | Get portfolio data |
| GET | `/api/health` | System health check |

## License

MIT
