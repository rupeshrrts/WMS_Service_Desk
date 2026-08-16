// ============================================================
// src/shared/middleware/auth.ts
// ============================================================
// Security middleware — verifies JWT or Supabase Auth tokens.
//
// How it works:
//   1. Read Bearer token from Authorization header
//   2. Try to verify as a local JWT (for demo users)
//   3. Fallback: ask Supabase to verify the token
//   4. Look up the user in our custom `users` table by email
//   5. Check is_active — block disabled accounts (401)
//   6. Attach user info to req.user for downstream handlers
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

      // Verify user is still active AND their company is not suspended
      const { data: dbUser } = await supabase
        .from("users")
        .select("id, is_active, company_id")
        .eq("id", decoded.userId)
        .maybeSingle();

      if (dbUser && dbUser.is_active === false) {
        res.status(401).json(fail("Your account has been disabled. Please contact your company administrator."));
        return;
      }

      // Check if the company itself is suspended (blocks ALL users in that company)
      if (dbUser?.company_id) {
        const { data: company } = await supabase
          .from("companies")
          .select("is_active, name")
          .eq("id", dbUser.company_id)
          .maybeSingle();

        if (company && company.is_active === false) {
          res.status(401).json(fail(`Access suspended. "${company.name}" has been deactivated by WMS. Please contact WMS support.`));
          return;
        }
      }

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
      .select("id, email, name, role, company_name, company_id, is_active, phone, profile_picture, provider, email_verified")
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
          company_id: null,
          is_active: true,
          provider: "supabase",
          email_verified: true,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select("id, email, name, role, company_name, company_id, is_active, phone, profile_picture, provider, email_verified")
        .single();

      dbUser = newUser;
    }

    if (!dbUser) {
      res.status(500).json(fail("Could not find or create user account."));
      return;
    }

    // 4. Check if account is active
    if (dbUser.is_active === false) {
      res.status(401).json(fail("Your account has been disabled. Please contact your company administrator."));
      return;
    }

    // Check if user's company has been deactivated/suspended
    if (dbUser.company_id) {
      const { data: company } = await supabase
        .from("companies")
        .select("is_active, name")
        .eq("id", dbUser.company_id)
        .maybeSingle();

      if (company && company.is_active === false) {
        res.status(401).json(fail(`Access suspended. "${company.name}" has been deactivated by WMS. Please contact WMS support.`));
        return;
      }
    }

    // 5. Attach user to request
    req.user = {
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role as Role,
      company_name: dbUser.company_name,
      company_id: dbUser.company_id,
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
