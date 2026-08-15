// ============================================================
// src/modules/tickets/attachment.controller.ts
// ============================================================
import { Request, Response, NextFunction } from "express";
import { supabase } from "../../config/supabase";
import { AppError } from "../../shared/middleware/errorHandler";
import { ok } from "../../shared/utils/apiResponse";
import { v4 as uuidv4 } from "uuid";

// ---- POST /api/tickets/:id/attachments ----
// Upload a file and link it to a ticket
export const uploadAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: ticketId } = req.params;
    const { userId, role } = req.user!;
    const file = req.file;

    if (!file) {
      throw new AppError("No file provided.", 400);
    }

    // Verify ticket exists and user has access
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("id, company_name")
      .eq("id", ticketId)
      .maybeSingle();

    if (ticketError || !ticket) {
      throw new AppError("Ticket not found.", 404);
    }

    // Upload to Supabase Storage
    const fileExt = file.originalname.split(".").pop();
    const storageKey = `${ticketId}/${uuidv4()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("ticket-attachments")
      .upload(storageKey, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new AppError(`File upload failed: ${uploadError.message}`, 500);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("ticket-attachments")
      .getPublicUrl(storageKey);

    const fileUrl = publicUrlData.publicUrl;

    // Get uploader name
    const { data: uploader } = await supabase
      .from("users")
      .select("name")
      .eq("id", userId)
      .maybeSingle();

    // Save attachment record to DB
    const attachmentId = `att-${uuidv4().split("-")[0]}`;
    const { data: attachment, error: dbError } = await supabase
      .from("ticket_attachments")
      .insert({
        id: attachmentId,
        ticket_id: ticketId,
        file_name: file.originalname,
        file_url: fileUrl,
        file_type: file.mimetype,
        file_size: file.size,
        uploaded_by_id: userId,
        uploaded_by_name: uploader?.name || "Unknown",
      })
      .select()
      .single();

    if (dbError) {
      throw new AppError("Failed to save attachment record.", 500);
    }

    res.status(201).json(ok({ attachment }, "File uploaded successfully."));
  } catch (err) {
    next(err);
  }
};

// ---- GET /api/tickets/:id/attachments ----
// Get all attachments for a ticket
export const getAttachments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: ticketId } = req.params;

    const { data: attachments, error } = await supabase
      .from("ticket_attachments")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new AppError("Failed to fetch attachments.", 500);
    }

    res.status(200).json(ok({ attachments: attachments || [] }));
  } catch (err) {
    next(err);
  }
};
