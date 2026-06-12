"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Newspaper, Star, Building2, Users,
  LogOut, ArrowLeft, RefreshCw, X, Cake, ExternalLink,
  Trash2, Plus, Check, AlertCircle,
} from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import type { Member } from "@/types/member";
import AdminCalendar from "@/components/AdminCalendar";
import {
  createNews,
  getAdminDashboard,
  updateSponsorContactStatus,
  type AdminDashboard as AdminDashboardDTO,
  type SponsorContact,
} from "@/services/api";

// ── Auth ──────────────────────────────────────────────────────────
const VALID_USERS = [
  { email: "admin@ufuracing.com", pass: "admin", name: "Admin Geral", role: "Diretoria" },
];

// ── Types ─────────────────────────────────────────────────────────
type MemberForm = {
  name: string; role: string; team: string;
  photoUrl: string; email: string; linkedin: string; birthDate: string;
};

type TabId = "home" | "noticias" | "destaques" | "patrocinadores" | "membros";

// ── Helpers ───────────────────────────────────────────────────────
function isTodayBirthday(birthDate?: string | null) {
  if (!birthDate) return false;
  const p = birthDate.slice(0, 10).split("-");
  if (p.length < 3) return false;
  const t = new Date();
  return +p[1]! - 1 === t.getMonth() && +p[2]! === t.getDate();
}

function formatDateBR(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

const STATUS_LABELS: Record<string, string> = {
  pending:     "Pendente",
  in_progress: "Em andamento",
  won:         "Fechado",
  lost:        "Perdido",
};

const STATUS_STYLES: Record<string, string> = {
  pending:     "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-navy/8 text-navy border-navy/20",
  won:         "bg-gold/10 text-gold border-gold/25",
  lost:        "bg-gray-100 text-gray-400 border-gray-200",
};

// ── Shared styles ─────────────────────────────────────────────────
const inputCls =
  "w-full bg-gray-50 border border-gray-100 focus:border-navy/30 focus:bg-white px-3 py-2.5 text-sm text-navy outline-none transition-all";

// ── Sub-components ────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[9px] font-black uppercase tracking-[0.22em] text-gray-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 px-3 py-2.5">
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
      <div className="text-navy font-bold text-xs">{children}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function AdminPage() {
  const {
    highlight, updateHighlight,
    sponsors, addSponsor, removeSponsor,
    members, addMember, removeMember,
  } = useProject();

  // Auth
  const [currentUser, setCurrentUser] = useState<typeof VALID_USERS[0] | null>(null);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);

  // Navigation
  const [activeTab, setActiveTab]       = useState<TabId>("home");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, []);

  // Forms
  const [newsForm, setNewsForm]     = useState({ title: "", summary: "", content: "", image: "" });
  const [sponsorForm, setSponsorForm] = useState({ name: "", logoUrl: "" });
  const [highlightForm, setHighlightForm] = useState(highlight);
  const [memberForm, setMemberForm] = useState<MemberForm>({
    name: "", role: "", team: "Aerodinâmica",
    photoUrl: "", email: "", linkedin: "", birthDate: "",
  });

  // Dashboard
  const [dash, setDash]               = useState<AdminDashboardDTO | null>(null);
  const [dashLoading, setDashLoading] = useState(false);
  const [dashError, setDashError]     = useState<string | null>(null);
  const [contactBusyId, setContactBusyId] = useState<number | null>(null);

  const memberFields = useMemo<
    Array<{ key: keyof MemberForm; label: string; type?: string; span?: boolean }>
  >(() => [
    { key: "name",      label: "Nome completo",  span: true },
    { key: "role",      label: "Cargo",          span: true },
    { key: "team",      label: "Sub-área",       span: true },
    { key: "email",     label: "E-mail" },
    { key: "linkedin",  label: "LinkedIn URL" },
    { key: "photoUrl",  label: "URL da foto" },
    { key: "birthDate", label: "Nascimento", type: "date" },
  ], []);

  const loadDashboard = useCallback(async () => {
    setDashLoading(true);
    setDashError(null);
    try {
      setDash(await getAdminDashboard());
    } catch {
      setDashError("Falha ao carregar dados. Verifique se o backend está ativo.");
    } finally {
      setDashLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "home") void loadDashboard();
  }, [activeTab, loadDashboard]);

  const handleLogin = () => {
    const u = VALID_USERS.find((u) => u.email === email && u.pass === password);
    if (u) { setCurrentUser(u); setLoginError(false); }
    else setLoginError(true);
  };

  const handleAddMember = async () => {
    if (!memberForm.name.trim() || !memberForm.role.trim() || !memberForm.team.trim()) {
      showToast("Preencha Nome, Cargo e Sub-área.", false);
      return;
    }
    try {
      await addMember({
        name:      memberForm.name.trim(),
        role:      memberForm.role.trim(),
        team:      memberForm.team.trim(),
        photoUrl:  memberForm.photoUrl.trim()  || undefined,
        email:     memberForm.email.trim()     || undefined,
        linkedin:  memberForm.linkedin.trim()  || undefined,
        birthDate: memberForm.birthDate.trim() || undefined,
      });
      showToast("Membro adicionado com sucesso.");
      setMemberForm((p) => ({ ...p, name: "", role: "", photoUrl: "", email: "", linkedin: "", birthDate: "" }));
    } catch {
      showToast("Erro ao adicionar membro. Confira o backend.", false);
    }
  };

  const handleSetContactStatus = async (c: SponsorContact, status: string) => {
    setContactBusyId(c.id);
    try {
      const updated = await updateSponsorContactStatus(c.id, status);
      setDash((prev) =>
        prev ? {
          ...prev,
          recent_sponsor_contacts: prev.recent_sponsor_contacts.map((x) =>
            x.id === updated.id ? updated : x
          ),
        } : prev
      );
    } catch {
      showToast("Erro ao atualizar status.", false);
    } finally {
      setContactBusyId(null);
    }
  };

  // ── LOGIN ────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-carbon flex items-center justify-center px-4 relative">
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-white/25 hover:text-white/60 transition-colors text-[10px] font-bold uppercase tracking-[0.2em]"
        >
          <ArrowLeft size={12} /> Voltar ao site
        </Link>

        <div className="w-full max-w-xs">
          {/* Wordmark */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="block w-0.5 h-5 bg-crimson" />
              <span className="text-white font-black text-sm tracking-tight uppercase">
                UFU<span className="text-crimson">Racing</span>
              </span>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/25">
              Área Administrativa
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-3.5">
            <Field label="E-mail">
              <input
                type="email"
                autoComplete="username"
                className="w-full bg-white/5 border border-white/8 focus:border-white/20 text-white placeholder:text-white/20 px-4 py-3 text-sm outline-none transition-colors"
                placeholder="admin@ufuracing.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setLoginError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </Field>
            <Field label="Senha">
              <input
                type="password"
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/8 focus:border-white/20 text-white placeholder:text-white/20 px-4 py-3 text-sm outline-none transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </Field>

            {loginError && (
              <div className="flex items-center gap-2 text-crimson text-xs font-bold">
                <AlertCircle size={12} /> Credenciais inválidas. Tente novamente.
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-crimson text-white font-black py-3 text-[11px] uppercase tracking-[0.18em] hover:bg-red-700 transition-colors mt-1"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── TABS config ──────────────────────────────────────────────────
  const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
    { id: "home",           label: "Painel",         icon: <LayoutDashboard size={14} /> },
    { id: "noticias",       label: "Notícias",       icon: <Newspaper size={14} /> },
    { id: "destaques",      label: "Destaques",      icon: <Star size={14} /> },
    { id: "patrocinadores", label: "Patrocinadores", icon: <Building2 size={14} /> },
    { id: "membros",        label: "Membros",        icon: <Users size={14} /> },
  ];

  // ── DASHBOARD ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex relative">

      {/* ── Toast ─────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-5 py-3 text-xs font-bold border shadow-lg ${
            toast.ok
              ? "bg-white border-green-200 text-green-700"
              : "bg-white border-crimson/30 text-crimson"
          }`}
        >
          {toast.ok ? <Check size={12} /> : <AlertCircle size={12} />}
          {toast.msg}
        </div>
      )}

      {/* ── Sidebar ───────────────────────────────── */}
      <aside className="w-56 bg-navy text-white hidden lg:flex flex-col fixed h-full z-30">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-2">
            <span className="block w-0.5 h-5 bg-crimson" />
            <span className="text-white font-black text-xs tracking-tight uppercase">
              UFU<span className="text-crimson">Racing</span>
            </span>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/25 mt-1 pl-2.5">
            Painel Admin
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5" aria-label="Admin nav">
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all border-l-2 ${
                  active
                    ? "border-crimson bg-white/7 text-white"
                    : "border-transparent text-white/35 hover:text-white/65 hover:bg-white/4"
                }`}
              >
                <span className={active ? "text-crimson" : "text-white/25"}>{t.icon}</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.1em]">{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-white/8 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-black text-white truncate">{currentUser.name}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/25 mt-0.5">
              {currentUser.role}
            </p>
          </div>
          <button
            onClick={() => setCurrentUser(null)}
            className="text-white/25 hover:text-white/60 transition-colors ml-3 p-1 shrink-0"
            title="Sair"
          >
            <LogOut size={13} />
          </button>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────── */}
      <main className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Header bar */}
        <div className="bg-white border-b border-gray-100 px-6 md:px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xs font-black uppercase tracking-[0.12em] text-navy">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">
              UFU Racing · Admin
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Online</span>
            </div>
            <Link
              href="/"
              className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 hover:text-navy transition-colors border border-gray-200 px-3 py-1.5"
            >
              ← Ver Site
            </Link>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-5 md:p-8">
          <div className="grid lg:grid-cols-3 gap-5 items-start">

            {/* ══════ LEFT — 2/3 ══════ */}

            {/* HOME */}
            {activeTab === "home" && (
              <section className="lg:col-span-2 bg-white border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.12em] text-navy">Visão Geral</h2>
                    <p className="text-[10px] text-gray-400 mt-0.5">Estatísticas e contatos recentes</p>
                  </div>
                  <button
                    onClick={() => void loadDashboard()}
                    disabled={dashLoading}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-navy px-4 py-2 hover:bg-navy/80 transition-colors disabled:opacity-60"
                  >
                    <RefreshCw size={11} className={dashLoading ? "animate-spin" : ""} />
                    {dashLoading ? "Atualizando" : "Atualizar"}
                  </button>
                </div>

                {dashError ? (
                  <div className="border border-crimson/20 bg-crimson/4 p-5 flex items-start gap-3">
                    <AlertCircle size={14} className="text-crimson shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-crimson">{dashError}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Endpoint esperado: <code className="font-mono text-[11px]">GET /admin/dashboard</code>
                      </p>
                    </div>
                  </div>
                ) : dashLoading || !dash ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-gray-100" />)}
                  </div>
                ) : (
                  <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {[
                        { label: "Notícias",       value: dash.stats.news,                      accent: false },
                        { label: "Patrocinadores", value: dash.stats.sponsors,                  accent: false },
                        { label: "Membros",        value: dash.stats.members,                   accent: false },
                        { label: "Contatos novos", value: dash.stats.sponsor_contacts_pending,  accent: true  },
                      ].map((s) => (
                        <div key={s.label} className="border border-gray-100 p-5">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{s.label}</p>
                          <p className={`text-3xl font-black italic mt-2 ${s.accent ? "text-crimson" : "text-navy"}`}>
                            {s.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Contacts */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.12em] text-navy">
                          Contatos de Patrocínio
                        </h3>
                        <span className="text-[10px] text-gray-400">
                          {dash.recent_sponsor_contacts.length} registro(s)
                        </span>
                      </div>

                      {dash.recent_sponsor_contacts.length === 0 ? (
                        <p className="text-sm text-gray-400 py-8 text-center border border-dashed border-gray-200">
                          Nenhum contato registrado.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {dash.recent_sponsor_contacts.map((c) => (
                            <div key={c.id} className="border border-gray-100 p-5 flex items-start gap-5">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-black text-navy text-sm">{c.company_name}</span>
                                  <span className="text-gray-300">·</span>
                                  <span className="text-sm text-gray-500">{c.responsible_name}</span>
                                  <span className={`text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 ${STATUS_STYLES[c.status] ?? "bg-gray-100 text-gray-400 border-gray-200"}`}>
                                    {STATUS_LABELS[c.status] ?? c.status}
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-400">
                                  {c.email}{c.phone ? ` · ${c.phone}` : ""} · {formatDateBR(c.created_at)}
                                </p>
                                {c.message && (
                                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{c.message}</p>
                                )}
                              </div>

                              <div className="flex flex-col gap-1.5 shrink-0">
                                {(["in_progress", "won", "lost"] as const).map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => void handleSetContactStatus(c, s)}
                                    disabled={contactBusyId === c.id || c.status === s}
                                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border transition-all disabled:opacity-40 ${
                                      c.status === s
                                        ? "bg-navy text-white border-navy"
                                        : "border-gray-200 text-gray-500 hover:border-navy hover:text-navy"
                                    }`}
                                  >
                                    {STATUS_LABELS[s]}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </section>
            )}

            {/* NOTÍCIAS */}
            {activeTab === "noticias" && (
              <section className="lg:col-span-2 bg-white border border-gray-100 p-6">
                <h2 className="text-xs font-black uppercase tracking-[0.12em] text-navy mb-6">Nova Matéria</h2>
                <div className="space-y-4">
                  <Field label="Título">
                    <input
                      className={inputCls}
                      placeholder="Título da matéria"
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    />
                  </Field>
                  <Field label="Resumo">
                    <textarea
                      className={`${inputCls} h-20 resize-none`}
                      placeholder="Resumo curto para o card..."
                      value={newsForm.summary}
                      onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                    />
                  </Field>
                  <Field label="Conteúdo completo">
                    <textarea
                      className={`${inputCls} h-52 resize-none`}
                      placeholder="Conteúdo completo da matéria..."
                      value={newsForm.content}
                      onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    />
                  </Field>
                  <Field label="URL da imagem (opcional)">
                    <input
                      className={inputCls}
                      placeholder="https://..."
                      value={newsForm.image}
                      onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                    />
                  </Field>
                  <button
                    onClick={async () => {
                      try {
                        await createNews({
                          title: newsForm.title, summary: newsForm.summary,
                          content: newsForm.content, image: newsForm.image || null, published: true,
                        });
                        showToast("Matéria publicada com sucesso.");
                        setNewsForm({ title: "", summary: "", content: "", image: "" });
                      } catch {
                        showToast("Erro ao publicar. Verifique o backend.", false);
                      }
                    }}
                    className="w-full bg-crimson text-white font-black py-3 text-[11px] uppercase tracking-[0.15em] hover:bg-red-700 transition-colors"
                  >
                    Publicar Matéria
                  </button>
                </div>
              </section>
            )}

            {/* DESTAQUES */}
            {activeTab === "destaques" && (
              <section className="lg:col-span-2 bg-white border border-gray-100 p-6">
                <h2 className="text-xs font-black uppercase tracking-[0.12em] text-navy mb-6">
                  Destaques da Home
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-crimson">
                      Membro do Mês
                    </p>
                    {([
                      { label: "Nome",       key: "memberName"  },
                      { label: "Cargo",      key: "memberRole"  },
                      { label: "URL da foto",key: "memberPhoto" },
                    ] as const).map((f) => (
                      <Field key={f.key} label={f.label}>
                        <input
                          className={inputCls}
                          value={(highlightForm as any)?.[f.key] || ""}
                          onChange={(e) => setHighlightForm({ ...highlightForm, [f.key]: e.target.value })}
                        />
                      </Field>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gold">
                      Área em Foco
                    </p>
                    {([
                      { label: "Nome da área", key: "areaName"  },
                      { label: "URL da foto",  key: "areaPhoto" },
                    ] as const).map((f) => (
                      <Field key={f.key} label={f.label}>
                        <input
                          className={inputCls}
                          value={(highlightForm as any)?.[f.key] || ""}
                          onChange={(e) => setHighlightForm({ ...highlightForm, [f.key]: e.target.value })}
                        />
                      </Field>
                    ))}
                    <Field label="Descrição">
                      <textarea
                        className={`${inputCls} h-24 resize-none`}
                        value={highlightForm?.areaDesc || ""}
                        onChange={(e) => setHighlightForm({ ...highlightForm, areaDesc: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>

                <button
                  onClick={() => { updateHighlight(highlightForm); showToast("Destaques atualizados."); }}
                  className="w-full mt-6 bg-navy text-white font-black py-3 text-[11px] uppercase tracking-[0.15em] hover:bg-navy/80 transition-colors"
                >
                  Salvar e Atualizar Home
                </button>
              </section>
            )}

            {/* PATROCINADORES */}
            {activeTab === "patrocinadores" && (
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-white border border-gray-100 p-6">
                  <h2 className="text-xs font-black uppercase tracking-[0.12em] text-navy mb-5">
                    Adicionar Parceiro
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <Field label="Nome da empresa">
                      <input
                        className={inputCls}
                        placeholder="Ex: Empresa SA"
                        value={sponsorForm.name}
                        onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                      />
                    </Field>
                    <Field label="URL da logo (PNG / SVG)">
                      <input
                        className={inputCls}
                        placeholder="https://..."
                        value={sponsorForm.logoUrl}
                        onChange={(e) => setSponsorForm({ ...sponsorForm, logoUrl: e.target.value })}
                      />
                    </Field>
                  </div>

                  {sponsorForm.logoUrl && (
                    <div className="mb-4 h-14 border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                      <img
                        src={sponsorForm.logoUrl} alt="preview"
                        className="max-h-full max-w-xs object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (!sponsorForm.name.trim()) { showToast("Preencha o nome da empresa.", false); return; }
                      addSponsor({ id: String(Date.now()), name: sponsorForm.name.trim(), logoUrl: sponsorForm.logoUrl.trim() });
                      setSponsorForm({ name: "", logoUrl: "" });
                      showToast("Parceiro adicionado.");
                    }}
                    className="flex items-center gap-2 bg-gold/90 text-navy font-black py-2.5 px-6 text-[11px] uppercase tracking-[0.15em] hover:bg-gold transition-colors"
                  >
                    <Plus size={12} /> Adicionar
                  </button>
                </div>

                <div className="bg-white border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xs font-black uppercase tracking-[0.12em] text-navy">Parceiros Ativos</h2>
                    <span className="text-[10px] font-black text-navy bg-navy/8 px-3 py-1">{sponsors.length}</span>
                  </div>

                  {sponsors.length === 0 ? (
                    <p className="text-sm text-gray-400 py-8 text-center border border-dashed border-gray-200">
                      Nenhum parceiro cadastrado.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                      {sponsors.map((s) => (
                        <div
                          key={s.id}
                          className="relative group border border-gray-100 p-4 flex flex-col items-center gap-2 hover:border-gray-200 transition-colors"
                        >
                          <button
                            onClick={() => { if (confirm(`Remover ${s.name}?`)) removeSponsor(s.id); }}
                            className="absolute top-2 right-2 w-5 h-5 bg-white border border-gray-100 text-gray-300 hover:bg-crimson hover:text-white hover:border-crimson flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X size={9} />
                          </button>
                          <div className="h-10 flex items-center justify-center w-full">
                            {s.logoUrl ? (
                              <img src={s.logoUrl} alt={s.name} className="max-h-full max-w-full object-contain"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <span className="font-black text-navy/25 text-xl">{s.name.charAt(0)}</span>
                            )}
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-navy/40 text-center truncate w-full">
                            {s.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MEMBROS */}
            {activeTab === "membros" && (
              <section className="lg:col-span-2 space-y-5">
                <div className="bg-white border border-gray-100 p-6">
                  <h2 className="text-xs font-black uppercase tracking-[0.12em] text-navy mb-5">
                    Adicionar Membro
                  </h2>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    {memberFields.map((f) => (
                      <div key={f.key} className={f.span ? "col-span-2" : ""}>
                        <Field label={f.label}>
                          <input
                            type={f.type ?? "text"}
                            className={inputCls}
                            placeholder={f.type === "date" ? "" : f.label}
                            value={memberForm[f.key]}
                            onChange={(e) => setMemberForm((p) => ({ ...p, [f.key]: e.target.value }))}
                          />
                        </Field>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => void handleAddMember()}
                    className="w-full mt-5 bg-crimson text-white font-black py-3 text-[11px] uppercase tracking-[0.15em] hover:bg-red-700 transition-colors"
                  >
                    Adicionar Membro
                  </button>
                </div>

                <div className="bg-white border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xs font-black uppercase tracking-[0.12em] text-navy">
                      Membros Cadastrados
                    </h2>
                    <span className="text-[10px] font-black text-navy bg-navy/8 px-3 py-1">
                      {members.length}
                    </span>
                  </div>

                  {members.some((m) => isTodayBirthday(m.birthDate)) && (
                    <div className="mb-4 flex items-center gap-3 border border-gold/25 bg-gold/6 px-4 py-3">
                      <Cake size={13} className="text-gold shrink-0" />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-navy">
                          Aniversariante(s) hoje
                        </p>
                        <p className="text-xs font-bold text-navy/60 mt-0.5">
                          {members
                            .filter((m) => isTodayBirthday(m.birthDate))
                            .map((m) => m.name)
                            .join(" · ")}
                        </p>
                      </div>
                    </div>
                  )}

                  {members.length === 0 ? (
                    <p className="text-sm text-gray-400 py-8 text-center border border-dashed border-gray-200">
                      Nenhum membro cadastrado.
                    </p>
                  ) : (
                    <div className="space-y-0.5 max-h-[30rem] overflow-y-auto">
                      {members.map((m) => {
                        const selected = selectedMember?.id === m.id;
                        const birthday = isTodayBirthday(m.birthDate);
                        return (
                          <div
                            key={m.id}
                            onClick={() => setSelectedMember(selected ? null : m)}
                            className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all border-l-2 ${
                              selected
                                ? "border-crimson bg-crimson/4"
                                : birthday
                                ? "border-gold/40 bg-gold/4 hover:bg-gold/8"
                                : "border-transparent hover:bg-gray-50"
                            }`}
                          >
                            <div className="w-7 h-7 bg-navy/8 shrink-0 flex items-center justify-center overflow-hidden">
                              {m.photoUrl ? (
                                <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] font-black text-navy/40">
                                  {m.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-navy truncate">{m.name}</span>
                                {birthday && <Cake size={10} className="text-gold shrink-0" />}
                              </div>
                              <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                                {m.role} · {m.team}
                              </span>
                            </div>
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${selected ? "bg-crimson" : birthday ? "bg-gold" : "bg-gray-200"}`} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ══════ RIGHT — 1/3 ══════ */}
            <div className="space-y-5">
              <AdminCalendar
                birthdays={
                  activeTab === "membros"
                    ? members.filter((m) => !!m.birthDate).map((m) => ({ name: m.name, date: m.birthDate! }))
                    : []
                }
              />

              {/* Member detail */}
              {activeTab === "membros" && selectedMember ? (
                <div className="bg-white border border-gray-100 overflow-hidden">
                  {selectedMember.photoUrl ? (
                    <div className="h-36 overflow-hidden">
                      <img src={selectedMember.photoUrl} alt={selectedMember.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-20 bg-navy flex items-center justify-center">
                      <span className="text-4xl font-black text-white/15">
                        {selectedMember.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-navy uppercase leading-tight truncate">
                          {selectedMember.name}
                        </h3>
                        <p className="text-[10px] font-bold text-crimson uppercase tracking-wider mt-0.5">
                          {selectedMember.role}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedMember(null)}
                        className="text-gray-300 hover:text-gray-500 transition-colors ml-2 shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <InfoRow label="Sub-área">{selectedMember.team}</InfoRow>
                      {selectedMember.email && (
                        <InfoRow label="E-mail">
                          <span className="break-all">{selectedMember.email}</span>
                        </InfoRow>
                      )}
                      {selectedMember.birthDate && (
                        <InfoRow label="Aniversário">
                          <span className="flex items-center gap-1.5">
                            <Cake size={11} className="text-gold" />
                            {new Date(selectedMember.birthDate + "T12:00:00").toLocaleDateString("pt-BR", {
                              day: "2-digit", month: "long",
                            })}
                          </span>
                        </InfoRow>
                      )}
                    </div>

                    {selectedMember.linkedin && (
                      <a
                        href={selectedMember.linkedin}
                        target="_blank" rel="noreferrer"
                        className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-navy border border-navy/20 py-2 hover:bg-navy hover:text-white transition-all"
                      >
                        <ExternalLink size={11} /> LinkedIn
                      </a>
                    )}

                    <button
                      onClick={async () => {
                        if (!confirm(`Excluir ${selectedMember.name}?`)) return;
                        try {
                          await removeMember(selectedMember.id);
                          setSelectedMember(null);
                          showToast("Membro removido.");
                        } catch {
                          showToast("Erro ao remover membro.", false);
                        }
                      }}
                      className="w-full mt-2 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-crimson border border-gray-100 hover:border-crimson/30 py-2 transition-all"
                    >
                      <Trash2 size={11} /> Excluir membro
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-navy p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gold mb-3">Informação</p>
                  <p className="text-xs text-white/30 leading-relaxed">
                    O painel está integrado ao banco de dados via API. Alterações refletem em tempo real no site público.
                  </p>
                  {activeTab === "membros" && (
                    <p className="text-[9px] text-white/18 mt-3 font-bold">
                      Selecione um membro na lista para ver os detalhes.
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
