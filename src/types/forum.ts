export type ForumThread = {
  id: number;
  title: string;
  category: string;
  content: string;
  authorId: number;
  authorName: string;
  authorPhotoUrl?: string | null;
  createdAt: string;
  replyCount: number;
  lastReplyAt?: string | null;
  pinned?: boolean;
};

export type ForumPost = {
  id: number;
  threadId: number;
  authorId: number;
  authorName: string;
  authorPhotoUrl?: string | null;
  content: string;
  createdAt: string;
};

export const FORUM_CATEGORIES = [
  "Geral",
  "Técnico",
  "Competição",
  "Logística",
  "Reuniões",
] as const;

export type ForumCategory = (typeof FORUM_CATEGORIES)[number];
