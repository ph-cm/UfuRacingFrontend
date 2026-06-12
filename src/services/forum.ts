import type { ForumThread, ForumPost } from "@/types/forum";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function authHeaders(token: string): Record<string, string> {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function asJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return JSON.parse(text) as T;
}

function normalizeThread(raw: any): ForumThread {
  return {
    id: Number(raw.id),
    title: raw.title ?? "",
    category: raw.category ?? "Geral",
    content: raw.content ?? raw.body ?? "",
    authorId: Number(raw.author_id ?? raw.authorId ?? 0),
    authorName: raw.author_name ?? raw.authorName ?? "Membro",
    authorPhotoUrl: raw.author_photo_url ?? raw.authorPhotoUrl ?? null,
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    replyCount: Number(raw.reply_count ?? raw.replyCount ?? 0),
    lastReplyAt: raw.last_reply_at ?? raw.lastReplyAt ?? null,
    pinned: Boolean(raw.pinned),
  };
}

function normalizePost(raw: any): ForumPost {
  return {
    id: Number(raw.id),
    threadId: Number(raw.thread_id ?? raw.threadId ?? 0),
    authorId: Number(raw.author_id ?? raw.authorId ?? 0),
    authorName: raw.author_name ?? raw.authorName ?? "Membro",
    authorPhotoUrl: raw.author_photo_url ?? raw.authorPhotoUrl ?? null,
    content: raw.content ?? raw.body ?? "",
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
  };
}

export async function getThreads(token: string, category?: string): Promise<ForumThread[]> {
  const url =
    category && category !== "Todos"
      ? `${API_URL}/forum/threads?category=${encodeURIComponent(category)}`
      : `${API_URL}/forum/threads`;
  const res = await fetch(url, { headers: authHeaders(token) });
  const data = await asJson<any[]>(res);
  return (data ?? []).map(normalizeThread);
}

export async function createThread(
  token: string,
  payload: { title: string; category: string; content: string }
): Promise<ForumThread> {
  const res = await fetch(`${API_URL}/forum/threads`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return normalizeThread(await asJson<any>(res));
}

export async function getThread(
  token: string,
  id: number
): Promise<{ thread: ForumThread; posts: ForumPost[] }> {
  const res = await fetch(`${API_URL}/forum/threads/${id}`, {
    headers: authHeaders(token),
  });
  const data = await asJson<any>(res);
  return {
    thread: normalizeThread(data.thread ?? data),
    posts: (data.posts ?? []).map(normalizePost),
  };
}

export async function createPost(
  token: string,
  threadId: number,
  content: string
): Promise<ForumPost> {
  const res = await fetch(`${API_URL}/forum/threads/${threadId}/posts`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ content }),
  });
  return normalizePost(await asJson<any>(res));
}
