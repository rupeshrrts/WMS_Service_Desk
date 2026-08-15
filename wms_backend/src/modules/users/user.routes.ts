// ============================================================
// src/modules/users/user.routes.ts
// ============================================================
// User management URL endpoints.
//
//   GET    /api/users             → All users (admin only)
//   GET    /api/users/engineers   → Engineers list (admin + engineer)
//   GET    /api/users/:id         → One user (self or admin)
//   POST   /api/users             → Create user (admin only)
//   PATCH  /api/users/:id         → Update user (admin only)
//   DELETE /api/users/:id         → Delete user (admin only)
//
// ⚠️  /engineers MUST come before /:id in the route list!
//     Otherwise Express thinks "engineers" is an :id value.
// ============================================================

import { Router } from "express";
import {
  getAllUsers,
  getEngineers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./user.controller";
import { protect, authorize } from "../../shared/middleware/auth";

const router = Router();

// ⚠️ This route MUST be before /:id — order matters in Express!
router.get("/engineers", protect, authorize("wms_admin", "wms_senior_engineer", "wms_engineer"), getEngineers);

router.get("/", protect, authorize("wms_admin"), getAllUsers);
router.get("/:id", protect, getUserById);
router.post("/", protect, authorize("wms_admin"), createUser);
router.patch("/:id", protect, authorize("wms_admin"), updateUser);
router.delete("/:id", protect, authorize("wms_admin"), deleteUser);

export default router;
