// ============================================================
// src/shared/middleware/auth.ts
// ============================================================
// Security middleware — verifies Supabase Auth tokens.
//
// How it works:
//   1. Read Bearer token from Authorization header
//   2. Ask Supabase to verify the token (supabase.auth.getUser)
//   3. Look up the user in our custom `users` table by email
//   4. If first-time login, auto-create the user (role=client_operator)
//   5. Attach user info to req.user for downstream handlers
// ============================================================

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { supabase } from "../../config/supabase";
import { JwtPayload, Role } from "../types";
import { fail } from "../utils/apiResponse";

// Extend Express Request so req.user is available in all route handlers
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json(fail("No token provided. Please log in first."));
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    // First try to verify as a local JWT token (for demo users)
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = decoded;
      return next();
    } catch (jwtError) {
      // Not a local JWT token, fallback to Supabase verification below
    }

    // 1. Verify the Supabase token — this makes a request to Supabase
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

    if (error || !authUser) {
      res.status(401).json(fail("Invalid or expired session. Please log in again."));
      return;
    }

    // 2. Look up user in our custom `users` table by email
    let { data: dbUser } = await supabase
      .from("users")
      .select("id, email, name, role, company_name, phone, profile_picture, provider, email_verified")
      .eq("email", authUser.email!)
      .maybeSingle();

    // 3. Auto-create user on first login
    if (!dbUser) {
      const { data: newUser } = await supabase
        .from("users")
        .insert({
          email: authUser.email!,
          name: authUser.user_metadata?.full_name ||
                authUser.email!.split("@")[0],
          role: "client_operator",         // Default role — admin can change later
          company_name: null,
          provider: "supabase",
          email_verified: true,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select("id, email, name, role, company_name, phone, profile_picture, provider, email_verified")
        .single();

      dbUser = newUser;
    }

    if (!dbUser) {
      res.status(500).json(fail("Could not find or create user account."));
      return;
    }

    // 4. Attach user to request
    req.user = {
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role as Role,
      company_name: dbUser.company_name,
    };

    next();
  } catch (err) {
    console.error("[auth.protect] Error:", err);
    res.status(500).json(fail("Internal authentication error."));
  }
};

// ---- authorize ----
// Role-based access control. Must be used AFTER protect().
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res
        .status(403)
        .json(
          fail(
            `Access denied. Required: [${allowedRoles.join(" | ")}]. Your role: ${userRole || "unknown"}.`
          )
        );
      return;
    }

    next();
  };
};
