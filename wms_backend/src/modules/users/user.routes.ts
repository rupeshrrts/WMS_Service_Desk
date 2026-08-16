// ============================================================
// src/modules/users/user.routes.ts
// ============================================================
// User management URL endpoints.
//
//   GET    /api/users                  → All users (wms_admin only)
//   GET    /api/users/company          → Users in caller's company (client_admin only)
//   GET    /api/users/engineers        → Engineers list (wms roles)
//   GET    /api/users/:id              → One user (self or admin)
//   POST   /api/users                  → Create user (wms_admin or client_admin)
//   PATCH  /api/users/:id              → Update user (wms_admin only)
//   PATCH  /api/users/:id/toggle-active → Enable/disable account (admin + client_admin)
//   DELETE /api/users/:id              → Delete user (wms_admin only)
//
// ⚠️  Static routes (/engineers, /company) MUST come before /:id!
// ============================================================

import { Router } from "express";
import {
  getAllUsers,
  getCompanyUsers,
  getEngineers,
  getUserById,
  createUser,
  updateUser,
  toggleActive,
  deleteUser,
} from "./user.controller";
import { protect, authorize } from "../../shared/middleware/auth";

const router = Router();

// ⚠️ Static routes MUST come before /:id — order matters in Express!
router.get("/engineers", protect, authorize("super_admin", "wms_admin", "wms_senior_engineer", "wms_engineer"), getEngineers);
router.get("/company",   protect, authorize("client_admin"), getCompanyUsers);

router.get("/",    protect, authorize("super_admin", "wms_admin", "wms_senior_engineer"), getAllUsers);
router.get("/:id", protect, getUserById);

router.post("/", protect, authorize("super_admin", "wms_admin", "wms_senior_engineer", "client_admin"), createUser);

router.patch("/:id/toggle-active", protect, authorize("super_admin", "wms_admin", "wms_senior_engineer", "client_admin"), toggleActive);
router.patch("/:id",               protect, authorize("super_admin", "wms_admin"), updateUser);

router.delete("/:id", protect, authorize("super_admin"), deleteUser);

export default router;
