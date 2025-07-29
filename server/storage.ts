import { type User, type InsertUser, type Market, type InsertMarket, type Bet, type InsertBet, type Referral, type InsertReferral } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Markets
  getMarket(id: string): Promise<Market | undefined>;
  getActiveMarkets(): Promise<Market[]>;
  getMarketsByChain(chainId: string): Promise<Market[]>;
  createMarket(market: InsertMarket): Promise<Market>;
  updateMarket(id: string, updates: Partial<Market>): Promise<Market | undefined>;
  
  // Bets
  getBet(id: string): Promise<Bet | undefined>;
  getBetsByUser(userId: string): Promise<Bet[]>;
  getBetsByMarket(marketId: string): Promise<Bet[]>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBet(id: string, updates: Partial<Bet>): Promise<Bet | undefined>;
  
  // Referrals
  getReferralsByUser(userId: string): Promise<Referral[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  
  // Leaderboard
  getLeaderboard(limit?: number): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private markets: Map<string, Market> = new Map();
  private bets: Map<string, Bet> = new Map();
  private referrals: Map<string, Referral> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.telegramId === telegramId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      totalBets: 0,
      totalWon: 0,
      winStreak: 0,
      lastActive: new Date(),
      isActive: true,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getMarket(id: string): Promise<Market | undefined> {
    return this.markets.get(id);
  }

  async getActiveMarkets(): Promise<Market[]> {
    return Array.from(this.markets.values()).filter(market => market.isActive && !market.isResolved);
  }

  async getMarketsByChain(chainId: string): Promise<Market[]> {
    return Array.from(this.markets.values()).filter(market => market.chainId === chainId);
  }

  async createMarket(insertMarket: InsertMarket): Promise<Market> {
    const id = randomUUID();
    const market: Market = {
      ...insertMarket,
      id,
      isActive: true,
      isResolved: false,
      resolution: null,
      yesPool: 0,
      noPool: 0,
      oracleData: null,
      createdAt: new Date(),
    };
    this.markets.set(id, market);
    return market;
  }

  async updateMarket(id: string, updates: Partial<Market>): Promise<Market | undefined> {
    const market = this.markets.get(id);
    if (!market) return undefined;
    
    const updatedMarket = { ...market, ...updates };
    this.markets.set(id, updatedMarket);
    return updatedMarket;
  }

  async getBet(id: string): Promise<Bet | undefined> {
    return this.bets.get(id);
  }

  async getBetsByUser(userId: string): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(bet => bet.userId === userId);
  }

  async getBetsByMarket(marketId: string): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(bet => bet.marketId === marketId);
  }

  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = randomUUID();
    const bet: Bet = {
      ...insertBet,
      id,
      isPaid: false,
      payout: 0,
      createdAt: new Date(),
    };
    this.bets.set(id, bet);
    return bet;
  }

  async updateBet(id: string, updates: Partial<Bet>): Promise<Bet | undefined> {
    const bet = this.bets.get(id);
    if (!bet) return undefined;
    
    const updatedBet = { ...bet, ...updates };
    this.bets.set(id, updatedBet);
    return updatedBet;
  }

  async getReferralsByUser(userId: string): Promise<Referral[]> {
    return Array.from(this.referrals.values()).filter(referral => referral.referrerId === userId);
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const id = randomUUID();
    const referral: Referral = {
      ...insertReferral,
      id,
      createdAt: new Date(),
    };
    this.referrals.set(id, referral);
    return referral;
  }

  async getLeaderboard(limit: number = 10): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => (b.totalWon || 0) - (a.totalWon || 0))
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
