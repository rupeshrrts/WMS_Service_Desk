// ============================================================
// src/shared/utils/apiResponse.ts
// ============================================================
// Helper functions to build consistent API responses.
//
// Why?
//   Without this, every controller might format responses
//   differently: some with "data", some with "result", etc.
//   This file forces a single standard so the frontend
//   always knows what shape to expect.
//
// Usage in a controller:
//   res.status(200).json(ok({ user }));
//   res.status(404).json(fail("User not found"));
// ============================================================

import { ApiResponse } from "../types";

// ---- Success Response ----
// Used when everything worked.
// Example: ok({ tickets: [...] })
// Returns: { success: true, data: { tickets: [...] } }
export const ok = <T>(data?: T, message?: string): ApiResponse<T> => ({
  success: true,
  ...(message && { message }),
  ...(data !== undefined && { data }),
});

// ---- Error Response ----
// Used when something went wrong.
// Example: fail("Ticket not found")
// Returns: { success: false, error: "Ticket not found" }
export const fail = (error: string): ApiResponse => ({
  success: false,
  error,
});
