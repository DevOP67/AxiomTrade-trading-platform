import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const strategies = pgTable("strategies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true),
  parameters: jsonb("parameters").$type<Record<string, any>>().default({}),
});

export const signals = pgTable("signals", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(), // 'BUY', 'SELL', 'HOLD'
  strategyId: integer("strategy_id").notNull(),
  price: text("price").notNull(),
  aiScore: integer("ai_score").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  balance: text("balance").notNull(),
});

export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull(),
  symbol: text("symbol").notNull(),
  amount: text("amount").notNull(),
  entryPrice: text("entry_price").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertStrategySchema = createInsertSchema(strategies).omit({ id: true });
export const insertSignalSchema = createInsertSchema(signals).omit({ id: true, timestamp: true });
export const insertPortfolioSchema = createInsertSchema(portfolios).omit({ id: true });
export const insertPositionSchema = createInsertSchema(positions).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Strategy = typeof strategies.$inferSelect;
export type InsertStrategy = z.infer<typeof insertStrategySchema>;

export type Signal = typeof signals.$inferSelect;
export type InsertSignal = z.infer<typeof insertSignalSchema>;

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;

export type Position = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;
