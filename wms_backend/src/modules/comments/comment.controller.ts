//  ============================================================
// src/modules/comments/comment.controller.ts
// ============================================================
// COMMENT CONTROLLER — thin HTTP layer for comment endpoints.
// Reads request → calls service → sends response.
// ============================================================

import { Request, Response, NextFunction } from "express";
import { fetchCommentsByTicket, postComment, removeComment } from "./comment.service";
import { ok } from "../../shared/utils/apiResponse";
import { AppError } from "../../shared/middleware/errorHandler";
import { supabase } from "../../config/supabase";

// ---- GET /api/tickets/:id/comments ----
export const getCommentsByTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comments = await fetchCommentsByTicket(req.params.id);
    res.status(200).json(ok({ comments, total: comments.length }));
  } catch (err) { next(err); }
};

// ---- POST /api/tickets/:id/comments ----
// Body: { content: string }
export const addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content } = req.body;
    if (!content) throw new AppError("Comment content is required.", 400);

    // Fetch the commenter's name for display
    const { data: author } = await supabase
      .from("users")
      .select("name")
      .eq("id", req.user!.userId)
      .single();

    const comment = await postComment(
      req.params.id,
      req.user!.userId,
      author?.name || req.user!.email,
      req.user!.role,
      content,
      req.user!.company_name
    );

    res.status(201).json(ok({ comment }, "Comment added."));
  } catch (err) { next(err); }
};

// ---- DELETE /api/comments/:commentId ----
export const deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await removeComment(req.params.commentId);
    res.status(200).json(ok(undefined, "Comment deleted."));
  } catch (err) { next(err); }
};
