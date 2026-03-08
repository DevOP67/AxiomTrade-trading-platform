import { strategies, signals, portfolios, positions, type Strategy, type Signal, type Portfolio, type Position, type InsertSignal, type InsertStrategy } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getStrategies(): Promise<Strategy[]>;
  updateStrategy(id: number, updates: Partial<InsertStrategy>): Promise<Strategy | undefined>;
  getSignals(symbol?: string, limit?: number): Promise<Signal[]>;
  createSignal(signal: InsertSignal): Promise<Signal>;
  getPortfolio(): Promise<{ portfolio: Portfolio, positions: Position[] }>;
}

export class DatabaseStorage implements IStorage {
  async getStrategies(): Promise<Strategy[]> {
    return await db.select().from(strategies);
  }

  async updateStrategy(id: number, updates: Partial<InsertStrategy>): Promise<Strategy | undefined> {
    const [updated] = await db.update(strategies)
      .set(updates)
      .where(eq(strategies.id, id))
      .returning();
    return updated;
  }

  async getSignals(symbol?: string, limit?: number): Promise<Signal[]> {
    let query: any = db.select().from(signals).orderBy(desc(signals.timestamp));
    if (symbol) {
      query = query.where(eq(signals.symbol, symbol));
    }
    if (limit) {
      query = query.limit(limit);
    }
    return await query;
  }

  async createSignal(signal: InsertSignal): Promise<Signal> {
    const [created] = await db.insert(signals).values(signal).returning();
    return created;
  }

  async getPortfolio(): Promise<{ portfolio: Portfolio, positions: Position[] }> {
    let [portfolio] = await db.select().from(portfolios).limit(1);
    if (!portfolio) {
      [portfolio] = await db.insert(portfolios).values({ userId: 1, balance: "100000.00" }).returning();
    }
    
    const allPositions = await db.select().from(positions).where(eq(positions.portfolioId, portfolio.id));
    return { portfolio, positions: allPositions };
  }
}

export const storage = new DatabaseStorage();