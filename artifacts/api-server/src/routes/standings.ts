import { Router, type IRouter } from "express";
import { db, matchesTable } from "@workspace/db";
import { GetStandingsResponse, GetSummaryResponse } from "@workspace/api-zod";
import { computeParticipants } from "../lib/gameData";

const router: IRouter = Router();

router.get("/standings", async (_req, res): Promise<void> => {
  const participants = await computeParticipants();

  const standings = participants
    .slice()
    .sort((a, b) => b.totalScore - a.totalScore || a.name.localeCompare(b.name))
    .map((participant, index) => ({
      position: index + 1,
      participantId: participant.id,
      name: participant.name,
      totalScore: participant.totalScore,
    }));

  res.json(GetStandingsResponse.parse(standings));
});

router.get("/summary", async (_req, res): Promise<void> => {
  const [participants, matches] = await Promise.all([
    computeParticipants(),
    db.select().from(matchesTable),
  ]);

  const leader = participants
    .slice()
    .sort((a, b) => b.totalScore - a.totalScore || a.name.localeCompare(b.name))[0];

  const lastPlayedAt = matches.reduce<Date | null>((latest, match) => {
    const playedAt = new Date(match.playedAt);
    return !latest || playedAt > latest ? playedAt : latest;
  }, null);

  res.json(
    GetSummaryResponse.parse({
      appName: "Championsito ST 26",
      participantsCount: participants.length,
      matchesPlayed: matches.length,
      leaderName: leader?.name ?? null,
      leaderScore: leader?.totalScore ?? null,
      updatedAt: lastPlayedAt ? lastPlayedAt.toISOString() : null,
    }),
  );
});

export default router;
