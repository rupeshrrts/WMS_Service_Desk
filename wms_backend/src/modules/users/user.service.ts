// ============================================================
// src/modules/users/user.service.ts
// ============================================================
// USER SERVICE — database logic for user management.
//
// Used by admins to manage accounts:
//   - View all users (wms_admin) or company users (client_admin)
//   - Get engineers list (for ticket assignment dropdown)
//   - Create accounts with hashed passwords
//   - Update user info
//   - Delete accounts
//   - Toggle operator active/inactive (client_admin manages own operators)
// ============================================================

import bcrypt from "bcryptjs";
import { supabase } from "../../config/supabase";
import { AppError } from "../../shared/middleware/errorHandler";
import { User, Role } from "../../shared/types";
import { CONSTANTS } from "../../config/constants";

// Safe user columns — never include password_hash in SELECT
const SAFE_USER_COLUMNS = "id, email, name, role, company_name, company_id, is_active, phone, created_at";

// ---- fetchAllUsers ----
// Returns users based on caller role.
// super_admin: sees all system users
// wms_admin: sees only client accounts (client_admin, client_operator)
// wms_senior_engineer: sees engineering staff (wms_engineer, wms_senior_engineer)
export const fetchAllUsers = async (callerRole?: Role): Promise<User[]> => {
  let query = supabase
    .from("users")
    .select(SAFE_USER_COLUMNS)
    .order("created_at", { ascending: true });

  if (callerRole === "wms_admin") {
    query = query.in("role", ["client_admin", "client_operator"]);
  } else if (callerRole === "wms_senior_engineer") {
    query = query.in("role", ["wms_engineer", "wms_senior_engineer"]);
  }

  const { data, error } = await query;
  if (error) throw new AppError(`Failed to fetch users: ${error.message}`, 500);
  return (data || []) as User[];
};

// ---- fetchUsersByCompany ----
// Returns all users belonging to a specific company.
// Used by client_admin to see their operators.
export const fetchUsersByCompany = async (companyId: string): Promise<User[]> => {
  const { data, error } = await supabase
    .from("users")
    .select(SAFE_USER_COLUMNS)
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });

  if (error) throw new AppError(`Failed to fetch company users: ${error.message}`, 500);
  return (data || []) as User[];
};

// ---- fetchEngineers ----
// Returns only users with the "engineer" role.
// Used by super_admin and senior engineer to view/assign engineers.
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
// Creates a new user account with role-scoped authority:
// • super_admin: can create any role
// • wms_senior_engineer: can create wms_engineer
// • wms_admin: can create client_admin, client_operator
// • client_admin: can create client_operator for own company
export const createUser = async (
  input: {
    email: string;
    password: string;
    name: string;
    role: Role;
    phone?: string;
    company_name?: string;
    company_id?: string;
  },
  requesterRole?: Role,
  requesterCompanyId?: string | null
): Promise<User> => {
  const { email, password, name, role, phone, company_name, company_id } = input;

  // Validate role
  if (!CONSTANTS.USER_ROLES.includes(role)) {
    throw new AppError(`Invalid role. Allowed: ${CONSTANTS.USER_ROLES.join(", ")}`, 400);
  }

  // Enforce creation authority
  if (requesterRole === "client_admin") {
    if (role !== "client_operator") {
      throw new AppError("Access denied. Client Admins can only create operator accounts.", 403);
    }
  } else if (requesterRole === "wms_senior_engineer") {
    if (role !== "wms_engineer" && role !== "wms_senior_engineer") {
      throw new AppError("Access denied. Senior Engineers can only create Engineer accounts.", 403);
    }
  } else if (requesterRole === "wms_admin") {
    if (role !== "client_admin" && role !== "client_operator") {
      throw new AppError("Access denied. WMS Admin can only create Client Admin or Operator accounts.", 403);
    }
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

  // Hash the password
  const password_hash = await bcrypt.hash(password, CONSTANTS.BCRYPT_SALT_ROUNDS);

  const { data, error } = await supabase
    .from("users")
    .insert({
      id: `usr-${Date.now()}`,
      email: email.toLowerCase().trim(),
      password_hash,
      name: name.trim(),
      role,
      phone: phone?.trim() || null,
      company_name: company_name || (role === "wms_engineer" || role === "wms_senior_engineer" ? "WMS Internal" : null),
      company_id: company_id || null,
      is_active: true,
      created_at: new Date().toISOString(),
    })
    .select(SAFE_USER_COLUMNS)
    .single();

  if (error) throw new AppError(`Failed to create user: ${error.message}`, 500);
  return data as User;
};

// ---- updateUser ----
// Updates only the fields that were provided (partial update).
export const updateUser = async (
  userId: string,
  updates: { name?: string; phone?: string; role?: Role; password?: string }
): Promise<User> => {
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

// ---- toggleUserActive ----
// Enables or disables a user account with strict hierarchy:
// • super_admin: can toggle any user
// • wms_senior_engineer: can toggle wms_engineer only
// • wms_admin: can toggle client_admin and client_operator only
// • client_admin: can toggle client_operator in own company only
export const toggleUserActive = async (
  userId: string,
  isActive: boolean,
  requesterId: string,
  requesterRole: Role,
  requesterCompanyId: string | null
): Promise<User> => {
  if (userId === requesterId) {
    throw new AppError("You cannot disable your own account.", 400);
  }

  const targetUser = await fetchUserById(userId);

  if (requesterRole === "super_admin") {
    // Super admin has full authority
  } else if (requesterRole === "wms_senior_engineer") {
    if (targetUser.role !== "wms_engineer" && targetUser.role !== "wms_senior_engineer") {
      throw new AppError("Access denied. Senior Engineers can only enable/disable Engineer accounts.", 403);
    }
  } else if (requesterRole === "wms_admin") {
    if (targetUser.role !== "client_admin" && targetUser.role !== "client_operator") {
      throw new AppError("Access denied. WMS Admin can only enable/disable Client accounts.", 403);
    }
  } else if (requesterRole === "client_admin") {
    if (targetUser.company_id !== requesterCompanyId) {
      throw new AppError("Access denied. You can only manage operators in your own company.", 403);
    }
    if (targetUser.role !== "client_operator") {
      throw new AppError("You can only enable/disable operator accounts.", 403);
    }
  } else {
    throw new AppError("Access denied.", 403);
  }

  const { data, error } = await supabase
    .from("users")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select(SAFE_USER_COLUMNS)
    .single();

  if (error) throw new AppError(`Failed to update user status: ${error.message}`, 500);
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
