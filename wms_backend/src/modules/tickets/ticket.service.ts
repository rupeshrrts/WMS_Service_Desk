// ============================================================
// src/modules/tickets/ticket.service.ts
// ============================================================
// TICKET SERVICE — all database logic for tickets lives here.
//
// Functions:
//   fetchAllTickets      → Get tickets (role-filtered)
//   fetchTicketById      → Get one ticket
//   createNewTicket      → Insert a new ticket + system comment
//   changeTicketStatus   → Update status + log comment
//   reassignTicket       → Assign/unassign engineer + log comment
//   escalateToSenior     → Escalate ticket + log comments
//   removeTicket         → Delete ticket permanently
// ============================================================

import { supabase } from "../../config/supabase";
import { AppError } from "../../shared/middleware/errorHandler";
import { Ticket, TicketStatus, TicketPriority, TicketCategory, Role } from "../../shared/types";
import { CONSTANTS } from "../../config/constants";
import { generateTicketId, generateCommentId, formatStatusLabel } from "../../shared/utils/helpers";

// ---- fetchAllTickets ----
// Returns tickets filtered by the calling user's role:
//   admin    → all tickets
//   engineer → assigned to them OR unassigned
//   customer → only their own tickets
//
// Supports optional filters: status, priority, category
export const fetchAllTickets = async (
  userId: string,
  role: Role,
  companyName: string | null,
  filters: { status?: string; priority?: string; category?: string }
): Promise<Ticket[]> => {
  let query = supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false }); // Newest first

  // Role-based visibility
  if (role === "client_operator") {
    query = query.eq("created_by", userId);
  } else if (role === "client_admin") {
    if (!companyName) throw new AppError("Company name required for client admin.", 400);
    query = query.eq("company_name", companyName);
  } else if (role === "wms_engineer") {
    // Engineer sees their tickets or unassigned ones
    query = query.or(`assigned_to.eq.${userId},assigned_to.is.null`);
  }
  // wms_admin and wms_senior_engineer see everything (no filter)

  // Optional URL query param filters
  if (filters.status)   query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.category) query = query.eq("category", filters.category);

  const { data, error } = await query;
  if (error) throw new AppError(`Failed to fetch tickets: ${error.message}`, 500);

  return (data || []) as Ticket[];
};

// ---- fetchTicketById ----
// Returns a single ticket. Throws 404 if not found.
// Throws 403 if a customer tries to view someone else's ticket.
export const fetchTicketById = async (
  ticketId: string,
  userId: string,
  role: Role,
  companyName: string | null
): Promise<Ticket> => {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (error || !data) throw new AppError(`Ticket not found: ${ticketId}`, 404);

  if (role === "client_operator" && data.created_by !== userId) {
    throw new AppError("Access denied. You can only view your own tickets.", 403);
  }
  if (role === "client_admin" && data.company_name !== companyName) {
    throw new AppError("Access denied. You can only view tickets from your company.", 403);
  }

  return data as Ticket;
};

// ---- createNewTicket ----
// Validates input, generates an ID, inserts the ticket,
// and auto-logs a "Ticket created" system comment.
export const createNewTicket = async (
  userId: string,
  creatorName: string,
  companyName: string | null,
  input: {
    title: string;
    description: string;
    priority: TicketPriority;
    category: TicketCategory;
  }
): Promise<Ticket> => {
  const { title, description, priority, category } = input;

  // Validate allowed values using constants (single source of truth)
  if (!CONSTANTS.TICKET_PRIORITIES.includes(priority)) {
    throw new AppError(`Invalid priority. Allowed: ${CONSTANTS.TICKET_PRIORITIES.join(", ")}`, 400);
  }
  if (!CONSTANTS.TICKET_CATEGORIES.includes(category)) {
    throw new AppError(`Invalid category. Allowed: ${CONSTANTS.TICKET_CATEGORIES.join(", ")}`, 400);
  }

  const id = await generateTicketId(); // e.g. "WMS-0008"
  const now = new Date().toISOString();

  const newTicket: Ticket = {
    id,
    title: title.trim(),
    description: description.trim(),
    status: "open",
    priority,
    category,
    company_name: companyName,
    created_by: userId,
    creator_name: creatorName,
    assigned_to: null,
    assigned_name: null,
    resolution: null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("tickets")
    .insert(newTicket)
    .select()
    .single();

  if (error) throw new AppError(`Failed to create ticket: ${error.message}`, 500);

  // Auto-log a system comment for this action
  await supabase.from("comments").insert({
    id: generateCommentId(),
    ticket_id: id,
    author_id: "system",
    author_name: "System",
    author_role: "system" as any, // "system" role for auto-logs
    content: `Ticket created by ${creatorName}. Status: Open, Priority: ${priority.toUpperCase()}.`,
    created_at: now,
  });

  return data as Ticket;
};

// ---- changeTicketStatus ----
// Updates a ticket's status and logs an activity comment.
// Requires resolution note when resolving.
export const changeTicketStatus = async (
  ticketId: string,
  newStatus: TicketStatus,
  resolution: string | undefined,
  actorId: string,
  actorName: string,
  actorRole: Role
): Promise<Ticket> => {
  if (!CONSTANTS.TICKET_STATUSES.includes(newStatus)) {
    throw new AppError(`Invalid status. Allowed: ${CONSTANTS.TICKET_STATUSES.join(", ")}`, 400);
  }
  if (newStatus === "resolved" && !resolution?.trim()) {
    throw new AppError("A resolution note is required when closing a ticket.", 400);
  }

  // Fetch current ticket to access existing values
  const { data: existing, error: fetchErr } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (fetchErr || !existing) throw new AppError(`Ticket not found: ${ticketId}`, 404);

  const now = new Date().toISOString();

  const updates: Partial<Ticket> = {
    status: newStatus,
    updated_at: now,
    ...(newStatus === "resolved"
      ? {
          resolution: resolution?.trim() || existing.resolution,
          assigned_to: existing.assigned_to || actorId,
          assigned_name: existing.assigned_name || actorName,
        }
      : { resolution: null }),
  };

  const { data, error } = await supabase
    .from("tickets")
    .update(updates)
    .eq("id", ticketId)
    .select()
    .single();

  if (error) throw new AppError(`Failed to update status: ${error.message}`, 500);

  // Log the status change as a comment
  await supabase.from("comments").insert({
    id: generateCommentId(),
    ticket_id: ticketId,
    author_id: actorId,
    author_name: actorName,
    author_role: actorRole,
    content: `Status updated to ${formatStatusLabel(newStatus)}${
      newStatus === "resolved" && resolution ? `\n\nResolution: ${resolution}` : ""
    }`,
    created_at: now,
  });

  return data as Ticket;
};

// ---- reassignTicket ----
// Assigns or unassigns an engineer. Auto-updates ticket status.
// engineerId = null → unassign (status → "open")
// engineerId = "usr-2" → assign (status → "in_progress")
export const reassignTicket = async (
  ticketId: string,
  engineerId: string | null,
  actorId: string,
  actorName: string,
  actorRole: Role
): Promise<Ticket> => {
  const { data: ticket, error: fetchErr } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (fetchErr || !ticket) throw new AppError(`Ticket not found: ${ticketId}`, 404);

  const now = new Date().toISOString();
  let engineerName: string | null = null;

  if (engineerId) {
    // Validate the engineer exists and has the right role
    const { data: eng, error: engErr } = await supabase
      .from("users")
      .select("name, role")
      .eq("id", engineerId)
      .single();

    if (engErr || !eng) throw new AppError(`Engineer "${engineerId}" not found.`, 404);
    if (eng.role !== "wms_engineer" && eng.role !== "wms_senior_engineer") {
      throw new AppError("You can only assign engineer-role users to tickets.", 400);
    }

    engineerName = eng.name;
  }

  // Auto-set status based on assignment (don't change if already resolved)
  const newStatus: TicketStatus =
    ticket.status === "resolved"
      ? "resolved"
      : engineerId
      ? "in_progress"
      : "open";

  const { data, error } = await supabase
    .from("tickets")
    .update({
      assigned_to: engineerId || null,
      assigned_name: engineerName,
      status: newStatus,
      updated_at: now,
    })
    .eq("id", ticketId)
    .select()
    .single();

  if (error) throw new AppError(`Failed to assign ticket: ${error.message}`, 500);

  // Log assignment as a comment
  await supabase.from("comments").insert({
    id: generateCommentId(),
    ticket_id: ticketId,
    author_id: actorId,
    author_name: actorName,
    author_role: actorRole,
    content: engineerName
      ? `Ticket assigned to ${engineerName}. Status updated to IN PROGRESS.`
      : `Ticket unassigned. Status updated to OPEN.`,
    created_at: now,
  });

  return data as Ticket;
};

// ---- escalateToSenior ----
// Marks a ticket as escalated and logs the engineer's explanation.
export const escalateToSenior = async (
  ticketId: string,
  explanation: string,
  actorId: string,
  actorName: string,
  actorRole: Role
): Promise<Ticket> => {
  const { data: ticket, error: fetchErr } = await supabase
    .from("tickets")
    .select("id")
    .eq("id", ticketId)
    .single();

  if (fetchErr || !ticket) throw new AppError(`Ticket not found: ${ticketId}`, 404);

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("tickets")
    .update({ status: "in_progress", updated_at: now })
    .eq("id", ticketId)
    .select()
    .single();

  if (error) throw new AppError(`Failed to escalate: ${error.message}`, 500);

  // Two comments: engineer's explanation + system confirmation
  await supabase.from("comments").insert([
    {
      id: generateCommentId(),
      ticket_id: ticketId,
      author_id: actorId,
      author_name: actorName,
      author_role: actorRole,
      content: `🚨 [Escalation Log] ${explanation.trim()}`,
      created_at: now,
    },
    {
      id: generateCommentId(),
      ticket_id: ticketId,
      author_id: "system",
      author_name: "System",
      author_role: "system" as any,
      content: "Ticket escalated to senior support for review.",
      created_at: now,
    },
  ]);

  return data as Ticket;
};

// ---- removeTicket ----
// Permanently deletes a ticket (admin only).
// Related comments are deleted automatically (ON DELETE CASCADE in DB).
export const removeTicket = async (ticketId: string): Promise<void> => {
  const { data, error: fetchErr } = await supabase
    .from("tickets")
    .select("id")
    .eq("id", ticketId)
    .single();

  if (fetchErr || !data) throw new AppError(`Ticket not found: ${ticketId}`, 404);

  const { error } = await supabase.from("tickets").delete().eq("id", ticketId);
  if (error) throw new AppError(`Failed to delete ticket: ${error.message}`, 500);
};
