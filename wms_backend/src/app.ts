// ============================================================
// src/app.ts — EXPRESS APPLICATION SETUP
// ============================================================
// This file configures Express with all its middleware and routes.
// It DOES NOT start the server — that's done in index.ts.
//
// Why separate app.ts and index.ts?
//   • app.ts = the Express configuration (testable)
//   • index.ts = starting the server (running it)
//   This separation makes it easy to import the app in tests
//   without actually starting the HTTP server.
//
// The middleware order matters! Here's the flow for every request:
//   1. helmet     → adds security headers
//   2. cors       → allows frontend to talk to backend
//   3. rate limit → blocks too many requests from one IP
//   4. json parse → reads the request body
//   5. morgan     → logs the request to terminal
//   6. routes     → the actual API handlers
//   7. notFound   → 404 for unmatched URLs
//   8. error      → catches all errors and sends clean JSON
// ============================================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { CONSTANTS } from "./config/constants";

// Import all route modules
import authRoutes from "./modules/auth/auth.routes";
import ticketRoutes from "./modules/tickets/ticket.routes";
import userRoutes from "./modules/users/user.routes";

// Import error handling middleware
import { errorHandler, notFound } from "./shared/middleware/errorHandler";

// ---- Create Express app ----
const app = express();

// ============================================================
// 1. SECURITY — helmet adds various security HTTP headers
// ============================================================
app.use(helmet());

// ============================================================
// 2. CORS — allow the frontend (localhost:3000) to call the backend (localhost:5000)
// Without this, the browser blocks cross-origin requests
// ============================================================
app.use(
  cors({
    origin: true, // Allow any origin or frontend url
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id", "x-user-role", "x-user-name"],
    credentials: true,
  })
);

// ============================================================
// 3. RATE LIMITING — prevents one user from spamming the API
// ============================================================
app.use(
  rateLimit({
    windowMs: CONSTANTS.RATE_LIMIT_WINDOW_MS,  // 15 minutes
    max: CONSTANTS.RATE_LIMIT_MAX_REQUESTS,     // 100 requests per window
    message: {
      success: false,
      error: "Too many requests. Please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ============================================================
// 4. BODY PARSING — reads JSON from request body into req.body
// ============================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ============================================================
// 5. LOGGING — prints every request to the terminal
//    Example output: POST /api/auth/login 200 45ms
// ============================================================
if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ============================================================
// 6. HEALTH CHECK — simple "is the server alive?" endpoint
//    Test it: GET http://localhost:5000/health
// ============================================================
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "WMS Backend is running!",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ============================================================
// 7. API ROUTES — mount all feature modules
//    /api/auth/*     → login, logout, me
//    /api/tickets/*  → all ticket operations
//    /api/users/*    → user management
// ============================================================
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);

// ============================================================
// 8. ERROR HANDLING — must come LAST after all routes
// ============================================================
app.use(notFound);      // 404 for unmatched routes
app.use(errorHandler);  // Catches all thrown errors

export default app;
