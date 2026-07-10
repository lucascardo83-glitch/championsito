import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { teamsTable } from "./teams";

// A recorded match result between two qualified teams. Points for
// participants are derived (not stored) from these results plus each
// team's pot, so editing/deleting a match automatically changes standings.
export const matchesTable = pgTable("matches", {
  id: serial("id").primaryKey(),
  homeTeamId: integer("home_team_id")
    .notNull()
    .references(() => teamsTable.id, { onDelete: "cascade" }),
  awayTeamId: integer("away_team_id")
    .notNull()
    .references(() => teamsTable.id, { onDelete: "cascade" }),
  homeGoals: integer("home_goals").notNull(),
  awayGoals: integer("away_goals").notNull(),
  playedAt: timestamp("played_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matchesTable).omit({
  id: true,
  playedAt: true,
});
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matchesTable.$inferSelect;
