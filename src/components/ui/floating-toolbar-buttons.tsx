"use client";

import * as React from "react";

import { useEditorReadOnly } from "platejs/react";

import { CommentToolbarButton } from "./comment-toolbar-button";
import { ToolbarGroup } from "./toolbar";

export function FloatingToolbarButtons() {
  const readOnly = useEditorReadOnly();

  if (readOnly) return null;

  return (
    <ToolbarGroup>
      <CommentToolbarButton />
    </ToolbarGroup>
  );
}
