// ============================================================
// src/config/supabase.ts
// ============================================================
// Creates a single shared Supabase database client.
//
// Why one client?
//   Creating a new database connection on every request is
//   expensive (slow + wastes memory). We create it once here
//   and every module imports and reuses the same connection.
//
// Why the service_role key?
//   The service_role key gives full database access from the
//   backend. This is safe because only our server uses it —
//   it's never exposed to the browser/frontend.
// ============================================================

import { createClient } from "@supabase/supabase-js";
import { env } from "./env"; // ← uses our validated config (no undefined risk)

// Create and export the single shared Supabase instance
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    // We manage auth ourselves with JWT tokens.
    // Disable Supabase's client-side session handling.
    autoRefreshToken: false,
    persistSession: false,
  },
});
