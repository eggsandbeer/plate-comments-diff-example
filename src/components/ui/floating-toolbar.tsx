"use client";

import * as React from "react";

import {
  type FloatingToolbarState,
  flip,
  offset,
  useFloatingToolbar,
  useFloatingToolbarState,
} from "@platejs/floating";
import { useComposedRef } from "@udecode/cn";
import { KEYS } from "platejs";
import {
  useEditorId,
  useEventEditorValue,
  usePluginOption,
} from "platejs/react";

import { cn } from "@/lib/utils";

import { Toolbar } from "./toolbar";

function getSelectionCoordinates() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  return {
    top: rect.top, // Use viewport coordinates directly
    left: rect.left, // Use viewport coordinates directly
    width: rect.width,
    height: rect.height,
  };
}

export function FloatingToolbar({
  children,
  className,
  state,
  ...props
}: React.ComponentProps<typeof Toolbar> & {
  state?: FloatingToolbarState;
}) {
  const editorId = useEditorId();
  const focusedEditorId = useEventEditorValue("focus");
  const isFloatingLinkOpen = !!usePluginOption({ key: KEYS.link }, "mode");
  const isAIChatOpen = usePluginOption({ key: KEYS.aiChat }, "open");

  const floatingToolbarState = useFloatingToolbarState({
    editorId,
    focusedEditorId,
    hideToolbar: isFloatingLinkOpen || isAIChatOpen,
    ...state,
    floatingOptions: {
      middleware: [
        offset(12),
        flip({
          fallbackPlacements: [
            "top-start",
            "top-end",
            "bottom-start",
            "bottom-end",
          ],
          padding: 12,
        }),
      ],
      placement: "top",
      ...state?.floatingOptions,
    },
  });

  const {
    clickOutsideRef,
    hidden,
    props: rootProps,
    ref: floatingRef,
  } = useFloatingToolbar(floatingToolbarState);

  const ref = useComposedRef<HTMLDivElement>(props.ref, floatingRef);

  if (hidden) return null;

  // Get proper selection coordinates
  const selectionCoords = getSelectionCoordinates();

  // Use selection-based positioning if available
  const finalStyle = selectionCoords
    ? {
        position: "fixed" as const, // Use fixed positioning relative to viewport
        top: selectionCoords.top - 50, // Position above the selection
        left: selectionCoords.left + selectionCoords.width / 2, // Center horizontally
        transform: "translateX(-50%)", // Center the toolbar
        zIndex: 50,
      }
    : {
        // Fallback positioning
        position: "fixed" as const,
        top: "100px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
      };

  return (
    <div ref={clickOutsideRef}>
      <Toolbar
        {...props}
        {...rootProps}
        ref={ref}
        className={cn(
          "absolute z-50 scrollbar-hide overflow-x-auto rounded-md border bg-popover p-1 whitespace-nowrap opacity-100 shadow-md print:hidden",
          "max-w-[80vw]",
          className
        )}
        style={finalStyle}
      >
        {children}
      </Toolbar>
    </div>
  );
}
