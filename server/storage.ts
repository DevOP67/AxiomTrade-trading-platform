import {
  strategies,
  signals,
  portfolios,
  positions,
  users,
  type Strategy,
  type Signal,
  type Portfolio,
  type Position,
  type InsertSignal,
  type InsertStrategy,
  type User,
  type InsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  // Strategies
  getStrategies(): Promise<Strategy[]>;
  getStrategy(id: number): Promise<Strategy | undefined>;
  createStrategy(strategy: InsertStrategy): Promise<Strategy>;
  updateStrategy(id: number, updates: Partial<InsertStrategy>): Promise<Strategy | undefined>;
  deleteStrategy(id: number): Promise<void>;
  // Signals
  getSignals(symbol?: string, limit?: number): Promise<Signal[]>;
  createSignal(signal: InsertSignal): Promise<Signal>;
  // Portfolio
  getPortfolio(): Promise<{ portfolio: Portfolio; positions: Position[] }>;
}

export class DatabaseStorage implements IStorage {
  async getUserById(id: string): Promise<User | undefined> {
    const [u] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return u;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [u] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return u;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getStrategies(): Promise<Strategy[]> {
    return await db.select().from(strategies);
  }

  async getStrategy(id: number): Promise<Strategy | undefined> {
    const [s] = await db.select().from(strategies).where(eq(strategies.id, id)).limit(1);
    return s;
  }

  async createStrategy(strategy: InsertStrategy): Promise<Strategy> {
    const [created] = await db.insert(strategies).values(strategy).returning();
    return created;
  }

  async updateStrategy(id: number, updates: Partial<InsertStrategy>): Promise<Strategy | undefined> {
    const [updated] = await db
      .update(strategies)
      .set(updates)
      .where(eq(strategies.id, id))
      .returning();
    return updated;
  }

  async deleteStrategy(id: number): Promise<void> {
    await db.delete(strategies).where(eq(strategies.id, id));
  }

  async getSignals(symbol?: string, limit?: number): Promise<Signal[]> {
    let query = db.select().from(signals).orderBy(desc(signals.timestamp)) as any;
    if (symbol) query = query.where(eq(signals.symbol, symbol));
    if (limit) query = query.limit(limit);
    return await query;
  }

  async createSignal(signal: InsertSignal): Promise<Signal> {
    const [created] = await db.insert(signals).values(signal).returning();
    return created;
  }

  async getPortfolio(): Promise<{ portfolio: Portfolio; positions: Position[] }> {
    let [portfolio] = await db.select().from(portfolios).limit(1);
    if (!portfolio) {
      [portfolio] = await db
        .insert(portfolios)
        .values({ userId: 1, balance: "100000.00" })
        .returning();
    }
    const allPositions = await db
      .select()
      .from(positions)
      .where(eq(positions.portfolioId, portfolio.id));
    return { portfolio, positions: allPositions };
  }
}

export const storage = new DatabaseStorage();
