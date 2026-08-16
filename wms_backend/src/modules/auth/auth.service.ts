// ============================================================
// src/modules/auth/auth.service.ts
// ============================================================
// AUTH SERVICE — business logic for authentication.
//
// Authentication is handled by Supabase OTP (passwordless email).
// This service provides:
//   • JWT generation (access token) from Supabase session info
//   • Local email+password login (for existing seeded users)
//   • getUserById for the /me endpoint
//   • is_active check — disabled accounts cannot log in
// ============================================================

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { supabase } from "../../config/supabase";
import { env } from "../../config/env";
import { AppError } from "../../shared/middleware/errorHandler";
import { User, JwtPayload } from "../../shared/types";

// ============================================================
// generateToken
// Creates a signed JWT containing user ID, email, role,
// company_name, and company_id.
// ============================================================
export const generateToken = (user: User): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    company_name: user.company_name,
    company_id: user.company_id,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

// ============================================================
// loginUser  (local email + password auth)
// For the pre-seeded demo accounts in the database.
// ============================================================
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: Omit<User, "password_hash">; token: string }> => {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (error || !user) {
    throw new AppError("Invalid email or password.", 401);
  }

  // Check if account is disabled
  if (user.is_active === false) {
    throw new AppError(
      "Your account has been disabled. Please contact your company administrator.",
      401
    );
  }

  // Check if user's company has been deactivated/suspended by WMS Admin
  if (user.company_id) {
    const { data: company } = await supabase
      .from("companies")
      .select("is_active, name")
      .eq("id", user.company_id)
      .maybeSingle();

    if (company && company.is_active === false) {
      throw new AppError(
        `Access suspended. Your company "${company.name}" has been deactivated by WMS Admin. Please contact support.`,
        401
      );
    }
  } else if (user.company_name && user.company_name !== "WMS Internal") {
    const { data: company } = await supabase
      .from("companies")
      .select("is_active, name")
      .eq("name", user.company_name)
      .maybeSingle();

    if (company && company.is_active === false) {
      throw new AppError(
        `Access suspended. Your company "${company.name}" has been deactivated by WMS Admin. Please contact support.`,
        401
      );
    }
  }

  // Google/Supabase OTP users don't have a local password
  if (!user.password_hash || user.password_hash === "oauth_google") {
    throw new AppError(
      "This account uses email sign-in. Please use the OTP login instead.",
      400
    );
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = generateToken(user as User);
  const { password_hash, ...safeUser } = user;

  return { user: safeUser as Omit<User, "password_hash">, token };
};

// ============================================================
// getUserById  (used by the /me endpoint)
// ============================================================
export const getUserById = async (userId: string): Promise<Omit<User, "password_hash">> => {
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, name, role, company_name, company_id, is_active, phone, profile_picture, provider, email_verified, last_login, created_at")
    .eq("id", userId)
    .single();

  if (error || !user) {
    throw new AppError("User not found.", 404);
  }

  return user as Omit<User, "password_hash">;
};
