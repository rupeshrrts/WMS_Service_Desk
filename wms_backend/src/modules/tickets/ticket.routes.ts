import { Router } from "express";
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  assignTicket,
  escalateTicket,
  deleteTicket,
} from "./ticket.controller";
import { getCommentsByTicket, addComment }  from "../comments/comment.controller";
import { uploadAttachment, getAttachments } from "./attachment.controller";
import { protect, authorize } from "../../shared/middleware/auth";
import multer from "multer";

const router = Router();

// Multer config: store in memory, max 10MB, allow common file types
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "application/pdf",
      "text/plain", "text/csv",
      "application/json",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed. Use images, PDF, or text files."));
    }
  },
});

// -------------------------------------------------------
// TICKET CRUD
// -------------------------------------------------------

// GET /api/tickets
router.get("/", protect, getAllTickets);

// GET /api/tickets/:id
router.get("/:id", protect, getTicketById);

// POST /api/tickets
router.post("/", protect, authorize("client_operator", "client_admin", "wms_admin"), createTicket);

// DELETE /api/tickets/:id
router.delete("/:id", protect, authorize("wms_admin"), deleteTicket);

// -------------------------------------------------------
// TICKET ACTIONS
// -------------------------------------------------------

// PATCH /api/tickets/:id/status
router.patch("/:id/status", protect, authorize("wms_engineer", "wms_senior_engineer", "wms_admin", "client_operator", "client_admin"), updateTicketStatus);

// PATCH /api/tickets/:id/assign
router.patch("/:id/assign", protect, authorize("wms_admin", "wms_senior_engineer"), assignTicket);

// PATCH /api/tickets/:id/escalate
router.patch("/:id/escalate", protect, authorize("wms_engineer", "wms_admin"), escalateTicket);

// -------------------------------------------------------
// ATTACHMENTS
// -------------------------------------------------------

// GET /api/tickets/:id/attachments — all logged-in users
router.get("/:id/attachments", protect, getAttachments);

// POST /api/tickets/:id/attachments — clients and admins can upload
router.post(
  "/:id/attachments",
  protect,
  authorize("client_operator", "client_admin", "wms_admin", "wms_engineer", "wms_senior_engineer"),
  upload.single("file"),
  uploadAttachment
);

// -------------------------------------------------------
// COMMENTS (nested under tickets)
// -------------------------------------------------------

// GET /api/tickets/:id/comments
router.get("/:id/comments", protect, getCommentsByTicket);

// POST /api/tickets/:id/comments
router.post("/:id/comments", protect, addComment);

export default router;
