import type { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";

export async function requireAdmin(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  if (!request.session.userId) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const user = await User.findById(request.session.userId).lean();
  if (!user || !user.isActive || user.role !== "admin") {
    response.status(403).json({ error: "Administrator access required" });
    return;
  }

  next();
}
