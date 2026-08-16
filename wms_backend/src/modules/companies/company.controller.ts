// ============================================================
// src/modules/companies/company.controller.ts
// ============================================================
// COMPANY CONTROLLER — thin HTTP layer for company management.
// ============================================================

import { Request, Response, NextFunction } from "express";
import {
  fetchAllCompanies,
  fetchCompanyById,
  createCompany as createCompanyService,
  createCompanyWithAdmin,
  updateCompany as updateCompanyService,
  fetchCompanyWithUsers,
} from "./company.service";
import { ok } from "../../shared/utils/apiResponse";
import { AppError } from "../../shared/middleware/errorHandler";

// ---- GET /api/companies ----
export const getAllCompanies = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companies = await fetchAllCompanies();
    res.status(200).json(ok({ companies, total: companies.length }));
  } catch (err) { next(err); }
};

// ---- GET /api/companies/:id ----
export const getCompanyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await fetchCompanyById(req.params.id);
    res.status(200).json(ok({ company }));
  } catch (err) { next(err); }
};

// ---- GET /api/companies/:id/users ----
// Returns the company with its full user list.
export const getCompanyUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await fetchCompanyWithUsers(req.params.id);
    res.status(200).json(ok(result));
  } catch (err) { next(err); }
};

// ---- POST /api/companies ----
// Body: { name: string, admin?: { name, email, password, phone? } }
export const createCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, admin } = req.body;
    if (!name) throw new AppError("Company name is required.", 400);

    const result = await createCompanyWithAdmin(name, admin);
    const message = result.adminUser
      ? `Company "${result.company.name}" and admin account "${result.adminUser.email}" created successfully.`
      : `Company "${result.company.name}" created successfully.`;

    res.status(201).json(ok(result, message));
  } catch (err) { next(err); }
};

// ---- PATCH /api/companies/:id ----
// Body: { name?: string, is_active?: boolean }
export const updateCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, is_active } = req.body;
    const company = await updateCompanyService(req.params.id, { name, is_active });

    const action = is_active === false ? "suspended" : "updated";
    res.status(200).json(ok({ company }, `Company ${action} successfully.`));
  } catch (err) { next(err); }
};
