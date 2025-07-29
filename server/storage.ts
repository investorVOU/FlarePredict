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

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Add mock users
    const mockUsers = [
      {
        id: "user1",
        telegramId: "123456789",
        username: "crypto_trader_01",
        walletAddress: "0x742d35Cc6635C0532925a3b8D84A1A5d8e8F6c2d",
        referralCode: "ref_123456789",
        referredBy: null,
        totalBets: 12,
        totalWon: 1580,
        winStreak: 3,
        lastActive: new Date(),
        isActive: true,
      },
      {
        id: "user2",
        telegramId: "987654321",
        username: "prediction_master",
        walletAddress: "0x8Ba1f109551bD432803012645Hac136c9c1e4B2f",
        referralCode: "ref_987654321",
        referredBy: "ref_123456789",
        totalBets: 8,
        totalWon: 890,
        winStreak: 1,
        lastActive: new Date(),
        isActive: true,
      },
      {
        id: "user3",
        telegramId: "456789123",
        username: "oracle_whisperer",
        walletAddress: "0x1f234567890123456789012345678901234567Ab",
        referralCode: "ref_456789123",
        referredBy: null,
        totalBets: 25,
        totalWon: 3420,
        winStreak: 7,
        lastActive: new Date(),
        isActive: true,
      }
    ];

    mockUsers.forEach(user => this.users.set(user.id, user));

    // Add mock markets
    const mockMarkets = [
      {
        id: "market_btc_70k_2025",
        title: "BTC > $70,000 by End of January 2025",
        description: "Will Bitcoin price exceed $70,000 USD by January 31, 2025?",
        chainId: "flare",
        expiryDate: new Date("2025-01-31T23:59:59.000Z"),
        isActive: true,
        isResolved: false,
        resolution: null,
        yesPool: 15420,
        noPool: 8960,
        oracleData: null,
        createdAt: new Date(),
      },
      {
        id: "market_eth_3500_today",
        title: "ETH > $3,500 Today",
        description: "Will Ethereum price exceed $3,500 USD by end of today?",
        chainId: "ethereum",
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true,
        isResolved: false,
        resolution: null,
        yesPool: 8750,
        noPool: 12340,
        oracleData: null,
        createdAt: new Date(),
      },
      {
        id: "market_polygon_matic_2_feb",
        title: "MATIC > $2.00 by February",
        description: "Will Polygon MATIC token exceed $2.00 USD by February 1, 2025?",
        chainId: "polygon",
        expiryDate: new Date("2025-02-01T23:59:59.000Z"),
        isActive: true,
        isResolved: false,
        resolution: null,
        yesPool: 5690,
        noPool: 4210,
        oracleData: null,
        createdAt: new Date(),
      }
    ];

    mockMarkets.forEach(market => this.markets.set(market.id, market));

    // Add mock bets
    const mockBets = [
      {
        id: "bet1",
        userId: "user1",
        marketId: "market_btc_70k_2025",
        chainId: "flare",
        amount: 100,
        prediction: true,
        txHash: "0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
        isPaid: false,
        payout: 0,
        createdAt: new Date(),
      },
      {
        id: "bet2",
        userId: "user2",
        marketId: "market_eth_3500_today",
        chainId: "ethereum",
        amount: 75,
        prediction: false,
        txHash: "0xf1e2d3c4b5a6789012345678901234567890fedcba1234567890fedcba123456",
        isPaid: false,
        payout: 0,
        createdAt: new Date(),
      }
    ];

    mockBets.forEach(bet => this.bets.set(bet.id, bet));
  }

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
      walletAddress: insertUser.walletAddress || null,
      referralCode: insertUser.referralCode || null,
      referredBy: insertUser.referredBy || null,
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
      txHash: insertBet.txHash || null,
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
      bonusAmount: insertReferral.bonusAmount || 0,
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