"use client";

import * as React from "react";

import { Plate, usePlateEditor } from "platejs/react";

import { DiscussionKit } from "@/components/editor/plugins/discussion-kit";
import { CommentKit } from "@/components/editor/plugins/comment-kit";
import { SuggestionKit } from "@/components/editor/plugins/suggestion-kit";
import { FloatingToolbarKit } from "@/components/editor/plugins/floating-toolbar-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import {
  DiffEditor,
  computeDiffWithCommentFiltering,
} from "@/components/ui/diff-editor";
import { CommentsSidebar } from "@/components/ui/comments-sidebar";
import { discussionValue } from "@/data/editor-data";

export default function Home() {
  const [value, setValue] = React.useState(discussionValue);

  const editor = usePlateEditor({
    plugins: [
      ...CommentKit,
      ...SuggestionKit,
      ...DiscussionKit,
      ...FloatingToolbarKit,
    ],
    value: discussionValue,
  });

  const computedDiff = React.useMemo(() => {
    return computeDiffWithCommentFiltering(discussionValue, value);
  }, [value]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-[2000px]">
        <h1 className="mb-6 text-3xl font-bold text-center">
          Plate Comments & Discussion & Diff Demo
        </h1>

        <div className="mb-6 text-sm text-muted-foreground text-center space-y-1">
          <p>• Select text to see the floating comment toolbar</p>
          <p>• Click existing highlighted comments to view discussions</p>
          <p>• Use Cmd+Shift+M to add comments via keyboard</p>
        </div>

        <Plate editor={editor} onChange={({ value }) => setValue(value)}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 border rounded-lg bg-card shadow-sm min-w-0">
              <div className="flex">
                <div className="flex-1 min-w-0">
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-3">Editor</h2>
                    <EditorContainer>
                      <Editor variant="none" className="py-1" />
                    </EditorContainer>
                  </div>

                  <div className="p-4 border-t bg-muted/20">
                    <h3 className="text-sm font-semibold mb-2">
                      Editor Children JSON
                    </h3>
                    <pre className="text-xs bg-muted p-2 rounded font-mono whitespace-pre-wrap break-words">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  </div>
                </div>
                <CommentsSidebar />
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-card shadow-sm min-w-0">
              <h2 className="text-lg font-semibold mb-3">
                Changes from Original
              </h2>
              <DiffEditor current={value} previous={discussionValue} />
            </div>

            <div className="border rounded-lg p-4 bg-card shadow-sm min-w-0">
              <h2 className="text-lg font-semibold mb-3">Computed Diff</h2>
              <pre className="text-xs bg-muted p-1 rounded font-mono whitespace-pre-wrap break-words">
                {JSON.stringify(computedDiff, null, 2)}
              </pre>
            </div>
          </div>
        </Plate>
      </div>
    </div>
  );
}
