import { Router, type IRouter } from "express";
import { db, matchesTable, teamsTable } from "@workspace/db";
import { ExportBackupResponse } from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";
import { computeParticipants } from "../lib/gameData";

const router: IRouter = Router();

router.get("/backup/export", requireAdmin, async (_req, res): Promise<void> => {
  const [teams, matches, participants] = await Promise.all([
    db.select().from(teamsTable),
    db.select().from(matchesTable),
    computeParticipants(),
  ]);

  const teamById = new Map(teams.map((team) => [team.id, team]));

  const matchesResponse = matches.map((match) => ({
    id: match.id,
    homeTeamId: match.homeTeamId,
    homeTeamName: teamById.get(match.homeTeamId)?.name ?? "Squadra sconosciuta",
    awayTeamId: match.awayTeamId,
    awayTeamName: teamById.get(match.awayTeamId)?.name ?? "Squadra sconosciuta",
    homeGoals: match.homeGoals,
    awayGoals: match.awayGoals,
    playedAt: match.playedAt,
  }));

  res.json(
    ExportBackupResponse.parse({
      exportedAt: new Date().toISOString(),
      teams,
      participants,
      matches: matchesResponse,
    }),
  );
});

export default router;
