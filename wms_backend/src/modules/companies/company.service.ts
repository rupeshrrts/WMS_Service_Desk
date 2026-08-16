// ============================================================
// src/modules/companies/company.service.ts
// ============================================================
// COMPANY SERVICE — database logic for company management.
//
// WMS Admin can:
//   - View all companies
//   - Create new companies
//   - Update company name or active status
//   - View users belonging to a company
// ============================================================

import { supabase } from "../../config/supabase";
import { AppError } from "../../shared/middleware/errorHandler";
import { Company, User } from "../../shared/types";
import { createUser } from "../users/user.service";

// ---- fetchAllCompanies ----
// Returns all companies ordered by name.
export const fetchAllCompanies = async (): Promise<Company[]> => {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new AppError(`Failed to fetch companies: ${error.message}`, 500);
  return (data || []) as Company[];
};

// ---- fetchCompanyById ----
// Returns a single company by ID.
export const fetchCompanyById = async (companyId: string): Promise<Company> => {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single();

  if (error || !data) throw new AppError(`Company not found: ${companyId}`, 404);
  return data as Company;
};

// ---- createCompany ----
// Creates a new company. Name must be unique.
export const createCompany = async (name: string): Promise<Company> => {
  const trimmedName = name.trim();
  if (!trimmedName) throw new AppError("Company name is required.", 400);

  // Check uniqueness
  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .eq("name", trimmedName)
    .maybeSingle();

  if (existing) throw new AppError(`A company named "${trimmedName}" already exists.`, 409);

  const { data, error } = await supabase
    .from("companies")
    .insert({
      id: `comp-${Date.now()}`,
      name: trimmedName,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new AppError(`Failed to create company: ${error.message}`, 500);
  return data as Company;
};

// ---- createCompanyWithAdmin ----
// Creates a new company, and optionally creates its initial Client Admin account.
export const createCompanyWithAdmin = async (
  name: string,
  admin?: { name: string; email: string; password: string; phone?: string }
): Promise<{ company: Company; adminUser?: User }> => {
  const company = await createCompany(name);
  let adminUser: User | undefined = undefined;

  if (admin && admin.email?.trim() && admin.password?.trim() && admin.name?.trim()) {
    adminUser = await createUser({
      email: admin.email.trim(),
      password: admin.password.trim(),
      name: admin.name.trim(),
      role: "client_admin",
      phone: admin.phone?.trim(),
      company_name: company.name,
      company_id: company.id,
    });
  }

  return { company, adminUser };
};

// ---- updateCompany ----
// Updates company name and/or active status.
export const updateCompany = async (
  companyId: string,
  updates: { name?: string; is_active?: boolean }
): Promise<Company> => {
  await fetchCompanyById(companyId); // Throws 404 if not found

  const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) dbUpdates.name = updates.name.trim();
  if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;

  const { data, error } = await supabase
    .from("companies")
    .update(dbUpdates)
    .eq("id", companyId)
    .select()
    .single();

  if (error) throw new AppError(`Failed to update company: ${error.message}`, 500);
  return data as Company;
};

// ---- fetchCompanyWithUsers ----
// Returns a company along with its user list (operator count etc.)
export const fetchCompanyWithUsers = async (companyId: string) => {
  const company = await fetchCompanyById(companyId);

  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, name, role, is_active, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });

  if (error) throw new AppError(`Failed to fetch company users: ${error.message}`, 500);

  return { company, users: users || [] };
};
