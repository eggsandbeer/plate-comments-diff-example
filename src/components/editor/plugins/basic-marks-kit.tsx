"use client";

import { HighlightPlugin } from "@platejs/basic-nodes/react";

import { HighlightLeaf } from "@/components/ui/highlight-node";

export const BasicMarksKit = [
  HighlightPlugin.configure({
    node: { component: HighlightLeaf },
    shortcuts: { toggle: { keys: "mod+shift+h" } },
  }),
];
