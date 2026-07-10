import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET must be set to issue admin sessions.");
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

/**
 * Issues a signed, time-limited admin session token. Stateless — no
 * server-side session storage needed. Format: "<expiryMs>.<hmacSignature>".
 */
export function createAdminToken(): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = String(expiresAt);
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function isValidAdminToken(token: string): boolean {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const validSignature =
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  if (!validSignature) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt)) return false;

  return Date.now() < expiresAt;
}

/**
 * Express middleware protecting admin-only routes. Expects
 * `Authorization: Bearer <token>` issued by POST /api/auth/login.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token || !isValidAdminToken(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
