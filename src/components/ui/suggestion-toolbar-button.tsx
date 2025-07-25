"use client";

import * as React from "react";

import { PencilLineIcon } from "lucide-react";
import { useEditorRef } from "platejs/react";

import { suggestionPlugin } from "@/components/editor/plugins/suggestion-kit";

import { ToolbarButton } from "./toolbar";

export function SuggestionToolbarButton() {
  const editor = useEditorRef();
  const handleClick = () => {};

  return (
    <ToolbarButton onClick={handleClick} tooltip="Suggestion">
      <PencilLineIcon />
    </ToolbarButton>
  );
}
