// ============================================================
// src/modules/companies/company.routes.ts
// ============================================================
// Company management URL endpoints (WMS Admin only).
//
//   GET    /api/companies           → All companies
//   GET    /api/companies/:id       → One company
//   GET    /api/companies/:id/users → Users in a company
//   POST   /api/companies           → Create new company
//   PATCH  /api/companies/:id       → Update / toggle active
// ============================================================

import { Router } from "express";
import {
  getAllCompanies,
  getCompanyById,
  getCompanyUsers,
  createCompany,
  updateCompany,
} from "./company.controller";
import { protect, authorize } from "../../shared/middleware/auth";

const router = Router();

// All company routes are super_admin & wms_admin
router.get("/",              protect, authorize("super_admin", "wms_admin"), getAllCompanies);
router.get("/:id",           protect, authorize("super_admin", "wms_admin"), getCompanyById);
router.get("/:id/users",     protect, authorize("super_admin", "wms_admin"), getCompanyUsers);
router.post("/",             protect, authorize("super_admin", "wms_admin"), createCompany);
router.patch("/:id",         protect, authorize("super_admin", "wms_admin"), updateCompany);

export default router;
