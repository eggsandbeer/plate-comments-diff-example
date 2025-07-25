"use client";

import * as React from "react";

import { MessageSquareTextIcon } from "lucide-react";
import { useEditorRef } from "platejs/react";

import { commentPlugin } from "@/components/editor/plugins/comment-kit";
import { discussionPlugin } from "@/components/editor/plugins/discussion-kit";
import { getDraftCommentKey } from "@platejs/comment";

import { ToolbarButton } from "./toolbar";

export function CommentToolbarButton() {
  const editor = useEditorRef();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Store the current selection before any operations
      const currentSelection = editor.selection;

      if (!currentSelection) {
        return;
      }

      if (editor.api.isCollapsed()) {
        return;
      }

      // Ensure the selection is set before adding comment
      editor.tf.select(currentSelection);

      // Add the comment without calling focus to avoid DOM issues
      const commentTransforms = editor.getTransforms(commentPlugin).comment;
      commentTransforms.setDraft();

      // Set the commenting block to enable the modal
      const blockPath = currentSelection.anchor.path.slice(0, -1);
      editor.setOption(commentPlugin, "commentingBlock", blockPath);

      // Get the newly created draft comment key
      const draftCommentKey = getDraftCommentKey();

      if (draftCommentKey) {
        // Create a new discussion for this comment
        const discussions = editor.getOption(discussionPlugin, "discussions");

        // Remove any existing draft discussions to avoid duplicates
        const filteredDiscussions = discussions.filter(
          (d) => d.id !== draftCommentKey
        );

        const newDiscussion = {
          id: draftCommentKey,
          comments: [],
          createdAt: new Date(),
          isResolved: false,
          userId: editor.getOption(discussionPlugin, "currentUserId"),
          documentContent: editor.api.string(currentSelection),
        };

        // Add the new discussion to the filtered discussions data
        filteredDiscussions.push(newDiscussion);
        editor.setOption(discussionPlugin, "discussions", filteredDiscussions);

        // Set the comment as active to open the modal
        editor.setOption(commentPlugin, "activeId", draftCommentKey);
      }
    } catch (error) {
      // Try to recover by ensuring editor is in a good state
      try {
        editor.tf.deselect();
      } catch (recoverError) {
        // Recovery failed, but continue
      }
    }
  };

  return (
    <ToolbarButton
      onClick={handleClick}
      data-plate-prevent-overlay
      tooltip="Comment"
      onMouseDown={(e) => {
        // Prevent the button from stealing focus from the editor
        e.preventDefault();
      }}
    >
      <MessageSquareTextIcon />
    </ToolbarButton>
  );
}
