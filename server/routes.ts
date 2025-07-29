import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Bot status endpoint
  app.get("/api/bot/status", async (req, res) => {
    res.json({
      status: "active",
      uptime: process.uptime(),
      markets: (await storage.getActiveMarkets()).length,
      users: Array.from((storage as any).users.values()).length,
    });
  });

  // Get active markets
  app.get("/api/markets", async (req, res) => {
    const markets = await storage.getActiveMarkets();
    res.json(markets);
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    const leaderboard = await storage.getLeaderboard(10);
    res.json(leaderboard);
  });

  // Get user stats
  app.get("/api/users/:telegramId", async (req, res) => {
    const user = await storage.getUserByTelegramId(req.params.telegramId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const bets = await storage.getBetsByUser(user.id);
    res.json({ user, bets });
  });

  const httpServer = createServer(app);
  return httpServer;
}
