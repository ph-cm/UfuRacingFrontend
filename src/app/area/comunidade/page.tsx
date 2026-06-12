"use client";

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import Link from "next/link";
import {
  Send, Plus, X, MessageSquare, Users, Hash, Clock,
  Circle, ChevronRight,
} from "lucide-react";
import { useMemberAuth } from "@/context/MemberAuthContext";
import { useProject } from "@/context/ProjectContext";
import {
  getGeneralChat, sendGeneralMessage,
  getDMConversations, getOnlineMembers,
} from "@/services/community";
import { getThreads, createThread } from "@/services/forum";
import { FORUM_CATEGORIES } from "@/types/forum";
import type { ChatMessage, DMConversation, OnlineMember } from "@/types/community";
import type { ForumThread } from "@/types/forum";
import type { Member } from "@/types/member";

// ── Constants ─────────────────────────────────────────────────────────────────

const POLL_CHAT_MS     = 5_000;
const POLL_ONLINE_MS   = 30_000;

const CATEGORY_BADGE: Record<string, string> = {
  Geral:      "bg-navy/8 text-navy/50",
  Técnico:    "bg-crimson/8 text-crimson",
  Competição: "bg-gold/10 text-gold",
  Logística:  "bg-mist text-navy/40",
  Reuniões:   "bg-navy/5 text-navy/40",
};

type Tab = "chat" | "threads" | "mensagens";

// ── Small helpers ─────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60)    return "agora";
  if (s < 3600)  return `${Math.floor(s / 60)}min`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function Avatar({
  name, photoUrl, size = 8, online,
}: { name: string; photoUrl?: string | null; size?: number; online?: boolean }) {
  const cls = `w-${size} h-${size} shrink-0 flex items-center justify-center font-black text-white uppercase select-none`;
  return (
    <div className="relative shrink-0">
      {photoUrl
        ? <img src={photoUrl} alt={name} className={`${cls} object-cover`} />
        : <div className={`${cls} bg-navy`}>{name.charAt(0)}</div>
      }
      {online !== undefined && (
        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white ${online ? "bg-green-400" : "bg-navy/20"}`} />
      )}
    </div>
  );
}

// ── Chat message row ──────────────────────────────────────────────────────────

function ChatRow({
  msg, isMine, showHeader,
}: { msg: ChatMessage; isMine: boolean; showHeader: boolean }) {
  return (
    <div className={`flex gap-3 ${isMine ? "flex-row-reverse" : ""}`}>
      {/* Avatar — only on first of a group */}
      <div className="shrink-0 w-8">
        {showHeader && !isMine && (
          <Avatar name={msg.authorName} photoUrl={msg.authorPhotoUrl} size={8} />
        )}
      </div>

      <div className={`flex flex-col gap-0.5 max-w-[72%] ${isMine ? "items-end" : ""}`}>
        {showHeader && (
          <div className={`flex items-baseline gap-2 px-0.5 ${isMine ? "flex-row-reverse" : ""}`}>
            <span className="text-[10px] font-black text-navy uppercase">
              {isMine ? "Você" : msg.authorName}
            </span>
            <span className="text-[9px] text-navy/25">{timeAgo(msg.createdAt)}</span>
          </div>
        )}
        <div className={`px-4 py-2.5 text-sm leading-relaxed ${
          isMine
            ? "bg-navy text-white"
            : "bg-white border border-gray-100 text-navy"
        }`}>
          {msg.content}
        </div>
      </div>
    </div>
  );
}

// ── Input bar ─────────────────────────────────────────────────────────────────

function ChatInput({
  onSend, placeholder = "Escreva uma mensagem...", disabled,
}: { onSend: (text: string) => void; placeholder?: string; disabled?: boolean }) {
  const [value, setValue] = useState("");

  function submit() {
    const t = value.trim();
    if (!t) return;
    onSend(t);
    setValue("");
  }

  return (
    <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-t border-gray-100">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-mist border border-gray-100 text-navy text-sm px-4 py-2 focus:outline-none focus:border-navy/20 transition-colors placeholder:text-navy/25 disabled:opacity-40"
      />
      <button
        onClick={submit}
        disabled={!value.trim() || disabled}
        className="w-9 h-9 bg-crimson text-white flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-40 shrink-0"
      >
        <Send size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function TabBar({
  active, onChange, dmUnread,
}: { active: Tab; onChange: (t: Tab) => void; dmUnread: number }) {
  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "chat",      label: "Chat Geral", icon: Hash },
    { id: "threads",   label: "Threads",    icon: MessageSquare },
    { id: "mensagens", label: "Mensagens",  icon: Users },
  ];
  return (
    <div className="shrink-0 flex border-b border-gray-100 bg-white px-4">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] transition-colors border-b-2 -mb-px ${
            active === id
              ? "text-navy border-crimson"
              : "text-navy/30 border-transparent hover:text-navy/60"
          }`}
        >
          <Icon size={12} strokeWidth={2} />
          {label}
          {id === "mensagens" && dmUnread > 0 && (
            <span className="bg-crimson text-white text-[9px] font-black px-1.5 py-0.5 min-w-5 text-center">
              {dmUnread}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Online panel ──────────────────────────────────────────────────────────────

function OnlinePanel({
  members, onlineMap, currentMemberId,
}: { members: Member[]; onlineMap: Map<number, boolean>; currentMemberId: number }) {
  const sorted = useMemo(() => {
    return [...members]
      .filter((m) => m.id !== currentMemberId)
      .sort((a, b) => {
        const ao = onlineMap.get(a.id) ? 0 : 1;
        const bo = onlineMap.get(b.id) ? 0 : 1;
        return ao - bo || a.name.localeCompare(b.name);
      });
  }, [members, onlineMap, currentMemberId]);

  const onlineCount = [...onlineMap.values()].filter(Boolean).length;

  return (
    <aside className="w-52 shrink-0 border-l border-gray-100 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <div className="w-4 h-px bg-crimson" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/50">
          Online · {onlineCount}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {sorted.map((m) => {
          const isOnline = onlineMap.get(m.id) ?? false;
          return (
            <div key={m.id} className="group flex items-center gap-2.5 px-4 py-2 hover:bg-mist transition-colors">
              <Avatar name={m.name} photoUrl={m.photoUrl} size={7} online={isOnline} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-navy truncate leading-tight">{m.name}</p>
                <p className="text-[9px] text-navy/30 truncate">{isOnline ? "Online" : m.role}</p>
              </div>
              <Link
                href={`/area/comunidade/dm/${m.id}`}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-navy/30 hover:text-crimson"
                title={`Mensagem para ${m.name}`}
              >
                <ChevronRight size={13} />
              </Link>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

// ── Chat tab ──────────────────────────────────────────────────────────────────

function ChatTab({ token, memberId }: { token: string; memberId: number }) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | undefined>(undefined);

  const load = useCallback(async () => {
    try {
      const data = await getGeneralChat(token);
      setMsgs(data);
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  }, [token]);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_CHAT_MS);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    const last = msgs[msgs.length - 1];
    if (last && last.id !== lastIdRef.current) {
      lastIdRef.current = last.id;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs]);

  async function handleSend(text: string) {
    setSending(true);
    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      authorId: memberId,
      authorName: "Você",
      authorPhotoUrl: null,
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMsgs((prev) => [...prev, optimistic]);
    try {
      const sent = await sendGeneralMessage(token, text);
      setMsgs((prev) => prev.map((m) => (m.id === optimistic.id ? sent : m)));
    } catch {
      setMsgs((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-mist">
        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border border-navy/10 flex items-center justify-center mb-4">
              <Hash size={16} className="text-navy/20" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-black italic text-navy/30">Chat Geral</p>
            <p className="text-[10px] text-navy/20 mt-1 max-w-xs">
              Backend offline — endpoint <code className="font-mono">/community/chat/general</code> não encontrado.
            </p>
          </div>
        )}
        {!error && msgs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Hash size={24} className="text-navy/15 mb-3" strokeWidth={1.5} />
            <p className="text-xs font-black italic text-navy/25">Nenhuma mensagem ainda</p>
            <p className="text-[10px] text-navy/20 mt-1">Seja o primeiro a escrever</p>
          </div>
        )}
        {msgs.map((msg, i) => {
          const prev = msgs[i - 1];
          const showHeader = !prev || prev.authorId !== msg.authorId ||
            (new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime()) > 300_000;
          return (
            <ChatRow
              key={msg.id}
              msg={msg}
              isMine={msg.authorId === memberId}
              showHeader={showHeader}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={sending || !!error} placeholder="Mensagem para #geral..." />
    </div>
  );
}

// ── Threads tab ───────────────────────────────────────────────────────────────

function ThreadsTab({ token }: { token: string }) {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Geral", content: "" });
  const [submitting, setSubmitting] = useState(false);

  const inp = "w-full bg-mist border border-gray-100 text-navy text-sm px-4 py-2.5 focus:outline-none focus:border-navy/20 transition-colors placeholder:text-navy/25";

  useEffect(() => {
    setLoading(true);
    getThreads(token)
      .then(setThreads)
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    try {
      const t = await createThread(token, form);
      setThreads((prev) => [t, ...prev]);
      setShowModal(false);
      setForm({ title: "", category: "Geral", content: "" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Threads toolbar */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-4 h-px bg-crimson" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">
            {threads.length} threads
          </span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-crimson hover:text-red-700 transition-colors"
        >
          <Plus size={11} strokeWidth={2.5} /> Nova thread
        </button>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2 bg-mist">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-4 h-4 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && threads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare size={20} className="text-navy/15 mb-3" strokeWidth={1.5} />
            <p className="text-xs font-black italic text-navy/25">Nenhuma thread</p>
          </div>
        )}
        {threads.map((t) => (
          <Link
            key={t.id}
            href={`/area/forum/${t.id}`}
            className="group flex items-start gap-4 bg-white border border-gray-100 px-4 py-3.5 hover:border-gray-200 hover:shadow-sm transition-all"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-[9px] font-black uppercase tracking-[0.12em] px-2 py-0.5 ${CATEGORY_BADGE[t.category] ?? "bg-gray-100 text-navy/40"}`}>
                  {t.category}
                </span>
                <h3 className="text-sm font-black text-navy group-hover:text-crimson transition-colors leading-tight truncate">
                  {t.title}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] text-navy/30">{t.authorName}</span>
                <span className="text-[9px] text-navy/20 flex items-center gap-1">
                  <Clock size={8} />
                  {timeAgo(t.createdAt)}
                </span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-base font-black italic text-navy/20 leading-none">{t.replyCount}</p>
              <p className="text-[9px] text-navy/20 uppercase tracking-wider">replies</p>
            </div>
          </Link>
        ))}
      </div>

      {/* New thread modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-black text-navy uppercase tracking-wide">Nova Thread</h2>
              <button onClick={() => setShowModal(false)} className="text-navy/30 hover:text-navy">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-navy/40 mb-2">Título</label>
                <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={inp} placeholder="Título" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-navy/40 mb-2">Categoria</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={inp}>
                  {FORUM_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-navy/40 mb-2">Conteúdo</label>
                <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} className={`${inp} resize-none`} rows={4} required />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-100 text-[10px] font-bold uppercase tracking-widest text-navy/40 hover:bg-mist transition-colors">Cancelar</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-crimson text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 transition-colors">
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

// ── DMs tab ───────────────────────────────────────────────────────────────────

function MensagensTab({ token, members }: { token: string; members: Member[] }) {
  const [convos, setConvos] = useState<DMConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDMConversations(token)
      .then(setConvos)
      .catch(() => setConvos([]))
      .finally(() => setLoading(false));
  }, [token]);

  // Merge with members list for "start new DM" section
  const startable = useMemo(() => {
    const inConvo = new Set(convos.map((c) => c.memberId));
    return members.filter((m) => !inConvo.has(m.id)).slice(0, 8);
  }, [members, convos]);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2 bg-mist">
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-4 h-4 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Active conversations */}
      {convos.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-4 h-px bg-crimson" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-navy/30">Conversas</span>
          </div>
          {convos.map((c) => (
            <Link
              key={c.memberId}
              href={`/area/comunidade/dm/${c.memberId}`}
              className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-3 hover:border-gray-200 transition-colors"
            >
              <Avatar name={c.memberName} photoUrl={c.memberPhotoUrl} size={9} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs font-black text-navy truncate">{c.memberName}</p>
                  {c.lastMessageAt && (
                    <span className="text-[9px] text-navy/25 shrink-0">{timeAgo(c.lastMessageAt)}</span>
                  )}
                </div>
                {c.lastMessage && (
                  <p className="text-[10px] text-navy/35 truncate mt-0.5">{c.lastMessage}</p>
                )}
              </div>
              {c.unread > 0 && (
                <span className="shrink-0 bg-crimson text-white text-[9px] font-black px-1.5 py-0.5 min-w-5 text-center">
                  {c.unread}
                </span>
              )}
            </Link>
          ))}
        </>
      )}

      {/* Start new DM */}
      {startable.length > 0 && (
        <>
          <div className="flex items-center gap-3 mt-2 mb-1">
            <div className="w-4 h-px bg-navy/15" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-navy/25">Iniciar conversa</span>
          </div>
          {startable.map((m) => (
            <Link
              key={m.id}
              href={`/area/comunidade/dm/${m.id}`}
              className="flex items-center gap-3 bg-white border border-gray-100 border-dashed px-4 py-3 hover:border-gray-200 hover:border-solid transition-all"
            >
              <Avatar name={m.name} photoUrl={m.photoUrl} size={8} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-navy/60 truncate">{m.name}</p>
                <p className="text-[9px] text-navy/30 truncate">{m.role}</p>
              </div>
              <ChevronRight size={13} className="text-navy/20 shrink-0" />
            </Link>
          ))}
        </>
      )}

      {!loading && convos.length === 0 && startable.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users size={20} className="text-navy/15 mb-3" strokeWidth={1.5} />
          <p className="text-xs font-black italic text-navy/25">Nenhuma mensagem</p>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ComunidadePage() {
  const { member } = useMemberAuth();
  const { members } = useProject();
  const [tab, setTab] = useState<Tab>("chat");
  const [onlineMap, setOnlineMap] = useState<Map<number, boolean>>(new Map());
  const [dmConvos, setDmConvos] = useState<DMConversation[]>([]);
  const [showOnline, setShowOnline] = useState(true);

  // Poll online status
  const loadOnline = useCallback(async () => {
    if (!member) return;
    try {
      const data = await getOnlineMembers(member.token);
      setOnlineMap(new Map(data.map((o) => [o.memberId, o.online])));
    } catch {}
  }, [member]);

  useEffect(() => {
    loadOnline();
    const id = setInterval(loadOnline, POLL_ONLINE_MS);
    return () => clearInterval(id);
  }, [loadOnline]);

  // DM unread count
  useEffect(() => {
    if (!member) return;
    getDMConversations(member.token).then(setDmConvos).catch(() => {});
  }, [member]);

  const dmUnread = dmConvos.reduce((acc, c) => acc + c.unread, 0);
  const onlineCount = [...onlineMap.values()].filter(Boolean).length;

  if (!member) return null;

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-crimson mb-1">
            Área do Membro
          </p>
          <h1 className="text-lg font-black italic text-navy uppercase leading-none">Comunidade</h1>
        </div>
        {/* Mobile online toggle */}
        <button
          onClick={() => setShowOnline((v) => !v)}
          className="md:hidden flex items-center gap-2 text-[10px] font-bold text-navy/40 hover:text-navy transition-colors"
        >
          <Circle size={8} className="text-green-400 fill-green-400" />
          {onlineCount} online
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <TabBar active={tab} onChange={setTab} dmUnread={dmUnread} />

          {/* Tab content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {tab === "chat"      && <ChatTab token={member.token} memberId={member.id} />}
            {tab === "threads"   && <ThreadsTab token={member.token} />}
            {tab === "mensagens" && (
              <MensagensTab token={member.token} members={members.filter((m) => m.id !== member.id)} />
            )}
          </div>
        </div>

        {/* Online panel — desktop always, mobile toggleable */}
        {(showOnline || true) && (
          <div className="hidden md:flex">
            <OnlinePanel
              members={members}
              onlineMap={onlineMap}
              currentMemberId={member.id}
            />
          </div>
        )}
      </div>
    </div>
  );
}
