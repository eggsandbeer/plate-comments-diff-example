# Slate Editor Value Data Shape for Comments

## Overview

This document describes how comments are represented in the Slate editor value structure, including the leaf node format and the relationship between editor marks and comment data.

## Example

- **Live Demo**: [Plate Comments Example App](https://plate-comments-diff-example.vercel.app/)
- **Source Code**: [GitHub Repository](https://github.com/eggsandbeer/plate-comments-diff-example)
- **Data Structures**: [View example data in `/src/data`](https://github.com/eggsandbeer/plate-comments-diff-example/tree/main/src/data)

## Leaf Node Structure with Comments

When text has comments, the leaf nodes in the Slate editor value contain specific marks that identify the comment:

```typescript
// Basic leaf node with comment
{
  text: "some commented text",
  comment: true,                    // Indicates this text has a comment
  comment_discussion1: true         // Links to discussion with ID "discussion1"
}
```

### Comment Mark Detection

Comments are detected on leaf nodes through several patterns, handled by the `getDiscussionIdFromNode()` function:

1. **Standard Format**: `comment: true` + `comment_<discussionId>: true`
2. **Custom Format**: `comments_discussion_id: "discussionId"` (alternative format)
3. **Draft Comments**: Uses dynamic key from `getDraftCommentKey()` for temporary comments

The detection logic:

- First checks for custom format: `comments_discussion_id`
- Falls back to standard format: searches for keys starting with `comment_`
- Returns the discussion ID or `null` if no comment found

### Multiple Comments on Single Leaf Node

A single leaf node can have multiple overlapping comments by having multiple comment marks:

```typescript
// Leaf node with multiple overlapping comments
{
  text: "overlapping text",
  comment: true,
  comment_discussion1: true,    // First comment/discussion
  comment_discussion2: true,    // Second comment/discussion
  comment_discussion3: true     // Third comment/discussion
}
```

This allows multiple users to comment on the same piece of text, or the same user to create multiple discussion threads about the same content. Each comment mark links to its respective discussion in the discussion data.

### Complete Editor Value Example

```typescript
const editorValueWithComments = [
  {
    type: "p",
    children: [
      { text: "This page demonstrates " },
      {
        text: "comments", // This text is commented
        comment: true,
        comment_discussion1: true, // Belongs to discussion1
      },
      { text: " and suggestions." },
    ],
  },
  {
    type: "p",
    children: [
      { text: "Text with " },
      {
        text: "overlapping", // This text is also commented
        comment: true,
        comment_discussion2: true, // Belongs to discussion2
      },
      { text: " annotations." },
    ],
  },
];
```

## External Comments/Discussiuon Data Structures To Be Saved Outside Editor.

### TComment Interface

```typescript
interface TComment {
  id: string; // Unique comment identifier
  contentRich: Value; // Comment content as Slate Value (rich text)
  createdAt: Date; // When comment was created
  discussionId: string; // Which discussion this belongs to
  isEdited: boolean; // Whether comment has been edited
  userId: string; // Who created the comment
}
```

### TDiscussion Interface

- **Plate Discussion docs**: [Discussion](https://platejs.org/docs/discussion#tdiscussion)

```typescript
interface TDiscussion {
  id: string; // Unique discussion identifier (matches comment_<id>)
  comments: TComment[]; // Array of comments in this discussion
  createdAt: Date; // When discussion was started
  isResolved: boolean; // Whether discussion is resolved
  userId: string; // Who started the discussion
  documentContent?: string; // Optional excerpt of commented text
}
```

## How comment_discussion1 Links to Discussion Data

The connection between editor marks and discussion data works through ID matching:

### Editor Value Side

```typescript
{
  text: "comments",
  comment: true,
  comment_discussion1: true  // ← This creates the link
}
```

### Discussion Data Side (from discussion-data.ts)

```typescript
{
  id: "discussion1",         // ← This ID matches the mark suffix
  comments: [
    {
      id: "comment1",
      contentRich: [{ ... }],
      discussionId: "discussion1", // ← References back to parent discussion
      userId: "charlie",
      // ... other properties
    }
  ],
  createdAt: new Date(),
  isResolved: false,
  userId: "charlie",
  documentContent: "comments"  // ← Often stores the original text
}
```

### The Linking Process

1. **Mark Creation**: When a user adds a comment to selected text, the system:

   - Generates a unique discussion ID (e.g., "discussion1")
   - Applies the mark `comment_discussion1: true` to the selected leaf nodes
   - Creates a new discussion entry with `id: "discussion1"`

2. **Data Retrieval**: When rendering comments, the system:

   - Scans leaf nodes for marks starting with `comment_`
   - Extracts the discussion ID from the mark name (`comment_discussion1` → `"discussion1"`)
   - Looks up the discussion in the discussions array by matching the ID
   - Renders all comments belonging to that discussion

3. **Example Lookup Flow**:

   ```typescript
   // 1. Extract ID from leaf node
   const discussionId = getDiscussionIdFromNode(leafNode); // Returns "discussion1"

   // 2. Find matching discussion in data
   const discussion = discussionsData.find((d) => d.id === discussionId);

   // 3. Access all comments for this discussion
   const comments = discussion?.comments || [];
   ```

### Multiple Text Nodes, Single Discussion

When a comment spans multiple characters or words, multiple leaf nodes can reference the same discussion:

```typescript
// Editor value with multi-node comment
[
  { text: "The word ", comment: false },
  { text: "overlapping", comment: true, comment_discussion2: true },
  { text: " has comments", comment: false }
]

// All reference this single discussion:
{
  id: "discussion2",  // ← Single discussion for all marked nodes
  comments: [...],
  documentContent: "overlapping"
}
```

This design allows for flexible comment placement while maintaining a clean relationship between the visual editor marks and the underlying comment data structure.

## Diff Generation and Comment Filtering

When generating diffs between document versions, comment marks must be ignored to ensure that adding or removing comments doesn't affect the actual content comparison.

### The Problem

Without filtering, adding comments would create false diff results:

```typescript
// Version 1 - no comments
{ text: "important text" }

// Version 2 - same content but with comments
{ text: "important text", comment: true, comment_discussion1: true }

// Without filtering: This would show as a "change" even though content is identical
```

### The Solution: Dynamic Comment Filtering

The `computeDiffWithCommentFiltering()` function handles this by:

1. **Scanning both versions** to collect all comment-related properties
2. **Dynamic detection** of any property starting with `"comment"` (including `comment_<id>` suffixes)
3. **Ignoring these properties** during diff computation

Properties that get filtered out include:

- `comment: true` (base comment marker)
- `comment_discussion1: true` (specific discussion links)
- `comment_discussion2: true`, `comment_discussion3: true`, etc.
- `comment_<draftKey>: true` (draft comments with dynamic keys)

```typescript
export function computeDiffWithCommentFiltering(
  previous: Value,
  current: Value
) {
  // Dynamically collect all comment-related properties
  const commentProps = new Set<string>();

  const collectCommentProps = (nodes: unknown[]) => {
    nodes.forEach((node) => {
      if (node && typeof node === "object") {
        const nodeObj = node as Record<string, unknown>;
        // Collect any property that starts with "comment"
        // This captures: comment_discussion1, comment_discussion2, comment_<draftKey>, etc.
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
    ...Array.from(commentProps), // All comment_<id> suffixes found dynamically
  ];

  return computeDiff(previous, structuredClone(current), {
    ignoreProps: ignorePropsArray, // ← Key: ignore comment marks
  }) as Value;
}
```

### Why Dynamic Collection?

The system uses dynamic collection rather than a hardcoded list because:

- **New discussion IDs** are created constantly (`comment_discussion1`, `comment_discussion2`, etc.)
- **Multiple overlapping comments** can exist on the same text
- **Draft comments** use dynamic keys from `getDraftCommentKey()`
- **Custom formats** might use different property names

### Example: What Gets Ignored

```typescript
// Original leaf node with multiple comment marks
{
  text: "some text",
  comment: true,                    // ← Ignored
  comment_discussion1: true,        // ← Ignored
  comment_discussion2: true,        // ← Ignored
  comment_abc123def: true,          // ← Ignored (draft key)
  bold: true                        // ← NOT ignored (actual formatting)
}

// Effective leaf node for diff comparison
{
  text: "some text",
  bold: true                        // Only content formatting matters
}
```

This ensures that any comment-related property (following the `comment*` pattern) is automatically excluded from diff generation, keeping the focus on actual content changes rather than annotation metadata.
