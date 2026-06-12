export type MessageRole = "user" | "agent";

export type AgentAttachment = {
  name: string;
  type: "image" | "document";
  fileId?: string;
  previewUrl?: string;
};

export type AgentMessage = {
  id: string;
  role: MessageRole;
  content: string;
  attachments?: AgentAttachment[];
  timestamp: string;
  loading?: boolean;
};
