"use client";

import * as React from "react";
import {
  type DiffOperation,
  type DiffUpdate,
  computeDiff,
  withGetFragmentExcludeDiff,
} from "@platejs/diff";
// Removed lodash dependency - using structuredClone instead
import { type Value, createSlatePlugin } from "platejs";
import { createPlatePlugin, toPlatePlugin } from "platejs/react";
import {
  type PlateElementProps,
  type PlateLeafProps,
  createPlateEditor,
  Plate,
  PlateContent,
  PlateElement,
  PlateLeaf,
  usePlateEditor,
} from "platejs/react";

import { cn } from "@/lib/utils";

const diffOperationColors: Record<DiffOperation["type"], string> = {
  delete: "bg-red-200 text-red-800",
  insert: "bg-green-200 text-green-800",
  update: "bg-blue-200 text-blue-800",
};

const describeUpdate = ({ newProperties, properties }: DiffUpdate) => {
  const addedProps: string[] = [];
  const removedProps: string[] = [];
  const updatedProps: string[] = [];

  Object.keys(newProperties).forEach((key) => {
    const oldValue = properties[key];
    const newValue = newProperties[key];

    if (oldValue === undefined) {
      addedProps.push(key);
      return;
    }
    if (newValue === undefined) {
      removedProps.push(key);
      return;
    }

    updatedProps.push(key);
  });

  const descriptionParts = [];

  if (addedProps.length > 0) {
    descriptionParts.push(`Added ${addedProps.join(", ")}`);
  }
  if (removedProps.length > 0) {
    descriptionParts.push(`Removed ${removedProps.join(", ")}`);
  }
  if (updatedProps.length > 0) {
    updatedProps.forEach((key) => {
      descriptionParts.push(
        `Updated ${key} from ${properties[key]} to ${newProperties[key]}`
      );
    });
  }

  return descriptionParts.join("\n");
};

const DiffPlugin = toPlatePlugin(
  createSlatePlugin({
    key: "diff",
    node: { isLeaf: true },
  }).overrideEditor(withGetFragmentExcludeDiff),
  {
    render: {
      node: DiffLeaf,
      // Remove aboveNodes to prevent element-level highlighting
      // This should make diff only highlight at the text/leaf level
    },
  }
);

function DiffLeaf({ children, ...props }: PlateLeafProps) {
  const diffOperation = props.leaf.diffOperation as DiffOperation;

  // If no diff operation, render normally
  if (!diffOperation) {
    return <PlateLeaf {...props}>{children}</PlateLeaf>;
  }

  return (
    <PlateLeaf
      {...props}
      className={cn(props.className, diffOperationColors[diffOperation.type])}
      attributes={{
        ...props.attributes,
        title:
          diffOperation.type === "update"
            ? describeUpdate(diffOperation)
            : undefined,
      }}
    >
      {children}
    </PlateLeaf>
  );
}

interface DiffEditorProps {
  current: Value;
  previous: Value;
}

// Shared function to compute diff with dynamic comment prop filtering
export function computeDiffWithCommentFiltering(
  previous: Value,
  current: Value
) {
  const editor = createPlateEditor({
    plugins: [DiffPlugin],
  });

  // Dynamically collect all comment-related properties from both previous and current content
  const commentProps = new Set<string>();

  const collectCommentProps = (nodes: unknown[]) => {
    nodes.forEach((node) => {
      if (node && typeof node === "object") {
        const nodeObj = node as Record<string, unknown>;
        if (nodeObj.children && Array.isArray(nodeObj.children)) {
          collectCommentProps(nodeObj.children);
        }
        // Collect any property that starts with "comment"
        Object.keys(nodeObj).forEach((key) => {
          if (key.startsWith("comment")) {
            commentProps.add(key);
          }
        });
      }
    });
  };

  collectCommentProps(previous);
  collectCommentProps(current);

  const ignorePropsArray = [
    "id",
    ...Array.from(commentProps), // Add all dynamically found comment properties
  ];

  return computeDiff(previous, structuredClone(current), {
    isInline: editor.api.isInline,
    lineBreakChar: "¶",
    ignoreProps: ignorePropsArray,
  }) as Value;
}

export function DiffEditor({ current, previous }: DiffEditorProps) {
  const diffValue = React.useMemo(() => {
    const result = computeDiffWithCommentFiltering(previous, current);
    return result;
  }, [previous, current]);

  const editor = usePlateEditor(
    {
      plugins: [DiffPlugin],
      value: diffValue,
    },
    [diffValue]
  );

  // Create a key based on the diff value to force complete reset
  const resetKey = React.useMemo(() => {
    return JSON.stringify(diffValue);
  }, [diffValue]);

  return (
    <Plate key={resetKey} editor={editor}>
      <PlateContent className="py-1 pr-10" readOnly />
    </Plate>
  );
}
