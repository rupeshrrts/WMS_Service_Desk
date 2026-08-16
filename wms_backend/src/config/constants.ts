// ============================================================
// src/config/constants.ts
// ============================================================
// App-wide constants — magic numbers and fixed strings
// that are used across multiple modules.
//
// Why a constants file?
//   If "10" (bcrypt salt rounds) appears in 5 places and you
//   want to change it to 12, you'd need to find all 5 places.
//   Defining it here means changing it in ONE place fixes all.
// ============================================================

export const CONSTANTS = {
  // ---- Security ----
  // bcrypt salt rounds: higher = slower but more secure
  // 10 is the standard for most production apps
  BCRYPT_SALT_ROUNDS: 10,

  // ---- Tickets ----
  // ID prefix for all tickets (e.g. "WMS-0001")
  TICKET_ID_PREFIX: "WMS",
  TICKET_ID_PADDING: 4, // How many digits: 4 → "0001"

  // ---- Comments ----
  MAX_COMMENT_LENGTH: 2000, // Characters

  // ---- Rate Limiting ----
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,          // Per window per IP

  // ---- Allowed Values (used in validation) ----
  TICKET_STATUSES: ["open", "in_progress", "resolved"] as const,
  TICKET_PRIORITIES: ["low", "medium", "high", "critical"] as const,
  TICKET_CATEGORIES: ["pallet", "crane", "conveyor", "software", "other"] as const,
  USER_ROLES: ["super_admin", "wms_admin", "wms_senior_engineer", "wms_engineer", "client_admin", "client_operator"] as const,
} as const;
