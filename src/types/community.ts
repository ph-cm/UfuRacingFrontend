export type ChatMessage = {
  id: string;
  authorId: number;
  authorName: string;
  authorPhotoUrl?: string | null;
  content: string;
  createdAt: string;
};

export type DMConversation = {
  memberId: number;
  memberName: string;
  memberPhotoUrl?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unread: number;
};

export type OnlineMember = {
  memberId: number;
  online: boolean;
  lastSeen?: string | null;
};
