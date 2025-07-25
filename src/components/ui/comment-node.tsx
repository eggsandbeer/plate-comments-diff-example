"use client";

import * as React from "react";

import type { TCommentText } from "platejs";
import type { PlateLeafProps } from "platejs/react";

import { PlateLeaf, useEditorPlugin, usePluginOption } from "platejs/react";

import { cn } from "@/lib/utils";
import { commentPlugin } from "@/components/editor/plugins/comment-kit";
import { getDiscussionIdFromNode } from "@/lib/comment-utils";

export function CommentLeaf(props: PlateLeafProps<TCommentText>) {
  const { children, leaf } = props;

  const { setOption } = useEditorPlugin(commentPlugin);
  const hoverId = usePluginOption(commentPlugin, "hoverId");
  const activeId = usePluginOption(commentPlugin, "activeId");

  const isOverlapping = false; // Simplified to avoid Plate's getCommentCount
  const currentId = getDiscussionIdFromNode(leaf);
  const isActive = activeId === currentId;
  const isHover = hoverId === currentId;

  return (
    <PlateLeaf
      {...props}
      className={cn(
        "border-b-2 border-b-highlight/[.36] bg-highlight/[.13] transition-colors duration-200",
        (isHover || isActive) && "border-b-highlight bg-highlight/25",
        isOverlapping && "border-b-2 border-b-highlight/[.7] bg-highlight/25",
        (isHover || isActive) &&
          isOverlapping &&
          "border-b-highlight bg-highlight/45"
      )}
      attributes={{
        ...props.attributes,
        onClick: () => setOption("activeId", currentId ?? null),
        onMouseEnter: () => setOption("hoverId", currentId ?? null),
        onMouseLeave: () => setOption("hoverId", null),
      }}
    >
      {children}
    </PlateLeaf>
  );
}
