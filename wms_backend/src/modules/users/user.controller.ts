// ============================================================
// src/modules/users/user.controller.ts
// ============================================================
// USER CONTROLLER — thin HTTP layer for user management.
// Reads request → calls user.service → sends response.
//
// wms_admin operations:   getAllUsers, createUser, updateUser, deleteUser
// client_admin operations: getCompanyUsers, createOperator, toggleOperatorActive
// Engineer-accessible:    getEngineers (for assign dropdown)
// Self-access:            getUserById (users can see their own profile)
// ============================================================

import { Request, Response, NextFunction } from "express";
import { supabase } from "../../config/supabase";
import {
  fetchAllUsers,
  fetchUsersByCompany,
  fetchEngineers,
  fetchUserById,
  createUser as createUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
  toggleUserActive,
} from "./user.service";
import { ok } from "../../shared/utils/apiResponse";
import { AppError } from "../../shared/middleware/errorHandler";
import { Role } from "../../shared/types";

// ---- GET /api/users ----
// Returns users scoped by role.
// super_admin: all users
// wms_admin: client users only
// wms_senior_engineer: engineers only
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await fetchAllUsers(req.user?.role);
    res.status(200).json(ok({ users, total: users.length }));
  } catch (err) { next(err); }
};

// ---- GET /api/users/company ----
// Returns users in the requesting client_admin's company.
export const getCompanyUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let { company_id } = req.user!;

    // Fallback: if company_id is missing from JWT (old token), look it up from DB
    if (!company_id) {
      const { data: dbUser } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", req.user!.userId)
        .maybeSingle();
      company_id = dbUser?.company_id || null;
    }

    if (!company_id) throw new AppError("Company information not found. Please log out and log back in.", 400);

    const users = await fetchUsersByCompany(company_id);
    res.status(200).json(ok({ users, total: users.length }));
  } catch (err) { next(err); }
};

// ---- GET /api/users/engineers ----
// Returns only engineers. Used for the "Assign Engineer" dropdown and Engineer Management.
export const getEngineers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const engineers = await fetchEngineers();
    res.status(200).json(ok({ engineers }));
  } catch (err) { next(err); }
};

// ---- GET /api/users/:id ----
// Non-admins can only view their own profile.
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user!;

    // Non-admin trying to view someone else's profile → block
    if (role !== "super_admin" && role !== "wms_admin" && id !== userId) {
      throw new AppError("Access denied. You can only view your own profile.", 403);
    }

    const user = await fetchUserById(id);
    res.status(200).json(ok({ user }));
  } catch (err) { next(err); }
};

// ---- POST /api/users ----
// Body: { email, password, name, role, phone?, company_name?, company_id? }
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name, role, phone, company_name, company_id } = req.body;
    const requesterRole = req.user!.role;

    if (!email || !password || !name || !role) {
      throw new AppError("email, password, name, and role are required.", 400);
    }

    const user = await createUserService(
      {
        email,
        password,
        name,
        role: role as Role,
        phone,
        company_name: requesterRole === "client_admin" ? (req.user!.company_name || undefined) : company_name,
        company_id: requesterRole === "client_admin" ? (req.user!.company_id || undefined) : company_id,
      },
      requesterRole,
      req.user!.company_id
    );

    res.status(201).json(ok({ user }, "User account created successfully."));
  } catch (err) { next(err); }
};

// ---- PATCH /api/users/:id ----
// Body: any combination of { name?, phone?, role?, password? }
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, phone, role, password } = req.body;
    const user = await updateUserService(req.params.id, { name, phone, role, password });
    res.status(200).json(ok({ user }, "User updated."));
  } catch (err) { next(err); }
};

// ---- PATCH /api/users/:id/toggle-active ----
// Body: { isActive: boolean }
// Allows client_admin to enable/disable their operators.
// Allows wms_admin to toggle any user.
export const toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      throw new AppError("isActive must be a boolean (true or false).", 400);
    }

    const user = await toggleUserActive(
      req.params.id,
      isActive,
      req.user!.userId,
      req.user!.role,
      req.user!.company_id
    );

    const action = isActive ? "enabled" : "disabled";
    res.status(200).json(ok({ user }, `User account ${action} successfully.`));
  } catch (err) { next(err); }
};

// ---- DELETE /api/users/:id ----
// Admin only. Can't delete yourself.
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await deleteUserService(req.params.id, req.user!.userId);
    res.status(200).json(ok(undefined, `User ${req.params.id} deleted.`));
  } catch (err) { next(err); }
};
