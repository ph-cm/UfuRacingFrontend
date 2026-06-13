// src/services/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const ADMIN_TOKEN_KEY = "@ufuracing-admin-token";

export function getAdminToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
}

export function setAdminToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  if (typeof window !== "undefined") localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAdminToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

//
// TYPES (Front-friendly)
//
export type NewsItem = {
  id: number;
  title: string;
  summary: string;
  image: string | null;
  slug: string;
  created_at: string; // ISO
};

export type NewsDetail = NewsItem & {
  content: string;
  author?: string | null;
  category?: string | null;
  published?: boolean;
};

export type SponsorItem = {
  id: number;
  name: string;
  logo_url: string | null;
  website: string | null;
  active: boolean;
};

export type Highlight = {
  memberName?: string;
  memberRole?: string;
  memberPhoto?: string;
  areaName?: string;
  areaDesc?: string;
  areaPhoto?: string;
};

export type SponsorContactStatus = "pending" | "in_progress" | "won" | "lost" | string;

export type SponsorContact = {
  id: number;
  company_name: string;
  responsible_name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  status: SponsorContactStatus;
  created_at: string;
};

export type MemberDTO = {
  id: number;
  name: string;
  role: string;
  team: string;
  photo_url?: string | null;
  email?: string | null;
  linkedin?: string | null;
  birth_date?: string | null;
  active?: boolean;
};

export type AdminDashboard = {
  stats: {
    news: number;
    sponsors: number;
    members: number;
    sponsor_contacts_pending: number;
  };
  recent_sponsor_contacts: SponsorContact[];
};

//
// Helpers
//
async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Resposta não é JSON: ${text.slice(0, 250)}`);
  }
}

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return safeJson<T>(res);
}

//
// Normalizers (backend -> frontend types)
//
function normalizeNewsItem(raw: any): NewsItem {
  return {
    id: Number(raw.id),
    title: raw.title ?? "",
    summary: raw.summary ?? "",
    image: raw.image ?? null,
    slug: raw.slug ?? "",
    created_at: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
  };
}

function normalizeNewsDetail(raw: any): NewsDetail {
  return {
    ...normalizeNewsItem(raw),
    content: raw.content ?? "",
    author: raw.author ?? null,
    category: raw.category ?? null,
    published: typeof raw.published === "boolean" ? raw.published : undefined,
  };
}

function normalizeSponsor(raw: any): SponsorItem {
  return {
    id: Number(raw.id),
    name: raw.name ?? "",
    logo_url: raw.logo_url ?? raw.logoUrl ?? raw.logo ?? null,
    website: raw.website ?? null,
    active: typeof raw.active === "boolean" ? raw.active : true,
  };
}

function normalizeHighlight(raw: any): Highlight {
  return {
    memberName: raw.memberName ?? raw.member_name,
    memberRole: raw.memberRole ?? raw.member_role,
    memberPhoto: raw.memberPhoto ?? raw.member_photo,
    areaName: raw.areaName ?? raw.area_name,
    areaDesc: raw.areaDesc ?? raw.area_desc,
    areaPhoto: raw.areaPhoto ?? raw.area_photo,
  };
}

function normalizeSponsorContact(raw: any): SponsorContact {
  return {
    id: Number(raw.id),
    company_name: raw.company_name ?? raw.company ?? raw.companyName ?? "",
    responsible_name: raw.responsible_name ?? raw.name ?? raw.responsibleName ?? "",
    email: raw.email ?? "",
    phone: raw.phone ?? null,
    message: raw.message ?? null,
    status: raw.status ?? "pending",
    created_at: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
  };
}

function normalizeMember(raw: any): MemberDTO {
  return {
    id: Number(raw.id),
    name: raw.name ?? "",
    role: raw.role ?? "",
    team: raw.team ?? "",
    photo_url: raw.photo_url ?? raw.photoUrl ?? null,
    email: raw.email ?? null,
    linkedin: raw.linkedin ?? null,
    birth_date: raw.birth_date ?? raw.birthDate ?? null,
    active: typeof raw.active === "boolean" ? raw.active : true,
  };
}

//
// NEWS
// Backend: GET /news  |  GET /news/{slug}
//
export async function getNews(): Promise<NewsItem[]> {
  const res = await fetch(`${API_URL}/news`, { cache: "no-store" });
  const data = await asJson<any[]>(res);
  return (data ?? []).map(normalizeNewsItem);
}

// ✅ seu backend é por SLUG, então "ById" não existe de verdade.
// Mantive por compatibilidade, mas vai falhar se você passar id.
// Use getNewsBySlug no front.
export async function getNewsBySlug(slug: string): Promise<NewsDetail> {
  const res = await fetch(`${API_URL}/news/slug/${encodeURIComponent(slug)}`, { cache: "no-store" });
  const data = await asJson<any>(res);
  return normalizeNewsDetail(data);
}

// Se você AINDA quiser suportar id, aí precisa de endpoint no backend /news/id/{id}.
// Por enquanto, deixo explícito:
export async function getNewsById(id: number): Promise<NewsDetail> {
  throw new Error(
    `Seu backend atual busca notícia por slug (GET /news/{slug}). ` +
      `Você tentou por id=${id}. Troque a rota do front para usar slug.`
  );
}

//
// SPONSORS
//
export async function getSponsors(): Promise<SponsorItem[]> {
  const res = await fetch(`${API_URL}/sponsors`, { cache: "no-store" });
  const data = await asJson<any[]>(res);
  return (data ?? []).map(normalizeSponsor);
}

//
// HIGHLIGHT
//
export async function getHighlight(): Promise<Highlight> {
  const res = await fetch(`${API_URL}/highlight`, { cache: "no-store" });
  const data = await asJson<any>(res);
  return normalizeHighlight(data ?? {});
}

//
// SPONSOR CONTACT
// Front envia { name, company, email, message } (igual você já tem)
// Backend pode salvar como company_name/responsible_name? sem problema: normalizador resolve no retorno.
//
export async function createSponsorContact(data: {
  name: string;
  company: string;
  email: string;
  message: string;
  phone?: string;
}): Promise<SponsorContact> {
  const res = await fetch(`${API_URL}/contact/sponsor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const created = await asJson<any>(res);
  return normalizeSponsorContact(created);
}

// Se você quer mudar status no Admin (seu botão "Em andamento / Fechado / Perdido"):
// ✅ você precisa de um endpoint no backend, algo como PATCH /contact/sponsor/{id}/status
export async function updateSponsorContactStatus(
  id: number,
  status: SponsorContactStatus
): Promise<SponsorContact> {
  const res = await authFetch(`${API_URL}/contact/sponsor/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const updated = await asJson<any>(res);
  return normalizeSponsorContact(updated);
}

//
// MEMBERS
//
export async function getMembers(): Promise<MemberDTO[]> {
  const res = await fetch(`${API_URL}/members`, { cache: "no-store" });
  const data = await asJson<any[]>(res);
  return (data ?? []).map(normalizeMember);
}

export type CreateMemberDTO = Omit<MemberDTO, "id">;

export async function createMember(data: CreateMemberDTO): Promise<MemberDTO> {
  const res = await authFetch(`${API_URL}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Erro ao criar membro");
  }

  const created = await asJson<any>(res);
  return normalizeMember(created);
}

export async function updateMember(id: number, data: Partial<CreateMemberDTO>): Promise<MemberDTO> {
  const res = await authFetch(`${API_URL}/members/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Erro ao atualizar membro");
  }

  const updated = await asJson<any>(res);
  return normalizeMember(updated);
}

export async function deleteMember(id: number): Promise<void> {
  const res = await authFetch(`${API_URL}/members/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Erro ao remover membro");
  }
}
export type NewsPayload = {
  title: string;
  summary: string;
  content: string;
  image?: string | null;
  author?: string | null;
  category?: string | null;
  published?: boolean;
};

export async function createNews(data: NewsPayload): Promise<NewsDetail> {
  const res = await authFetch(`${API_URL}/news`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return asJson<NewsDetail>(res);
}

export async function updateNews(id: number, data: Partial<NewsPayload>): Promise<NewsDetail> {
  const res = await authFetch(`${API_URL}/news/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Erro ao atualizar notícia");
  }
  const raw = await asJson<any>(res);
  return normalizeNewsDetail(raw);
}

export async function deleteNews(id: number): Promise<void> {
  const res = await authFetch(`${API_URL}/news/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Erro ao excluir notícia");
  }
}
//
// ADMIN DASHBOARD
//
export async function getAdminDashboard(): Promise<AdminDashboard> {
  const res = await authFetch(`${API_URL}/admin/dashboard`);
  const data = await asJson<any>(res);

  return {
    stats: {
      news: Number(data?.stats?.news ?? 0),
      sponsors: Number(data?.stats?.sponsors ?? 0),
      members: Number(data?.stats?.members ?? 0),
      sponsor_contacts_pending: Number(data?.stats?.sponsor_contacts_pending ?? 0),
    },
    recent_sponsor_contacts: (data?.recent_sponsor_contacts ?? []).map(normalizeSponsorContact),
  };
}

//
// UPLOAD
//
export async function uploadImage(file: File): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await authFetch(`${API_URL}/upload`, {
    method: "POST",
    body: fd,
  });

  const data = await asJson<{ url: string }>(res);
  // Replace whatever origin the backend returned with the known public API_URL.
  // This fixes the case where the backend runs behind a proxy and returns http://127.0.0.1:8000/...
  const fixedUrl = data.url.replace(/^https?:\/\/[^/]+/, API_URL.replace(/\/$/, ""));
  return { url: fixedUrl };
}