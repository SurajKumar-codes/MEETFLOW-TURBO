import { NextFunction, Request, Response } from "express";

export function requireUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = header.replace("Bearer ", "");

  if (!userId) {
    return res.status(401).json({ message: "Invalid user" });
  }

  // attach user to request
  (req as any).userId = userId;

  next();
}