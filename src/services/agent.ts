const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function asJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return JSON.parse(text) as T;
}

export async function sendMessage(
  token: string,
  message: string,
  sessionId?: string,
  fileId?: string
): Promise<{ reply: string; session_id: string }> {
  const res = await fetch(`${API_URL}/agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message, session_id: sessionId ?? null, file_id: fileId ?? null }),
  });
  return asJson<{ reply: string; session_id: string }>(res);
}

export async function uploadFile(
  token: string,
  file: File
): Promise<{ file_id: string; name: string; type: "image" | "document" }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_URL}/agent/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = await asJson<any>(res);
  const isImage = file.type.startsWith("image/");
  return {
    file_id: data.file_id ?? data.id ?? "",
    name: file.name,
    type: isImage ? "image" : "document",
  };
}
