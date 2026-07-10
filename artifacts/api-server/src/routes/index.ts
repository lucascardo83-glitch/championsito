import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import teamsRouter from "./teams";
import participantsRouter from "./participants";
import matchesRouter from "./matches";
import standingsRouter from "./standings";
import backupRouter from "./backup";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(teamsRouter);
router.use(participantsRouter);
router.use(matchesRouter);
router.use(standingsRouter);
router.use(backupRouter);

export default router;
