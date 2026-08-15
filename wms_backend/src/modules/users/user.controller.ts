// ============================================================
// src/modules/users/user.controller.ts
// ============================================================
// USER CONTROLLER — thin HTTP layer for user management.
// Reads request → calls user.service → sends response.
//
// Admin-only operations: getAllUsers, createUser, updateUser, deleteUser
// Engineer-accessible: getEngineers (for assign dropdown)
// Self-access: getUserById (users can see their own profile)
// ============================================================

import { Request, Response, NextFunction } from "express";
import {
  fetchAllUsers,
  fetchEngineers,
  fetchUserById,
  createUser as createUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from "./user.service";
import { ok } from "../../shared/utils/apiResponse";
import { AppError } from "../../shared/middleware/errorHandler";
import { Role } from "../../shared/types";

// ---- GET /api/users ----
// Returns all users. Admin only.
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await fetchAllUsers();
    res.status(200).json(ok({ users, total: users.length }));
  } catch (err) { next(err); }
};

// ---- GET /api/users/engineers ----
// Returns only engineers. Used for the "Assign Engineer" dropdown.
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
    if (role !== "wms_admin" && id !== userId) {
      throw new AppError("Access denied. You can only view your own profile.", 403);
    }

    const user = await fetchUserById(id);
    res.status(200).json(ok({ user }));
  } catch (err) { next(err); }
};

// ---- POST /api/users ----
// Body: { email, password, name, role, phone? }
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name, role, phone } = req.body;

    if (!email || !password || !name || !role) {
      throw new AppError("email, password, name, and role are required.", 400);
    }

    const user = await createUserService({
      email,
      password,
      name,
      role: role as Role,
      phone,
    });

    res.status(201).json(ok({ user }, "User created successfully."));
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

// ---- DELETE /api/users/:id ----
// Admin only. Can't delete yourself.
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await deleteUserService(req.params.id, req.user!.userId);
    res.status(200).json(ok(undefined, `User ${req.params.id} deleted.`));
  } catch (err) { next(err); }
};
