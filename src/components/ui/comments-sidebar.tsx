"use client";

import * as React from "react";
import { usePluginOption } from "platejs/react";
import type { TElement } from "platejs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { discussionPlugin } from "@/components/editor/plugins/discussion-kit";
import { formatCommentDate } from "@/lib/comment-utils";
import type { TComment } from "./comment";
import { CommentCreateForm } from "./comment";

export function CommentsSidebar() {
  const discussions = usePluginOption(discussionPlugin, "discussions");

  // Filter out resolved discussions, empty discussions, and sort by creation date
  const activeDiscussions = discussions
    .filter(
      (discussion) => !discussion.isResolved && discussion.comments.length > 0
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  if (activeDiscussions.length === 0) {
    return (
      <div className="w-80 border-l bg-muted/30 p-4">
        <h2 className="text-lg font-semibold mb-4">Comments</h2>
        <p className="text-muted-foreground text-sm">No active comments yet.</p>
      </div>
    );
  }

  return (
    <div className="w-80 border-l bg-muted/30 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">
        Comments ({activeDiscussions.length})
      </h2>

      <div className="space-y-6">
        {activeDiscussions.map((discussion) => (
          <div
            key={discussion.id}
            className="bg-background rounded-lg p-4 shadow-sm"
          >
            {/* Document content context */}
            {discussion.documentContent && (
              <div className="mb-3 p-2 bg-muted/50 rounded text-sm">
                <span className="text-muted-foreground">On: </span>
                <span className="font-medium">
                  &quot;{discussion.documentContent}&quot;
                </span>
              </div>
            )}

            {/* Comments thread */}
            <div className="space-y-3">
              {discussion.comments.map((comment, index) => (
                <CommentSidebarItem key={comment.id} comment={comment} />
              ))}
            </div>

            {/* Add comment form */}
            <div className="mt-4 pt-3 border-t border-muted/30">
              <CommentCreateForm discussionId={discussion.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommentSidebarItem({ comment }: { comment: TComment }) {
  const userInfo = usePluginOption(discussionPlugin, "user", comment.userId);

  return (
    <div className="flex gap-3">
      <Avatar className="size-6 mt-0.5">
        <AvatarImage alt={userInfo?.name} src={userInfo?.avatarUrl} />
        <AvatarFallback className="text-xs">
          {userInfo?.name?.[0]}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{userInfo?.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatCommentDate(new Date(comment.createdAt))}
          </span>
          {comment.isEdited && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
        </div>

        <div className="text-sm text-foreground/90">
          {/* Render rich content as plain text for now */}
          {comment.contentRich.map((node: TElement, nodeIndex: number) => (
            <p key={nodeIndex} className="mb-1 last:mb-0">
              {node.children
                ?.map((child) => ("text" in child ? child.text : ""))
                .join("") || ""}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
