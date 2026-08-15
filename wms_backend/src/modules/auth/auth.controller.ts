// ============================================================
// src/modules/auth/auth.controller.ts
// ============================================================
// AUTH CONTROLLER — HTTP handlers for auth endpoints.
//
// Authentication flow:
//   - Primary: Supabase OTP (handled by frontend + auth middleware)
//   - Secondary: local email+password (for seeded demo accounts)
//
// Endpoints:
//   GET  /api/auth/me      → returns current user profile
//   POST /api/auth/login   → local email+password (optional/legacy)
//   POST /api/auth/logout  → client-side cleanup confirmation
// ============================================================

import { Request, Response, NextFunction } from "express";
import { loginUser, getUserById } from "./auth.service";
import { ok } from "../../shared/utils/apiResponse";
import { AppError } from "../../shared/middleware/errorHandler";

// ---- GET /api/auth/me ----
// Returns the logged-in user's profile from our users table.
// req.user is set by the protect middleware (verifies Supabase token).
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await getUserById(req.user!.userId);
    res.status(200).json(ok({ user }));
  } catch (err) {
    next(err);
  }
};

// ---- POST /api/auth/login ----
// Local email+password login for seeded demo accounts.
// (Most users will use Supabase OTP instead)
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("Email and password are required.", 400);
    }
    const result = await loginUser(email, password);
    res.status(200).json(ok(result, "Login successful."));
  } catch (err) {
    next(err);
  }
};

// ---- POST /api/auth/logout ----
// JWT/Session logout is done client-side. This just confirms.
export const logout = (_req: Request, res: Response): void => {
  res.status(200).json(ok(undefined, "Logged out successfully."));
};
