const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ── Dev bypass ────────────────────────────────────────────────────────────────
// Senha local para testar a área do membro sem backend.
// Remover quando o endpoint /auth/member/login estiver implementado no backend.
const DEV_PASSWORD = "ufuracing2025";
const DEV_TOKEN = "dev-local-token";

function devSession(email: string): MemberSession {
  const name = email.split("@")[0] ?? "Membro";
  return {
    id: 0,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    role: "Membro",
    team: "UFU Racing",
    photoUrl: null,
    email,
    token: DEV_TOKEN,
  };
}
// ─────────────────────────────────────────────────────────────────────────────

export type MemberSession = {
  id: number;
  name: string;
  role: string;
  team: string;
  photoUrl?: string | null;
  email: string;
  token: string;
};

async function asJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Resposta inválida: ${text.slice(0, 120)}`);
  }
}

function normalizeSession(raw: any, token: string): MemberSession {
  return {
    id: Number(raw.id),
    name: raw.name ?? "",
    role: raw.role ?? "",
    team: raw.team ?? "",
    photoUrl: raw.photo_url ?? raw.photoUrl ?? null,
    email: raw.email ?? "",
    token,
  };
}

export async function memberLogin(email: string, password: string): Promise<MemberSession> {
  if (password === DEV_PASSWORD) return devSession(email);

  const res = await fetch(`${API_URL}/auth/member/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await asJson<{ token: string; member: any }>(res);
  return normalizeSession(data.member, data.token);
}

export async function memberMe(token: string): Promise<MemberSession> {
  if (token === DEV_TOKEN) {
    const stored = typeof window !== "undefined"
      ? localStorage.getItem("@ufuracing-member")
      : null;
    if (stored) return JSON.parse(stored) as MemberSession;
    throw new Error("Sessão dev expirada");
  }

  const res = await fetch(`${API_URL}/auth/member/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await asJson<any>(res);
  return normalizeSession(data, token);
}
