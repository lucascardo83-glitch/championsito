import { integer, pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { teamsTable } from "./teams";

// A player/participant in the game.
export const participantsTable = pgTable("participants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertParticipantSchema = createInsertSchema(participantsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participantsTable.$inferSelect;

// Join table: which 8 teams a participant picked. Exactly 2 per pot,
// enforced at the application layer since it spans 4 pots.
export const participantTeamsTable = pgTable(
  "participant_teams",
  {
    id: serial("id").primaryKey(),
    participantId: integer("participant_id")
      .notNull()
      .references(() => participantsTable.id, { onDelete: "cascade" }),
    teamId: integer("team_id")
      .notNull()
      .references(() => teamsTable.id, { onDelete: "cascade" }),
  },
  (table) => [unique().on(table.participantId, table.teamId)],
);

export const insertParticipantTeamSchema = createInsertSchema(participantTeamsTable).omit({
  id: true,
});
export type InsertParticipantTeam = z.infer<typeof insertParticipantTeamSchema>;
export type ParticipantTeam = typeof participantTeamsTable.$inferSelect;
