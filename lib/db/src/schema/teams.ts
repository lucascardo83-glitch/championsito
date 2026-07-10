import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// A team qualified for the Champions League. `potNumber` is the "fascia"
// (1-4) the team belongs to, which drives the points awarded to anyone
// who picked it. Admins can freely re-assign teams to a different pot.
export const teamsTable = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  potNumber: integer("pot_number").notNull(),
});

export const insertTeamSchema = createInsertSchema(teamsTable).omit({
  id: true,
});
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teamsTable.$inferSelect;
