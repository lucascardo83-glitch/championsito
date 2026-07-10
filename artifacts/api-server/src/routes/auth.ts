import { Router, type IRouter } from "express";
import { AdminLoginBody, AdminLoginResponse } from "@workspace/api-zod";
import { createAdminToken } from "../lib/adminAuth";

const router: IRouter = Router();

router.post("/auth/login", (req, res): void => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    req.log.error("ADMIN_PASSWORD is not configured");
    res.status(500).json({ error: "Admin login is not configured" });
    return;
  }

  if (parsed.data.password !== adminPassword) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  const token = createAdminToken();
  res.json(AdminLoginResponse.parse({ token }));
});

export default router;
