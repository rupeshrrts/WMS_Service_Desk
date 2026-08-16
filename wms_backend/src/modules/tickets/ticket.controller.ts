// ============================================================
// src/modules/tickets/ticket.controller.ts
// ============================================================
// TICKET CONTROLLER — handles HTTP for all ticket endpoints.
//
// This file is intentionally thin. Each function:
//   1. Reads from req.body / req.params / req.query
//   2. Calls the ticket service
//   3. Sends the response
//
// No database code, no business logic — all in ticket.service.ts
// ============================================================

import { Request, Response, NextFunction } from "express";
import {
  fetchAllTickets,
  fetchTicketById,
  createNewTicket,
  changeTicketStatus,
  reassignTicket,
  escalateToSenior,
  removeTicket,
} from "./ticket.service";
import { ok } from "../../shared/utils/apiResponse";
import { AppError } from "../../shared/middleware/errorHandler";
import { supabase } from "../../config/supabase";
import { TicketStatus, TicketPriority, TicketCategory } from "../../shared/types";

// ---- GET /api/tickets ----
// Optional query params: ?status=open&priority=critical&category=crane
export const getAllTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, role, company_name } = req.user!;
    let { company_id } = req.user!;
    const { status, priority, category } = req.query;

    // Fallback: look up company_id from DB if missing from old JWT token
    if (!company_id && (role === "client_admin" || role === "client_operator")) {
      const { data: dbUser } = await supabase.from("users").select("company_id").eq("id", userId).maybeSingle();
      company_id = dbUser?.company_id || null;
    }

    const tickets = await fetchAllTickets(userId, role, company_name, company_id, {
      status: status as string | undefined,
      priority: priority as string | undefined,
      category: category as string | undefined,
    });

    res.status(200).json(ok({ tickets, total: tickets.length }));
  } catch (err) { next(err); }
};

// ---- GET /api/tickets/:id ----
export const getTicketById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await fetchTicketById(req.params.id, req.user!.userId, req.user!.role, req.user!.company_name, req.user!.company_id);
    res.status(200).json(ok({ ticket }));
  } catch (err) { next(err); }
};

// ---- POST /api/tickets ----
// Body: { title, description, priority, category }
export const createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, priority, category } = req.body;

    if (!title || !description || !priority || !category) {
      throw new AppError("title, description, priority, and category are all required.", 400);
    }

    // Fetch creator info + company_id in one go (also resolves old token missing company_id)
    const { data: creator } = await supabase
      .from("users")
      .select("name, company_id, company_name")
      .eq("id", req.user!.userId)
      .single();

    if (!creator) throw new AppError("Could not find your user account.", 500);

    // Use DB values as source of truth (more reliable than JWT for company info)
    const resolvedCompanyId   = creator.company_id   || req.user!.company_id   || null;
    const resolvedCompanyName = creator.company_name || req.user!.company_name || null;

    const ticket = await createNewTicket(req.user!.userId, creator.name, resolvedCompanyName, resolvedCompanyId, {
      title,
      description,
      priority: priority as TicketPriority,
      category: category as TicketCategory,
    });

    res.status(201).json(ok({ ticket }, "Ticket created successfully."));
  } catch (err) { next(err); }
};

// ---- PATCH /api/tickets/:id/status ----
// Body: { status: "open" | "in_progress" | "resolved", resolution?: string }
export const updateTicketStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, resolution } = req.body;

    if (!status) throw new AppError("status is required.", 400);

    // Get actor's display name for the activity log comment
    const { data: actor } = await supabase
      .from("users")
      .select("name")
      .eq("id", req.user!.userId)
      .single();

    const ticket = await changeTicketStatus(
      req.params.id,
      status as TicketStatus,
      resolution,
      req.user!.userId,
      actor?.name || req.user!.email,
      req.user!.role
    );

    res.status(200).json(ok({ ticket }, `Ticket status updated to "${status}".`));
  } catch (err) { next(err); }
};

// ---- PATCH /api/tickets/:id/assign ----
// Body: { engineerId: string | null }
//   null  → unassign
//   "usr-2" → assign that engineer
export const assignTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { engineerId } = req.body; // null is valid (unassign)

    const { data: actor } = await supabase
      .from("users")
      .select("name")
      .eq("id", req.user!.userId)
      .single();

    const ticket = await reassignTicket(
      req.params.id,
      engineerId ?? null,
      req.user!.userId,
      actor?.name || req.user!.email,
      req.user!.role
    );

    const message = engineerId ? `Ticket assigned.` : "Ticket unassigned.";
    res.status(200).json(ok({ ticket }, message));
  } catch (err) { next(err); }
};

// ---- PATCH /api/tickets/:id/escalate ----
// Body: { explanation: string }
export const escalateTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { explanation } = req.body;
    if (!explanation?.trim()) throw new AppError("An explanation is required to escalate.", 400);

    const { data: actor } = await supabase
      .from("users")
      .select("name")
      .eq("id", req.user!.userId)
      .single();

    const ticket = await escalateToSenior(
      req.params.id,
      explanation,
      req.user!.userId,
      actor?.name || req.user!.email,
      req.user!.role
    );

    res.status(200).json(ok({ ticket }, "Ticket escalated to senior support."));
  } catch (err) { next(err); }
};

// ---- DELETE /api/tickets/:id ----
export const deleteTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await removeTicket(req.params.id);
    res.status(200).json(ok(undefined, `Ticket ${req.params.id} permanently deleted.`));
  } catch (err) { next(err); }
};
