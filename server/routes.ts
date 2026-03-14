import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import { strategies, signals, positions, insertStrategySchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // ── Strategies ──────────────────────────────────────────────────────────────
  app.get(api.strategies.list.path, async (req, res) => {
    const results = await storage.getStrategies();
    res.json(results);
  });

  app.post("/api/strategies", async (req, res) => {
    try {
      const input = insertStrategySchema.parse(req.body);
      const strategy = await storage.createStrategy(input);
      res.status(201).json(strategy);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.strategies.update.path, async (req, res) => {
    try {
      const input = api.strategies.update.input.parse(req.body);
      const updated = await storage.updateStrategy(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: "Strategy not found" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/strategies/:id", async (req, res) => {
    try {
      await storage.deleteStrategy(Number(req.params.id));
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Signals ─────────────────────────────────────────────────────────────────
  app.get(api.signals.list.path, async (req, res) => {
    try {
      const input = api.signals.list.input?.parse(req.query) || {};
      const results = await storage.getSignals(input.symbol, input.limit);
      res.json(results);
    } catch {
      res.status(400).json({ message: "Invalid query" });
    }
  });

  app.post(api.signals.create.path, async (req, res) => {
    try {
      const input = api.signals.create.input.parse(req.body);
      const signal = await storage.createSignal(input);
      res.status(201).json(signal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Portfolio ────────────────────────────────────────────────────────────────
  app.get(api.portfolio.get.path, async (req, res) => {
    const result = await storage.getPortfolio();
    res.json(result);
  });

  // ── Health Check ────────────────────────────────────────────────────────────
  app.get("/api/health", async (req, res) => {
    try {
      await db.select().from(strategies).limit(1);
      res.json({ status: "ok", db: "connected", timestamp: new Date().toISOString() });
    } catch {
      res.status(500).json({ status: "error", db: "disconnected" });
    }
  });

  // ── Seed on first start ─────────────────────────────────────────────────────
  setTimeout(async () => {
    try {
      const existing = await storage.getStrategies();
      if (existing.length === 0) {
        const strats = await db
          .insert(strategies)
          .values([
            {
              name: "Moving Average Crossover",
              description: "Generates buy/sell signals based on fast/slow moving averages.",
              isActive: true,
              parameters: { timeframe: "1H", fast_ma: 10, slow_ma: 50 },
            },
            {
              name: "RSI Strategy",
              description: "Mean reversion using Relative Strength Index.",
              isActive: true,
              parameters: { timeframe: "1H", rsi_period: 14, overbought: 70, oversold: 30 },
            },
            {
              name: "MACD Trend",
              description: "Trend following using MACD histogram divergence.",
              isActive: false,
              parameters: { timeframe: "4H", fast: 12, slow: 26, signal: 9 },
            },
          ])
          .returning();

        await db.insert(signals).values([
          { symbol: "BTCUSDT", type: "BUY",  strategyId: strats[0].id, price: "64200.50", aiScore: 85 },
          { symbol: "ETHUSDT", type: "SELL", strategyId: strats[1].id, price: "3450.25",  aiScore: 92 },
          { symbol: "SOLUSDT", type: "HOLD", strategyId: strats[2].id, price: "145.80",   aiScore: 50 },
          { symbol: "BTCUSDT", type: "BUY",  strategyId: strats[0].id, price: "64500.00", aiScore: 88 },
        ]);

        const portfolioData = await storage.getPortfolio();
        await db.insert(positions).values([
          { portfolioId: portfolioData.portfolio.id, symbol: "BTCUSDT", amount: "1.5",   entryPrice: "60000.00" },
          { portfolioId: portfolioData.portfolio.id, symbol: "ETHUSDT", amount: "15.0",  entryPrice: "3000.00" },
          { portfolioId: portfolioData.portfolio.id, symbol: "SOLUSDT", amount: "100.0", entryPrice: "100.00" },
        ]);
        console.log("Seed data inserted.");
      }
    } catch (err) {
      console.error("Seed error:", err);
    }
  }, 2000);

  return httpServer;
}
