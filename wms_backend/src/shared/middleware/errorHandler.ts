// ============================================================
// src/shared/middleware/errorHandler.ts
// ============================================================
// Global error handling for the entire application.
//
// How errors flow in Express:
//   Controller throws error
//     → Express catches it
//       → Passes it to this handler
//         → We send a clean JSON response
//
// Without this, Express would send an ugly HTML error page
// instead of a JSON response, which breaks the frontend.
// ============================================================

import { Request, Response, NextFunction } from "express";
import { env } from "../../config/env";
import { fail } from "../utils/apiResponse";

// ---- Custom Application Error ----
// Throw this anywhere in services/controllers to send a specific
// HTTP status code with a custom message.
//
// Examples:
//   throw new AppError("Ticket not found", 404)
//   throw new AppError("Access denied", 403)
//   throw new AppError("Missing required fields", 400)
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";

    // Needed for proper instanceof checks in TypeScript
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ---- 404 Not Found Middleware ----
// Called when no route matches the incoming request.
// Place this AFTER all routes in app.ts.
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// ---- Global Error Handler Middleware ----
// Express identifies this as an error handler because it has 4 parameters.
// Place this LAST in app.ts, after notFound.
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  // Always log to server console for debugging
  console.error(
    `❌ [${new Date().toISOString()}] ${req.method} ${req.path} → ${statusCode}: ${err.message}`
  );

  // In production: hide raw 500 server error details from client (security)
  // In development: show the real error so you can debug it
  const message =
    statusCode === 500 && env.isProd
      ? "An internal server error occurred. Please try again."
      : err.message;

  res.status(statusCode).json(fail(message));
};
