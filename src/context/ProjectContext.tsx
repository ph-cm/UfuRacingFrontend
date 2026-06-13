"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  getSponsors,
  getNews,
  getHighlight,
  saveHighlight,
  getMembers,
  createSponsor,
  deleteSponsor,
  createMember,
  updateMember,
  deleteMember,
  type MemberDTO,
} from "@/services/api";

import type { Member } from "@/types/member";

// Interfaces exportadas para usar no Admin se precisar
export interface Highlight {
  memberName: string;
  memberRole: string;
  memberPhoto: string;
  areaName: string;
  areaDesc: string;
  areaPhoto: string;
}

export interface NewsItem {
  id: number | string;
  title: string;
  summary: string;
  image: string;
  date?: string;
}

export interface Sponsor {
  id: number | string;
  name: string;
  logoUrl: string;
}

interface MemberCreateDTO {
  name: string;
  role: string;
  team: string;
  photo_url: string | null;
  email: string | null;
  linkedin: string | null;
  birth_date?: string | null;
  active: boolean;
}

interface ProjectContextType {
  highlight: Highlight;
  news: NewsItem[];
  sponsors: Sponsor[];
  members: Member[];
  loading: boolean;

  updateHighlight: (data: Highlight) => Promise<void>;
  addNews: (item: NewsItem) => void;
  addSponsor: (item: { name: string; logoUrl: string }) => Promise<void>;
  removeSponsor: (id: number | string) => Promise<void>;

  addMember: (member: Omit<Member, "id">) => Promise<void>;
  updateMember: (id: number, member: Omit<Member, "id">) => Promise<void>;
  removeMember: (id: number) => Promise<void>;
  reloadMembers: () => Promise<void>;
  reloadSponsors: () => Promise<void>;
  reloadHighlight: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const LS_KEYS = {
  sponsors: "@ufuracing-sponsors",
  news: "@ufuracing-news",
  highlight: "@ufuracing-highlight",
};

const DEFAULT_HIGHLIGHT: Highlight = {
  memberName: "Membro Destaque",
  memberRole: "Capitão",
  memberPhoto: "",
  areaName: "Engenharia",
  areaDesc: "Desenvolvimento de sistemas",
  areaPhoto: "",
};

// mapeia backend -> front (tolerante a snake_case/camelCase)
function memberFromDTO(m: any): Member {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    team: m.team,
    photoUrl: (m.photoUrl ?? m.photo_url ?? undefined) || undefined,
    email: (m.email ?? undefined) || undefined,
    linkedin: (m.linkedin ?? undefined) || undefined,
    birthDate: (m.birthDate ?? m.birth_date ?? undefined) || undefined,
  };
}

function memberToCreateDTO(m: Omit<Member, "id">): MemberCreateDTO {
  return {
    name: m.name,
    role: m.role,
    team: m.team,
    photo_url: m.photoUrl ?? null,
    email: m.email ?? null,
    linkedin: m.linkedin ?? null,
    birth_date: m.birthDate ?? null,
    active: true,
  };
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState<Member[]>([]);
  const [highlight, setHighlight] = useState<Highlight>(DEFAULT_HIGHLIGHT);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  // 1) Primeiro: carrega cache (rápido) — SOMENTE sponsors/news/highlight.
  // Members NÃO ficam mais no localStorage, porque agora é 100% backend.
  useEffect(() => {
    try {
      const savedSponsors = localStorage.getItem(LS_KEYS.sponsors);
      const savedNews = localStorage.getItem(LS_KEYS.news);
      const savedHighlight = localStorage.getItem(LS_KEYS.highlight);

      if (savedSponsors) setSponsors(JSON.parse(savedSponsors));
      if (savedNews) setNews(JSON.parse(savedNews));
      if (savedHighlight) setHighlight(JSON.parse(savedHighlight));
    } catch (e) {
      console.warn("Falha ao ler localStorage:", e);
    }
  }, []);

  async function reloadMembers() {
    const data = await getMembers();
    const normalized = (data ?? []).map(memberFromDTO);
    setMembers(normalized);
  }

  async function reloadSponsors() {
    const sp = await getSponsors();
    const normalized: Sponsor[] = (sp ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      logoUrl: s.logoUrl ?? s.logo_url ?? s.logo ?? "",
    }));
    setSponsors(normalized);
    try { localStorage.setItem(LS_KEYS.sponsors, JSON.stringify(normalized)); } catch {}
  }

  async function reloadHighlight() {
    const hi = await getHighlight();
    const normalized: Highlight = hi
      ? {
          memberName:  hi.memberName  ?? DEFAULT_HIGHLIGHT.memberName,
          memberRole:  hi.memberRole  ?? DEFAULT_HIGHLIGHT.memberRole,
          memberPhoto: hi.memberPhoto ?? DEFAULT_HIGHLIGHT.memberPhoto,
          areaName:    hi.areaName    ?? DEFAULT_HIGHLIGHT.areaName,
          areaDesc:    hi.areaDesc    ?? DEFAULT_HIGHLIGHT.areaDesc,
          areaPhoto:   (hi as any).areaPhoto ?? (hi as any).area_photo ?? DEFAULT_HIGHLIGHT.areaPhoto,
        }
      : DEFAULT_HIGHLIGHT;
    setHighlight(normalized);
    try { localStorage.setItem(LS_KEYS.highlight, JSON.stringify(normalized)); } catch {}
  }

  // 2) Depois: busca do backend e atualiza cache
  useEffect(() => {
    (async () => {
      try {
        const [sp, nw, hi] = await Promise.all([
          getSponsors(),
          getNews(),
          getHighlight(),
        ]);

        const normalizedSponsors: Sponsor[] = (sp ?? []).map((s: any) => ({
          id: s.id,
          name: s.name,
          logoUrl: s.logoUrl ?? s.logo_url ?? s.logo ?? "",
        }));

        setSponsors(normalizedSponsors);
        localStorage.setItem(
          LS_KEYS.sponsors,
          JSON.stringify(normalizedSponsors)
        );

        const normalizedNews: NewsItem[] = (nw ?? []).map((n: any) => ({
          id: n.id,
          title: n.title,
          summary: n.summary,
          image: n.image ?? "",
          date: n.date,
        }));

        setNews(normalizedNews);
        localStorage.setItem(LS_KEYS.news, JSON.stringify(normalizedNews));

        const normalizedHighlight: Highlight = hi
          ? {
              memberName: hi.memberName ?? DEFAULT_HIGHLIGHT.memberName,
              memberRole: hi.memberRole ?? DEFAULT_HIGHLIGHT.memberRole,
              memberPhoto: hi.memberPhoto ?? DEFAULT_HIGHLIGHT.memberPhoto,
              areaName: hi.areaName ?? DEFAULT_HIGHLIGHT.areaName,
              areaDesc: hi.areaDesc ?? DEFAULT_HIGHLIGHT.areaDesc,
              areaPhoto:
                (hi as any).areaPhoto ??
                (hi as any).area_photo ??
                DEFAULT_HIGHLIGHT.areaPhoto,
            }
          : DEFAULT_HIGHLIGHT;

        setHighlight(normalizedHighlight);
        localStorage.setItem(
          LS_KEYS.highlight,
          JSON.stringify(normalizedHighlight)
        );

        // ✅ MEMBERS: agora vem do backend
        await reloadMembers();
      } catch (e) {
        console.warn("Falha ao carregar dados do backend:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateHighlight = async (data: Highlight) => {
    const saved = await saveHighlight(data);
    const merged: Highlight = {
      memberName:  saved.memberName  ?? data.memberName  ?? DEFAULT_HIGHLIGHT.memberName,
      memberRole:  saved.memberRole  ?? data.memberRole  ?? DEFAULT_HIGHLIGHT.memberRole,
      memberPhoto: saved.memberPhoto ?? data.memberPhoto ?? DEFAULT_HIGHLIGHT.memberPhoto,
      areaName:    saved.areaName    ?? data.areaName    ?? DEFAULT_HIGHLIGHT.areaName,
      areaDesc:    saved.areaDesc    ?? data.areaDesc    ?? DEFAULT_HIGHLIGHT.areaDesc,
      areaPhoto:   saved.areaPhoto   ?? data.areaPhoto   ?? DEFAULT_HIGHLIGHT.areaPhoto,
    };
    setHighlight(merged);
    try {
      localStorage.setItem(LS_KEYS.highlight, JSON.stringify(merged));
    } catch {}
  };

  const addNews = (item: NewsItem) => {
    setNews((prev) => {
      const next = [item, ...prev];
      try {
        localStorage.setItem(LS_KEYS.news, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addSponsor = async (item: { name: string; logoUrl: string }) => {
    const created = await createSponsor({ name: item.name, logo_url: item.logoUrl || null });
    const sponsor: Sponsor = { id: created.id, name: created.name, logoUrl: created.logo_url ?? "" };
    setSponsors((prev) => {
      const next = [...prev, sponsor];
      try { localStorage.setItem(LS_KEYS.sponsors, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const removeSponsor = async (id: number | string) => {
    await deleteSponsor(Number(id));
    setSponsors((prev) => {
      const next = prev.filter((s) => String(s.id) !== String(id));
      try { localStorage.setItem(LS_KEYS.sponsors, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // ✅ agora cria no backend
  const addMember = async (member: Omit<Member, "id">) => {
    const payload = memberToCreateDTO(member);
    const created: MemberDTO = await createMember(payload);
    setMembers((prev) => [memberFromDTO(created), ...prev]);
  };

  const updateMemberFn = async (id: number, member: Omit<Member, "id">) => {
    const payload = memberToCreateDTO(member);
    const updated: MemberDTO = await updateMember(id, payload);
    setMembers((prev) => prev.map((m) => (m.id === id ? memberFromDTO(updated) : m)));
  };

  // ✅ agora remove no backend
  const removeMember = async (id: number) => {
    await deleteMember(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <ProjectContext.Provider
      value={{
        highlight,
        news,
        sponsors,
        members,
        loading,
        updateHighlight,
        addNews,
        addSponsor,
        removeSponsor,
        addMember,
        updateMember: updateMemberFn,
        removeMember,
        reloadMembers,
        reloadSponsors,
        reloadHighlight,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject deve ser usado dentro de um ProjectProvider");
  }
  return context;
};