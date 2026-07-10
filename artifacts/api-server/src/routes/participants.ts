import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, participantsTable, participantTeamsTable, teamsTable } from "@workspace/db";
import {
  CreateParticipantBody,
  CreateParticipantResponse,
  DeleteParticipantParams,
  GetParticipantParams,
  GetParticipantResponse,
  ListParticipantsQueryParams,
  ListParticipantsResponse,
  UpdateParticipantBody,
  UpdateParticipantParams,
  UpdateParticipantResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";
import { computeParticipants } from "../lib/gameData";

const router: IRouter = Router();

/**
 * Validates that a set of team ids picks exactly 2 teams from each of the
 * 4 pots. Returns an error message when invalid, or null when valid.
 */
async function validateTeamSelection(teamIds: number[]): Promise<string | null> {
  const uniqueIds = new Set(teamIds);
  if (uniqueIds.size !== 8) {
    return "Devi selezionare esattamente 8 squadre distinte.";
  }

  const teams = await db.select().from(teamsTable);
  const teamById = new Map(teams.map((team) => [team.id, team]));

  const countByPot = new Map<number, number>([[1, 0], [2, 0], [3, 0], [4, 0]]);
  for (const id of uniqueIds) {
    const team = teamById.get(id);
    if (!team) {
      return `La squadra con id ${id} non esiste.`;
    }
    countByPot.set(team.potNumber, (countByPot.get(team.potNumber) ?? 0) + 1);
  }

  for (const pot of [1, 2, 3, 4]) {
    if (countByPot.get(pot) !== 2) {
      return `Devi selezionare esattamente 2 squadre dalla fascia ${pot}.`;
    }
  }

  return null;
}

router.get("/participants", async (req, res): Promise<void> => {
  const query = ListParticipantsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const participants = await computeParticipants();
  const search = query.data.search?.trim().toLowerCase();
  const filtered = search
    ? participants.filter((participant) => participant.name.toLowerCase().includes(search))
    : participants;

  const summaries = filtered
    .map(({ id, name, totalScore }) => ({ id, name, totalScore }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json(ListParticipantsResponse.parse(summaries));
});

router.get("/participants/:id", async (req, res): Promise<void> => {
  const params = GetParticipantParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const participants = await computeParticipants();
  const participant = participants.find((entry) => entry.id === params.data.id);

  if (!participant) {
    res.status(404).json({ error: "Participant not found" });
    return;
  }

  res.json(GetParticipantResponse.parse(participant));
});

router.post("/participants", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateParticipantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const validationError = await validateTeamSelection(parsed.data.teamIds);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const participant = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(participantsTable)
      .values({ name: parsed.data.name })
      .returning();

    await tx.insert(participantTeamsTable).values(
      parsed.data.teamIds.map((teamId) => ({ participantId: created.id, teamId })),
    );

    return created;
  });

  const participants = await computeParticipants();
  const detail = participants.find((entry) => entry.id === participant.id);
  res.status(201).json(CreateParticipantResponse.parse(detail));
});

router.patch("/participants/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateParticipantParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateParticipantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.teamIds) {
    const validationError = await validateTeamSelection(parsed.data.teamIds);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }
  }

  const [existing] = await db
    .select()
    .from(participantsTable)
    .where(eq(participantsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Participant not found" });
    return;
  }

  await db.transaction(async (tx) => {
    if (parsed.data.name !== undefined) {
      await tx
        .update(participantsTable)
        .set({ name: parsed.data.name })
        .where(eq(participantsTable.id, params.data.id));
    }

    if (parsed.data.teamIds) {
      await tx
        .delete(participantTeamsTable)
        .where(eq(participantTeamsTable.participantId, params.data.id));
      await tx.insert(participantTeamsTable).values(
        parsed.data.teamIds.map((teamId) => ({ participantId: params.data.id, teamId })),
      );
    }
  });

  const participants = await computeParticipants();
  const detail = participants.find((entry) => entry.id === params.data.id);
  res.json(UpdateParticipantResponse.parse(detail));
});

router.delete("/participants/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteParticipantParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [participant] = await db
    .delete(participantsTable)
    .where(eq(participantsTable.id, params.data.id))
    .returning();

  if (!participant) {
    res.status(404).json({ error: "Participant not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
