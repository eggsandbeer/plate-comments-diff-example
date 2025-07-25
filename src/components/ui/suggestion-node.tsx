"use client";

import * as React from "react";

import type { TSuggestionText } from "platejs";
import type { PlateLeafProps } from "platejs/react";

import { cn } from "@/lib/utils";
import { PlateLeaf, useEditorPlugin, usePluginOption } from "platejs/react";
import { suggestionPlugin } from "@/components/editor/plugins/suggestion-kit";

export function SuggestionLeaf(props: PlateLeafProps<TSuggestionText>) {
  const { children, leaf } = props;

  const { api, setOption } = useEditorPlugin(suggestionPlugin);
  const hoverId = usePluginOption(suggestionPlugin, "hoverId");
  const activeId = usePluginOption(suggestionPlugin, "activeId");

  const currentId = api.suggestion.nodeId(leaf);
  const isActive = activeId === currentId;
  const isHover = hoverId === currentId;

  const suggestionDeletion = leaf.suggestionDeletion;
  const suggestionInsertion = leaf.suggestion;

  return (
    <PlateLeaf
      {...props}
      className={cn(
        suggestionDeletion &&
          "bg-destructive/20 text-destructive line-through decoration-destructive",
        suggestionInsertion && "bg-primary/20 text-primary",
        (isHover || isActive) && suggestionDeletion && "bg-destructive/30",
        (isHover || isActive) && suggestionInsertion && "bg-primary/30"
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

export function SuggestionLineBreak() {
  return <div className="h-0 w-full border-t border-primary/30" />;
}
