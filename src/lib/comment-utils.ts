import type { NodeEntry, TText, Path } from "platejs";
import type { PlateEditor } from "platejs/react";
import { getDraftCommentKey } from "@platejs/comment";
import {
  format,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";

export function getDiscussionIdFromNode(node: TText): string | null {
  // Check for custom format first
  const customFormat = (node as TText & { comments_discussion_id?: string })
    .comments_discussion_id;
  if (customFormat) return customFormat;

  // Check for Plate's format as fallback
  const nodeRecord = node as Record<string, unknown>;
  for (const key in nodeRecord) {
    if (key.startsWith("comment_") && nodeRecord[key] === true) {
      return key.replace("comment_", "");
    }
  }

  return null;
}

export function hasComment(node: TText): boolean {
  return !!(node as TText & { comment?: boolean }).comment;
}

export function hasDraftComment(node: TText): boolean {
  const draftKey = getDraftCommentKey();
  return !!(node as Record<string, unknown>)[draftKey];
}

export function findCommentNodes(editor: PlateEditor, blockPath: Path) {
  const commentNodes: NodeEntry<TText>[] = [];

  try {
    // Find all text nodes with comment: true
    for (const [node, path] of editor.api.nodes({
      at: blockPath,
      match: (n): n is TText => "text" in n && hasComment(n as TText),
    })) {
      if ("text" in node) {
        commentNodes.push([node as TText, path]);
      }
    }
  } catch (error) {
    // Handle cases where editor isn't fully initialized
    console.warn("Error finding comment nodes:", error);
  }

  return commentNodes;
}

export function findDraftCommentNodes(editor: PlateEditor) {
  const draftNodes: NodeEntry<TText>[] = [];

  // Find all text nodes with the draft comment key
  for (const [node, path] of editor.api.nodes({
    at: [],
    match: (n): n is TText => "text" in n && hasDraftComment(n as TText),
  })) {
    if ("text" in node) {
      draftNodes.push([node as TText, path]);
    }
  }

  return draftNodes;
}

export const formatCommentDate = (date: Date) => {
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, date);
  const diffHours = differenceInHours(now, date);
  const diffDays = differenceInDays(now, date);

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }
  if (diffHours < 24) {
    return `${diffHours}h`;
  }
  if (diffDays < 2) {
    return `${diffDays}d`;
  }

  return format(date, "MM/dd/yyyy");
};
