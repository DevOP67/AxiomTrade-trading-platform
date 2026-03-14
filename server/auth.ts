import type { Express, Request, Response } from "express";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    username?: string;
  }
}

function hashPassword(password: string): string {
  return crypto
    .createHmac("sha256", process.env.SESSION_SECRET || "quantforge-secret")
    .update(password)
    .digest("hex");
}

export function setupAuth(app: Express) {
  // Register new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (existing.length > 0) {
        return res.status(409).json({ message: "Username already taken" });
      }

      const hashed = hashPassword(password);
      const [newUser] = await db
        .insert(users)
        .values({ username, password: hashed })
        .returning();

      req.session.userId = newUser.id;
      req.session.username = newUser.username;

      res.status(201).json({ user: { id: newUser.id, username: newUser.username } });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login existing user
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user || user.password !== hashPassword(password)) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      req.session.userId = user.id;
      req.session.username = user.username;

      res.json({ user: { id: user.id, username: user.username } });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user
  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (req.session.userId) {
      res.json({ id: req.session.userId, username: req.session.username });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });
}
