import type { ChatMessage, DMConversation, OnlineMember } from "@/types/community";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function asJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return JSON.parse(text) as T;
}

function authH(token: string): Record<string, string> {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function normalizeMsg(raw: any): ChatMessage {
  return {
    id: String(raw.id ?? raw.message_id ?? crypto.randomUUID()),
    authorId: Number(raw.author_id ?? raw.authorId ?? 0),
    authorName: raw.author_name ?? raw.authorName ?? "Membro",
    authorPhotoUrl: raw.author_photo_url ?? raw.authorPhotoUrl ?? null,
    content: raw.content ?? raw.body ?? "",
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
  };
}

function normalizeDM(raw: any): DMConversation {
  return {
    memberId: Number(raw.member_id ?? raw.memberId ?? 0),
    memberName: raw.member_name ?? raw.memberName ?? "Membro",
    memberPhotoUrl: raw.member_photo_url ?? raw.memberPhotoUrl ?? null,
    lastMessage: raw.last_message ?? raw.lastMessage ?? null,
    lastMessageAt: raw.last_message_at ?? raw.lastMessageAt ?? null,
    unread: Number(raw.unread ?? 0),
  };
}

// ── Online presence ───────────────────────────────────────────────────────────

export async function getOnlineMembers(token: string): Promise<OnlineMember[]> {
  const res = await fetch(`${API_URL}/community/online`, { headers: authH(token) });
  const data = await asJson<any[]>(res);
  return (data ?? []).map((raw: any) => ({
    memberId: Number(raw.member_id ?? raw.memberId),
    online: Boolean(raw.online ?? raw.is_online),
    lastSeen: raw.last_seen ?? raw.lastSeen ?? null,
  }));
}

// ── General chat ──────────────────────────────────────────────────────────────

export async function getGeneralChat(token: string, after?: string): Promise<ChatMessage[]> {
  const url = after
    ? `${API_URL}/community/chat/general?after=${encodeURIComponent(after)}`
    : `${API_URL}/community/chat/general`;
  const res = await fetch(url, { headers: authH(token) });
  const data = await asJson<any[]>(res);
  return (data ?? []).map(normalizeMsg);
}

export async function sendGeneralMessage(token: string, content: string): Promise<ChatMessage> {
  const res = await fetch(`${API_URL}/community/chat/general`, {
    method: "POST",
    headers: authH(token),
    body: JSON.stringify({ content }),
  });
  return normalizeMsg(await asJson<any>(res));
}

// ── Direct messages ───────────────────────────────────────────────────────────

export async function getDMConversations(token: string): Promise<DMConversation[]> {
  const res = await fetch(`${API_URL}/community/dm`, { headers: authH(token) });
  const data = await asJson<any[]>(res);
  return (data ?? []).map(normalizeDM);
}

export async function getDMMessages(token: string, memberId: number, after?: string): Promise<ChatMessage[]> {
  const url = after
    ? `${API_URL}/community/dm/${memberId}?after=${encodeURIComponent(after)}`
    : `${API_URL}/community/dm/${memberId}`;
  const res = await fetch(url, { headers: authH(token) });
  const data = await asJson<any[]>(res);
  return (data ?? []).map(normalizeMsg);
}

export async function sendDMMessage(token: string, memberId: number, content: string): Promise<ChatMessage> {
  const res = await fetch(`${API_URL}/community/dm/${memberId}`, {
    method: "POST",
    headers: authH(token),
    body: JSON.stringify({ content }),
  });
  return normalizeMsg(await asJson<any>(res));
}
