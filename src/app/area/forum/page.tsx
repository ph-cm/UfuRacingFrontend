"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, MessageSquare, Clock, Pin, X } from "lucide-react";
import { useMemberAuth } from "@/context/MemberAuthContext";
import { getThreads, createThread } from "@/services/forum";
import { FORUM_CATEGORIES } from "@/types/forum";
import type { ForumThread } from "@/types/forum";

const CATEGORY_COLORS: Record<string, string> = {
  Geral: "bg-navy/8 text-navy/50",
  Técnico: "bg-crimson/8 text-crimson",
  Competição: "bg-gold/10 text-amber-700",
  Logística: "bg-green-50 text-green-700",
  Reuniões: "bg-purple-50 text-purple-700",
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function ThreadCard({ thread }: { thread: ForumThread }) {
  return (
    <Link
      href={`/area/forum/${thread.id}`}
      className="group flex items-start gap-4 bg-white border border-gray-100 px-5 py-4 hover:border-gray-200 hover:shadow-sm transition-all"
    >
      {/* Icon */}
      <div className="shrink-0 w-10 h-10 bg-mist border border-gray-100 flex items-center justify-center group-hover:border-gray-200 transition-colors">
        <MessageSquare size={16} className="text-navy/30" strokeWidth={1.75} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            {thread.pinned && (
              <Pin size={10} className="text-gold shrink-0" fill="currentColor" />
            )}
            <h3 className="text-sm font-black text-navy group-hover:text-crimson transition-colors leading-tight">
              {thread.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-[9px] font-black uppercase tracking-[0.12em] px-2 py-0.5 ${CATEGORY_COLORS[thread.category] ?? "bg-gray-100 text-navy/40"}`}>
            {thread.category}
          </span>
          <span className="text-[10px] text-navy/30 font-bold">{thread.authorName}</span>
          <span className="text-[10px] text-navy/20 flex items-center gap-1">
            <Clock size={9} />
            {timeAgo(thread.createdAt)}
          </span>
        </div>

        {thread.content && (
          <p className="text-xs text-navy/40 mt-1.5 line-clamp-1">{thread.content}</p>
        )}
      </div>

      {/* Reply count */}
      <div className="shrink-0 text-right">
        <p className="text-lg font-black italic text-navy/20 leading-none">{thread.replyCount}</p>
        <p className="text-[9px] font-bold text-navy/20 uppercase tracking-wider">
          {thread.replyCount === 1 ? "reply" : "replies"}
        </p>
      </div>
    </Link>
  );
}

export default function ForumPage() {
  const { member } = useMemberAuth();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Geral", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!member) return;
    setLoading(true);
    try {
      const data = await getThreads(member.token, activeCategory);
      setThreads(data);
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [member, activeCategory]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!member || !form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const thread = await createThread(member.token, form);
      setThreads((prev) => [thread, ...prev]);
      setShowModal(false);
      setForm({ title: "", category: "Geral", content: "" });
    } catch (err: any) {
      setError(err.message || "Erro ao criar thread.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full bg-gray-50 border border-gray-100 text-navy text-sm px-4 py-2.5 focus:outline-none focus:border-navy/20 transition-colors placeholder:text-navy/25";

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-black text-navy uppercase tracking-wide">Fórum da Equipe</h1>
          <p className="text-[10px] text-navy/30 font-bold uppercase tracking-widest mt-0.5">
            Discussões internas · UFU Racing
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-crimson text-white text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2.5 hover:bg-red-700 transition-colors"
        >
          <Plus size={12} strokeWidth={2.5} />
          Nova Thread
        </button>
      </div>

      {/* Category filter */}
      <div className="shrink-0 bg-white border-b border-gray-100">
        <div className="px-6 flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {["Todos", ...FORUM_CATEGORIES].map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] transition-all ${
                  active ? "bg-navy text-white" : "text-navy/40 hover:text-navy hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-5 h-5 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 border border-navy/10 flex items-center justify-center mb-4">
              <MessageSquare size={20} className="text-navy/20" strokeWidth={1.5} />
            </div>
            <h2 className="text-sm font-black italic text-navy mb-1">Nenhuma thread ainda</h2>
            <p className="text-navy/35 text-xs">Seja o primeiro a abrir uma discussão.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Pinned first */}
            {threads.filter((t) => t.pinned).map((t) => <ThreadCard key={t.id} thread={t} />)}
            {threads.filter((t) => !t.pinned).map((t) => <ThreadCard key={t.id} thread={t} />)}
          </div>
        )}
      </div>

      {/* New Thread Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-black text-navy uppercase tracking-wide">Nova Thread</h2>
              <button onClick={() => setShowModal(false)} className="text-navy/30 hover:text-navy transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-navy/40 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className={inputCls}
                  placeholder="Título da discussão"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-navy/40 mb-2">
                  Categoria
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className={inputCls}
                >
                  {FORUM_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-navy/40 mb-2">
                  Conteúdo
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  className={`${inputCls} resize-none`}
                  rows={5}
                  placeholder="Descreva o assunto da discussão..."
                  required
                />
              </div>

              {error && <p className="text-crimson text-xs font-bold">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-100 text-[10px] font-black uppercase tracking-[0.15em] text-navy/50 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-crimson text-white text-[10px] font-black uppercase tracking-[0.15em] hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Publicando..." : "Publicar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
