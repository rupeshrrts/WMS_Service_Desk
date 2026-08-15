// ============================================================
// src/modules/comments/comment.service.ts
// ============================================================
// COMMENT SERVICE — database logic for comments.
//
// Comments are activity logs on tickets. They can be:
//   - User messages    ("I've started investigating")
//   - Status updates   (auto-logged when status changes)
//   - Engineer notes   ("Replaced sensor, testing now")
//   - System messages  (auto-logged on ticket creation)
// ============================================================

import { supabase } from "../../config/supabase";
import { AppError } from "../../shared/middleware/errorHandler";
import { Comment, Role } from "../../shared/types";
import { CONSTANTS } from "../../config/constants";
import { generateCommentId } from "../../shared/utils/helpers";

// ---- fetchCommentsByTicket ----
// Returns all comments for a ticket sorted oldest → newest
// (so you read the conversation from top to bottom)
export const fetchCommentsByTicket = async (ticketId: string): Promise<Comment[]> => {
  // First check the ticket exists
  const { data: ticket, error: ticketErr } = await supabase
    .from("tickets")
    .select("id")
    .eq("id", ticketId)
    .single();

  if (ticketErr || !ticket) throw new AppError(`Ticket not found: ${ticketId}`, 404);

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true }); // oldest first

  if (error) throw new AppError(`Failed to fetch comments: ${error.message}`, 500);

  return (data || []) as Comment[];
};

// ---- postComment ----
// Adds a new comment to a ticket.
// Also "touches" the ticket's updated_at so it shows recent activity.
//
// Access rules:
//   - Customers can only comment on their own tickets
//   - Engineers and admins can comment on any ticket
export const postComment = async (
  ticketId: string,
  authorId: string,
  authorName: string,
  authorRole: Role,
  content: string,
  companyName: string | null
): Promise<Comment> => {
  // Validate content
  if (!content.trim()) throw new AppError("Comment cannot be empty.", 400);
  if (content.trim().length > CONSTANTS.MAX_COMMENT_LENGTH) {
    throw new AppError(`Comment too long. Max ${CONSTANTS.MAX_COMMENT_LENGTH} characters.`, 400);
  }

  // Fetch the ticket to check access
  const { data: ticket, error: ticketErr } = await supabase
    .from("tickets")
    .select("id, created_by, company_name")
    .eq("id", ticketId)
    .single();

  if (ticketErr || !ticket) throw new AppError(`Ticket not found: ${ticketId}`, 404);

  // Clients can only comment on their own/company tickets
  if (authorRole === "client_operator" && ticket.created_by !== authorId) {
    throw new AppError("You can only comment on your own tickets.", 403);
  }
  if (authorRole === "client_admin" && ticket.company_name !== companyName) {
    throw new AppError("You can only comment on tickets from your company.", 403);
  }

  const now = new Date().toISOString();

  const newComment = {
    id: generateCommentId(),
    ticket_id: ticketId,
    author_id: authorId,
    author_name: authorName,
    author_role: authorRole,
    content: content.trim(),
    created_at: now,
  };

  const { data, error } = await supabase
    .from("comments")
    .insert(newComment)
    .select()
    .single();

  if (error) throw new AppError(`Failed to add comment: ${error.message}`, 500);

  // Touch the ticket's updated_at so it appears active in listings
  await supabase.from("tickets").update({ updated_at: now }).eq("id", ticketId);

  return data as Comment;
};

// ---- removeComment ----
// Permanently deletes a comment. Admin only.
export const removeComment = async (commentId: string): Promise<void> => {
  const { data, error: fetchErr } = await supabase
    .from("comments")
    .select("id")
    .eq("id", commentId)
    .single();

  if (fetchErr || !data) throw new AppError(`Comment not found: ${commentId}`, 404);

  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw new AppError(`Failed to delete comment: ${error.message}`, 500);
};
