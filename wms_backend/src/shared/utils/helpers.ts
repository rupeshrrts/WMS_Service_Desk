// ============================================================
// src/shared/utils/helpers.ts
// ============================================================
// Small utility functions used by multiple modules.
//
// These are "pure" functions — they don't talk to the database,
// don't depend on HTTP, just take input and return output.
// That makes them easy to test and reuse anywhere.
// ============================================================

import { CONSTANTS } from "../../config/constants";
import { supabase } from "../../config/supabase";

// ---- Generate Ticket ID ----
// Counts existing tickets in the DB and creates the next sequential ID.
// Example: if there are 7 tickets → returns "WMS-0008"
//
// Why count from DB?
//   Using DB count means IDs stay sequential and unique even if
//   multiple tickets are created at the same time.
export const generateTicketId = async (): Promise<string> => {
  const { data, error } = await supabase
    .from("tickets")
    .select("id");

  if (error) throw new Error("Failed to query ticket IDs from database.");

  let maxNum = 0;
  if (data && data.length > 0) {
    for (const row of data) {
      if (row.id && typeof row.id === "string") {
        const parts = row.id.split("-");
        const num = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  }

  const nextNumber = maxNum + 1;
  const paddedNumber = String(nextNumber).padStart(CONSTANTS.TICKET_ID_PADDING, "0");

  return `${CONSTANTS.TICKET_ID_PREFIX}-${paddedNumber}`; // e.g. "WMS-0015"
};

// ---- Generate Comment ID ----
// Creates a unique comment ID using timestamp + random string.
// Example: "cmt-1722345678901-abc123"
//
// Why not auto-increment?
//   Comments are created frequently. Random IDs avoid collisions
//   and don't require a DB roundtrip to generate.
export const generateCommentId = (): string => {
  const random = Math.random().toString(36).substring(2, 8); // 6 random chars
  return `cmt-${Date.now()}-${random}`;
};

// ---- Format Status Label ----
// Converts internal status values to human-readable display text.
// "in_progress" → "IN PROGRESS"
// "resolved"    → "CLOSED"      (matches frontend display logic)
export const formatStatusLabel = (status: string): string => {
  if (status === "resolved") return "CLOSED";
  return status.replace("_", " ").toUpperCase();
};
