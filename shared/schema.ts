import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  telegramId: varchar("telegram_id").notNull().unique(),
  username: text("username").notNull(),
  walletAddress: text("wallet_address"),
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by"),
  totalBets: integer("total_bets").default(0),
  totalWon: integer("total_won").default(0),
  winStreak: integer("win_streak").default(0),
  lastActive: timestamp("last_active").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const markets = pgTable("markets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  chainId: varchar("chain_id").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  isActive: boolean("is_active").default(true),
  isResolved: boolean("is_resolved").default(false),
  isRemoved: boolean("is_removed").default(false),
  resolution: boolean("resolution"), // null = not resolved, true = YES, false = NO
  oracleData: jsonb("oracle_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bets = pgTable("bets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  marketId: varchar("market_id").notNull(),
  chainId: varchar("chain_id").notNull(),
  amount: integer("amount").notNull(),
  prediction: boolean("prediction").notNull(), // true = YES, false = NO
  txHash: varchar("tx_hash"),
  isPaid: boolean("is_paid").default(false),
  payout: integer("payout").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull(),
  refereeId: varchar("referee_id").notNull(),
  bonusAmount: integer("bonus_amount").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastActive: true,
});

export const insertMarketSchema = createInsertSchema(markets).omit({
  id: true,
  createdAt: true,
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMarket = z.infer<typeof insertMarketSchema>;
export type InsertBet = z.infer<typeof insertBetSchema>;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

export type User = typeof users.$inferSelect;
export type Market = typeof markets.$inferSelect;
export type Bet = typeof bets.$inferSelect;
export type Referral = typeof referrals.$inferSelect;