import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { telegramBot } from "./telegram-bot";

export async function registerRoutes(app: Express): Promise<Server> {
  // Bot status endpoint
  app.get("/api/bot/status", async (req, res) => {
    const activeMarkets = await storage.getActiveMarkets();
    const users = Array.from((storage as any).users.values());
    const botStatus = telegramBot.getStatus();
    
    res.json({
      status: botStatus.isRunning ? "active" : "inactive",
      uptime: process.uptime(),
      markets: activeMarkets.length,
      users: users.length,
      mode: botStatus.mode,
      telegram: {
        connected: botStatus.isRunning,
        mode: botStatus.mode,
      }
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
