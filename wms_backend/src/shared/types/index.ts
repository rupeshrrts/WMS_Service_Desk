// ============================================================
// src/shared/types/index.ts
// ============================================================
// All shared TypeScript types used across the entire backend.
//
// These types are the "contract" — they define exactly what
// shape an object must have. TypeScript will yell at you if
// you try to use an object that doesn't match the shape.
//
// These mirror the types in the frontend's AppContext.tsx
// so both sides agree on what data looks like.
// ============================================================

import { CONSTANTS } from "../../config/constants";

// ---- Derive types from constants so they always stay in sync ----
// If you add "critical2" to CONSTANTS.TICKET_PRIORITIES,
// the TicketPriority type automatically includes it too.
export type Role           = (typeof CONSTANTS.USER_ROLES)[number];       // "wms_admin" | "wms_senior_engineer" | "wms_engineer" | "client_admin" | "client_operator"
export type TicketStatus   = (typeof CONSTANTS.TICKET_STATUSES)[number];  // "open" | "in_progress" | "resolved"
export type TicketPriority = (typeof CONSTANTS.TICKET_PRIORITIES)[number];// "low" | "medium" | "high" | "critical"
export type TicketCategory = (typeof CONSTANTS.TICKET_CATEGORIES)[number];// "pallet" | "crane" | ...

export type AuthProvider = "local" | "google";

// ---- User ----
// A person who has an account in the WMS system.
export interface User {
  id: string;           // e.g. "usr-1"
  email: string;        // Login email
  password_hash?: string;       // Only for local auth users (never sent to client)
  name: string;         // Display name shown in UI
  role: Role;           // What they're allowed to do
  company_name: string | null;
  phone?: string;       // Optional contact number
  google_id?: string;           // Google sub claim (for OAuth users)
  profile_picture?: string;     // Avatar URL from Google
  provider: AuthProvider;       // "local" or "google"
  email_verified: boolean;      // True for Google users
  last_login?: string;          // ISO date of last login
  created_at?: string;          // ISO date string
  updated_at?: string;          // ISO date string
}

// ---- TokenPair ----
// Access token + refresh token returned on login.
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ---- Ticket ----
// A maintenance or support request submitted by a customer/operator.
export interface Ticket {
  id: string;                   // e.g. "WMS-0007"
  title: string;                // Short problem summary
  description: string;          // Full problem details
  status: TicketStatus;         // Current lifecycle state
  priority: TicketPriority;     // How urgent it is
  category: TicketCategory;     // What kind of equipment/system
  company_name: string | null;   // The company this ticket belongs to
  created_by: string;           // User ID of reporter
  creator_name: string;         // Cached display name
  assigned_to: string | null;   // Engineer user ID (null = unassigned)
  assigned_name: string | null; // Cached engineer name
  resolution?: string | null;   // How was it fixed (filled when resolved)
  created_at: string;
  updated_at: string;
}

// ---- Comment ----
// A message or log entry attached to a ticket.
export interface Comment {
  id: string;
  ticket_id: string;   // Which ticket this belongs to
  author_id: string;   // Who wrote it (or "system" for auto-logs)
  author_name: string;
  author_role: Role;
  content: string;
  created_at: string;
}

// ---- JWT Payload ----
// What gets encoded inside a JWT token after login.
// Decoded by the auth middleware on every request.
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  company_name: string | null;
}

// ---- API Response ----
// Every API response in the system follows this exact shape.
// Makes frontend consumption consistent and predictable.
//
// Success: { success: true,  data: { ... } }
// Error:   { success: false, error: "message" }
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
