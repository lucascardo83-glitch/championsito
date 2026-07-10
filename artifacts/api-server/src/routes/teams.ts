import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, teamsTable } from "@workspace/db";
import {
  CreateTeamBody,
  CreateTeamResponse,
  DeleteTeamParams,
  ListTeamsResponse,
  UpdateTeamBody,
  UpdateTeamParams,
  UpdateTeamResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";

const router: IRouter = Router();

router.get("/teams", async (_req, res): Promise<void> => {
  const teams = await db.select().from(teamsTable).orderBy(teamsTable.potNumber, teamsTable.name);
  res.json(ListTeamsResponse.parse(teams));
});

router.post("/teams", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateTeamBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [team] = await db.insert(teamsTable).values(parsed.data).returning();
  res.status(201).json(CreateTeamResponse.parse(team));
});

router.patch("/teams/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateTeamParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTeamBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [team] = await db
    .update(teamsTable)
    .set(parsed.data)
    .where(eq(teamsTable.id, params.data.id))
    .returning();

  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }

  res.json(UpdateTeamResponse.parse(team));
});

router.delete("/teams/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteTeamParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [team] = await db.delete(teamsTable).where(eq(teamsTable.id, params.data.id)).returning();

  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
