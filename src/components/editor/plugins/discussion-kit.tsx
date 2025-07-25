"use client";

import type { TComment } from "@/components/ui/comment";

import { createPlatePlugin } from "platejs/react";

import { BlockDiscussion } from "@/components/ui/block-discussion";
import { usersData } from "@/data/users";
import { discussionsData } from "@/data/discussion-data";

export interface TDiscussion {
  id: string;
  comments: TComment[];
  createdAt: Date;
  isResolved: boolean;
  userId: string;
  documentContent?: string;
}

// This plugin is purely UI. It's only used to store the discussions and users data
export const discussionPlugin = createPlatePlugin({
  key: "discussion",
  options: {
    currentUserId: "cam",
    discussions: discussionsData,
    users: usersData,
  },
})
  .configure({
    render: { aboveNodes: BlockDiscussion },
  })
  .extendSelectors(({ getOption }) => ({
    currentUser: () => getOption("users")[getOption("currentUserId")],
    user: (id: string) => getOption("users")[id],
  }));

export const DiscussionKit = [discussionPlugin];
