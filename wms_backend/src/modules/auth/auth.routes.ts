// ============================================================
// src/modules/auth/auth.routes.ts
// ============================================================
// Auth routes — maps URLs to controller functions.
//
// Public:   POST /api/auth/login
// Protected: GET /api/auth/me, POST /api/auth/logout
// ============================================================

import { Router } from "express";
import { login, getMe, logout } from "./auth.controller";
import { protect } from "../../shared/middleware/auth";

const router = Router();

router.post("/login", login);

router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
