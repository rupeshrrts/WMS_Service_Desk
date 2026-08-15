// ============================================================
// src/modules/users/user.service.ts
// ============================================================
// USER SERVICE — database logic for user management.
//
// Used by admins to manage accounts:
//   - View all users
//   - Get engineers list (for ticket assignment dropdown)
//   - Create accounts with hashed passwords
//   - Update user info
//   - Delete accounts
// ============================================================

import bcrypt from "bcryptjs";
import { supabase } from "../../config/supabase";
import { AppError } from "../../shared/middleware/errorHandler";
import { User, Role } from "../../shared/types";
import { CONSTANTS } from "../../config/constants";

// Safe user columns — never include password_hash in SELECT
const SAFE_USER_COLUMNS = "id, email, name, role, phone, created_at";

// ---- fetchAllUsers ----
// Returns all users sorted by creation date.
// Password hashes are never included.
export const fetchAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from("users")
    .select(SAFE_USER_COLUMNS)
    .order("created_at", { ascending: true });

  if (error) throw new AppError(`Failed to fetch users: ${error.message}`, 500);
  return (data || []) as User[];
};

// ---- fetchEngineers ----
// Returns only users with the "engineer" role.
// Used by the admin to populate the "Assign Engineer" dropdown in the frontend.
export const fetchEngineers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from("users")
    .select(SAFE_USER_COLUMNS)
    .in("role", ["wms_engineer", "wms_senior_engineer"]);

  if (error) throw new AppError(`Failed to fetch engineers: ${error.message}`, 500);
  return (data || []) as User[];
};

// ---- fetchUserById ----
// Returns one user by ID. Throws 404 if not found.
export const fetchUserById = async (userId: string): Promise<User> => {
  const { data, error } = await supabase
    .from("users")
    .select(SAFE_USER_COLUMNS)
    .eq("id", userId)
    .single();

  if (error || !data) throw new AppError(`User not found: ${userId}`, 404);
  return data as User;
};

// ---- createUser ----
// Creates a new user account.
// Password is hashed with bcrypt before saving — NEVER store plain text!
export const createUser = async (input: {
  email: string;
  password: string;
  name: string;
  role: Role;
  phone?: string;
}): Promise<User> => {
  const { email, password, name, role, phone } = input;

  // Validate role
  if (!CONSTANTS.USER_ROLES.includes(role)) {
    throw new AppError(`Invalid role. Allowed: ${CONSTANTS.USER_ROLES.join(", ")}`, 400);
  }

  // Enforce minimum password length
  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters.", 400);
  }

  // Check for email uniqueness
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (existing) throw new AppError("A user with this email already exists.", 409);

  // Hash the password (10 rounds is the standard — higher is more secure but slower)
  const password_hash = await bcrypt.hash(password, CONSTANTS.BCRYPT_SALT_ROUNDS);

  const { data, error } = await supabase
    .from("users")
    .insert({
      id: `usr-${Date.now()}`,          // Simple unique ID based on timestamp
      email: email.toLowerCase().trim(),
      password_hash,
      name: name.trim(),
      role,
      phone: phone?.trim() || null,
      created_at: new Date().toISOString(),
    })
    .select(SAFE_USER_COLUMNS)           // Return without password_hash
    .single();

  if (error) throw new AppError(`Failed to create user: ${error.message}`, 500);
  return data as User;
};

// ---- updateUser ----
// Updates only the fields that were provided (partial update).
// Hashes the new password if one is provided.
export const updateUser = async (
  userId: string,
  updates: { name?: string; phone?: string; role?: Role; password?: string }
): Promise<User> => {
  // Verify user exists first
  await fetchUserById(userId);

  const dbUpdates: Record<string, unknown> = {};

  if (updates.name) dbUpdates.name = updates.name.trim();
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone?.trim() || null;

  if (updates.role) {
    if (!CONSTANTS.USER_ROLES.includes(updates.role)) {
      throw new AppError(`Invalid role. Allowed: ${CONSTANTS.USER_ROLES.join(", ")}`, 400);
    }
    dbUpdates.role = updates.role;
  }

  if (updates.password) {
    if (updates.password.length < 8) throw new AppError("Password must be at least 8 characters.", 400);
    dbUpdates.password_hash = await bcrypt.hash(updates.password, CONSTANTS.BCRYPT_SALT_ROUNDS);
  }

  const { data, error } = await supabase
    .from("users")
    .update(dbUpdates)
    .eq("id", userId)
    .select(SAFE_USER_COLUMNS)
    .single();

  if (error) throw new AppError(`Failed to update user: ${error.message}`, 500);
  return data as User;
};

// ---- deleteUser ----
// Permanently removes a user account.
// Prevents admin from deleting their own account by passing requesterId.
export const deleteUser = async (userId: string, requesterId: string): Promise<void> => {
  if (userId === requesterId) {
    throw new AppError("You cannot delete your own account.", 400);
  }

  await fetchUserById(userId); // Throws 404 if not found

  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw new AppError(`Failed to delete user: ${error.message}`, 500);
};
