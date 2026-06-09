import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const secret = process.env.BACKEND_JWT_SECRET || "";

/**
 * Verifies the short-lived JWT minted by the web app's `/api/backend-token`
 * route. The token is signed with BACKEND_JWT_SECRET (shared with the web app),
 * so a client can't forge a `userId` — they'd need the secret to sign one.
 */
export function requireUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!secret) {
    console.error("BACKEND_JWT_SECRET is not set");
    return res.status(500).json({ message: "Server auth is misconfigured" });
  }

  try {
    const payload = jwt.verify(token, secret) as { sub?: string };

    if (!payload.sub) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // attach user to request
    (req as any).userId = payload.sub;

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
