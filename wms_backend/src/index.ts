// ============================================================
// src/index.ts — SERVER ENTRY POINT
// ============================================================
// This is the FIRST file that runs when you do: npm run dev
//
// It does only ONE thing:
//   Import the configured Express app and start listening on a port.
//
// All the middleware, routes, and config are set up in app.ts.
// This file just says "start the server and print a welcome message".
// ============================================================

import { env } from "./config/env"; // This also validates env vars at startup
import app from "./app";

// ---- Start the HTTP server ----
app.listen(env.PORT, () => {
  console.log("\n🚀 WMS Backend Server Started!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🌐 Server:       http://localhost:${env.PORT}`);
  console.log(`❤️  Health:       http://localhost:${env.PORT}/health`);
  console.log(`📋 Environment:  ${env.NODE_ENV}`);
  console.log(`🔗 Frontend:     ${env.FRONTEND_URL}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("📖 API Routes:");
  console.log("  POST   /api/auth/login");
  console.log("  GET    /api/auth/me");
  console.log("  GET    /api/tickets");
  console.log("  POST   /api/tickets");
  console.log("  GET    /api/tickets/:id");
  console.log("  PATCH  /api/tickets/:id/status");
  console.log("  PATCH  /api/tickets/:id/assign");
  console.log("  PATCH  /api/tickets/:id/escalate");
  console.log("  GET    /api/tickets/:id/comments");
  console.log("  POST   /api/tickets/:id/comments");
  console.log("  GET    /api/users");
  console.log("  GET    /api/users/engineers");
  console.log("  POST   /api/users");
  console.log("  PATCH  /api/users/:id");
  console.log("  DELETE /api/users/:id");
  console.log("\n✅ Ready for requests!\n");
});
