import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, matchesTable, teamsTable } from "@workspace/db";
import {
  CreateMatchBody,
  CreateMatchResponse,
  DeleteMatchParams,
  ListMatchesResponse,
  UpdateMatchBody,
  UpdateMatchParams,
  UpdateMatchResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";

const router: IRouter = Router();

async function teamExists(id: number): Promise<boolean> {
  const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, id));
  return team !== undefined;
}

async function toMatchResponse(match: typeof matchesTable.$inferSelect) {
  const teams = await db.select().from(teamsTable);
  const teamById = new Map(teams.map((team) => [team.id, team]));

  return {
    id: match.id,
    homeTeamId: match.homeTeamId,
    homeTeamName: teamById.get(match.homeTeamId)?.name ?? "Squadra sconosciuta",
    awayTeamId: match.awayTeamId,
    awayTeamName: teamById.get(match.awayTeamId)?.name ?? "Squadra sconosciuta",
    homeGoals: match.homeGoals,
    awayGoals: match.awayGoals,
    playedAt: match.playedAt,
  };
}

router.get("/matches", async (_req, res): Promise<void> => {
  const matches = await db.select().from(matchesTable).orderBy(matchesTable.playedAt);
  const teams = await db.select().from(teamsTable);
  const teamById = new Map(teams.map((team) => [team.id, team]));

  const response = matches
    .map((match) => ({
      id: match.id,
      homeTeamId: match.homeTeamId,
      homeTeamName: teamById.get(match.homeTeamId)?.name ?? "Squadra sconosciuta",
      awayTeamId: match.awayTeamId,
      awayTeamName: teamById.get(match.awayTeamId)?.name ?? "Squadra sconosciuta",
      homeGoals: match.homeGoals,
      awayGoals: match.awayGoals,
      playedAt: match.playedAt,
    }))
    .reverse();

  res.json(ListMatchesResponse.parse(response));
});

router.post("/matches", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateMatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.homeTeamId === parsed.data.awayTeamId) {
    res.status(400).json({ error: "La squadra di casa e ospite devono essere diverse." });
    return;
  }

  const [homeExists, awayExists] = await Promise.all([
    teamExists(parsed.data.homeTeamId),
    teamExists(parsed.data.awayTeamId),
  ]);
  if (!homeExists || !awayExists) {
    res.status(400).json({ error: "Una delle squadre selezionate non esiste." });
    return;
  }

  const [match] = await db.insert(matchesTable).values(parsed.data).returning();
  res.status(201).json(CreateMatchResponse.parse(await toMatchResponse(match)));
});

router.patch("/matches/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateMatchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateMatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(matchesTable).where(eq(matchesTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  const nextHomeTeamId = parsed.data.homeTeamId ?? existing.homeTeamId;
  const nextAwayTeamId = parsed.data.awayTeamId ?? existing.awayTeamId;

  if (nextHomeTeamId === nextAwayTeamId) {
    res.status(400).json({ error: "La squadra di casa e ospite devono essere diverse." });
    return;
  }

  if (parsed.data.homeTeamId !== undefined || parsed.data.awayTeamId !== undefined) {
    const [homeExists, awayExists] = await Promise.all([
      teamExists(nextHomeTeamId),
      teamExists(nextAwayTeamId),
    ]);
    if (!homeExists || !awayExists) {
      res.status(400).json({ error: "Una delle squadre selezionate non esiste." });
      return;
    }
  }

  const [match] = await db
    .update(matchesTable)
    .set(parsed.data)
    .where(eq(matchesTable.id, params.data.id))
    .returning();

  res.json(UpdateMatchResponse.parse(await toMatchResponse(match)));
});

router.delete("/matches/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteMatchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [match] = await db.delete(matchesTable).where(eq(matchesTable.id, params.data.id)).returning();

  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
