import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  walletBalance: real("wallet_balance").notNull().default(500),
  totalWinnings: real("total_winnings").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  walletBalance: true,
  totalWinnings: true,
  createdAt: true,
});

// Team model
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  matchId: integer("match_id").notNull(),
  totalPoints: real("total_points").default(0).notNull(),
  captainId: integer("captain_id").notNull(),
  viceCaptainId: integer("vice_captain_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  totalPoints: true,
  createdAt: true,
});

// Team Players (joins teams and players)
export const teamPlayers = pgTable("team_players", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull(),
  playerId: integer("player_id").notNull(),
});

export const insertTeamPlayerSchema = createInsertSchema(teamPlayers).omit({
  id: true,
});

// Player model
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  teamCode: text("team_code").notNull(),
  role: text("role").notNull(), // WK, BAT, AR, BOWL
  credits: real("credits").notNull(),
  points: real("points").default(0).notNull(),
  selectionPercentage: real("selection_percentage").default(0).notNull(),
  lastMatchPoints: real("last_match_points").default(0).notNull(),
  imageUrl: text("image_url"),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
});

// Match model
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  team1: text("team1").notNull(),
  team2: text("team2").notNull(),
  team1Code: text("team1_code").notNull(),
  team2Code: text("team2_code").notNull(),
  team1Logo: text("team1_logo"),
  team2Logo: text("team2_logo"),
  matchType: text("match_type").notNull(), // IPL, T20, etc.
  startTime: timestamp("start_time").notNull(),
  isLive: boolean("is_live").default(false).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  tagText: text("tag_text"), // "MEGA", "HOT", etc.
  tagColor: text("tag_color"),
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  isLive: true,
  isCompleted: true,
});

// Contest model
export const contests = pgTable("contests", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  name: text("name").notNull(),
  entryFee: real("entry_fee").notNull(),
  totalSpots: integer("total_spots").notNull(),
  filledSpots: integer("filled_spots").default(0).notNull(),
  prizePool: real("prize_pool").notNull(),
  firstPrize: real("first_prize").notNull(),
  isGuaranteed: boolean("is_guaranteed").default(true).notNull(),
  contestType: text("contest_type").notNull(), // MEGA, SMALL, etc.
  headerColor: text("header_color").default("#d13239").notNull(),
});

export const insertContestSchema = createInsertSchema(contests).omit({
  id: true,
  filledSpots: true,
});

// Contest Entries model (users joining contests with teams)
export const contestEntries = pgTable("contest_entries", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull(),
  userId: integer("user_id").notNull(),
  teamId: integer("team_id").notNull(),
  rank: integer("rank"),
  points: real("points").default(0).notNull(),
  prizeWon: real("prize_won").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContestEntrySchema = createInsertSchema(contestEntries).omit({
  id: true,
  rank: true,
  points: true,
  prizeWon: true,
  createdAt: true,
});

// Winners model for displaying recent winners
export const winners = pgTable("winners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contestId: integer("contest_id").notNull(),
  matchId: integer("match_id").notNull(),
  amount: real("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWinnerSchema = createInsertSchema(winners).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

export type InsertTeamPlayer = z.infer<typeof insertTeamPlayerSchema>;
export type TeamPlayer = typeof teamPlayers.$inferSelect;

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

export type InsertContest = z.infer<typeof insertContestSchema>;
export type Contest = typeof contests.$inferSelect;

export type InsertContestEntry = z.infer<typeof insertContestEntrySchema>;
export type ContestEntry = typeof contestEntries.$inferSelect;

export type InsertWinner = z.infer<typeof insertWinnerSchema>;
export type Winner = typeof winners.$inferSelect;
