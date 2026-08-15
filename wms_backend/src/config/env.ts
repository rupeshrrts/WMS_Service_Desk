// ============================================================
// src/config/env.ts
// ============================================================
// ALL environment variables live here — validated in one place.
//
// Why this matters:
//   Instead of writing process.env.SOMETHING_URL everywhere
//   and getting undefined silently, we validate everything
//   at startup. If something is missing, the server crashes
//   IMMEDIATELY with a clear message — not 30 minutes later
//   when a request fails.
//
// Usage anywhere in the app:
//   import { env } from "../config/env";
//   console.log(env.PORT);   ← typed, never undefined
// ============================================================

import dotenv from "dotenv";

// Load the .env file before reading any variables
dotenv.config();

// ---- Validate all required variables ----
// List every env var that MUST exist for the app to work.
const REQUIRED_VARS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "JWT_SECRET",
] as const;

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // Tell the developer exactly what is missing so they can fix it fast
  console.error("\n❌ Missing required environment variables:");
  missing.forEach((key) => console.error(`   • ${key}`));
  console.error("\n📄 Copy .env.example to .env and fill in the values.\n");
  process.exit(1); // Stop the server — can't run without config
}

// ---- Export a typed config object ----
// Everything is guaranteed to be a string (not undefined) here
// because we validated above.
export const env = {
  // Server
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",

  // Supabase database
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,

  // JWT token settings
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET! + "_refresh",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",

  // CORS — which frontend URL is allowed to talk to us
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // Helper flags
  isDev: process.env.NODE_ENV !== "production",
  isProd: process.env.NODE_ENV === "production",
} as const;
