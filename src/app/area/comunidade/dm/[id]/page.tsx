"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Circle } from "lucide-react";
import { useMemberAuth } from "@/context/MemberAuthContext";
import { useProject } from "@/context/ProjectContext";
import { getDMMessages, sendDMMessage, getOnlineMembers } from "@/services/community";
import type { ChatMessage } from "@/types/community";
import type { Member } from "@/types/member";

const POLL_MS = 5_000;

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60)    return "agora";
  if (s < 3600)  return `${Math.floor(s / 60)}min`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function Avatar({ member }: { member: Member }) {
  if (member.photoUrl) {
    return (
      <img
        src={member.photoUrl}
        alt={member.name}
        className="w-8 h-8 object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-8 h-8 bg-navy flex items-center justify-center shrink-0">
      <span className="text-white text-xs font-black">{member.name.charAt(0)}</span>
    </div>
  );
}

function ChatRow({
  msg, isMine, showHeader, otherMember,
}: {
  msg: ChatMessage;
  isMine: boolean;
  showHeader: boolean;
  otherMember: Member;
}) {
  return (
    <div className={`flex gap-3 ${isMine ? "flex-row-reverse" : ""}`}>
      <div className="shrink-0 w-8">
        {showHeader && !isMine && <Avatar member={otherMember} />}
      </div>

      <div className={`flex flex-col gap-0.5 max-w-[72%] ${isMine ? "items-end" : ""}`}>
        {showHeader && (
          <div className={`flex items-baseline gap-2 px-0.5 ${isMine ? "flex-row-reverse" : ""}`}>
            <span className="text-[10px] font-black text-navy uppercase">
              {isMine ? "Você" : otherMember.name}
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

export default function DMPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router  = useRouter();
  const { member }  = useMemberAuth();
  const { members } = useProject();

  const otherMember = members.find((m) => m.id === Number(id));

  const [msgs, setMsgs]       = useState<ChatMessage[]>([]);
  const [input, setInput]     = useState("");
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [error, setError]     = useState("");
  const bottomRef             = useRef<HTMLDivElement>(null);
  const lastIdRef             = useRef<string | undefined>(undefined);

  const load = useCallback(async () => {
    if (!member || !id) return;
    try {
      const data = await getDMMessages(member.token, Number(id));
      setMsgs(data);
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  }, [member, id]);

  useEffect(() => {
    load();
    const poll = setInterval(load, POLL_MS);
    return () => clearInterval(poll);
  }, [load]);

  // Online status
  useEffect(() => {
    if (!member || !id) return;
    getOnlineMembers(member.token)
      .then((list) => {
        const entry = list.find((o) => o.memberId === Number(id));
        setIsOnline(entry?.online ?? false);
      })
      .catch(() => {});
  }, [member, id]);

  useEffect(() => {
    const last = msgs[msgs.length - 1];
    if (last && last.id !== lastIdRef.current) {
      lastIdRef.current = last.id;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs]);

  async function handleSend() {
    const text = input.trim();
    if (!text || !member || !id) return;
    setSending(true);
    setInput("");

    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      authorId: member.id,
      authorName: member.name,
      authorPhotoUrl: member.photoUrl ?? null,
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMsgs((prev) => [...prev, optimistic]);

    try {
      const sent = await sendDMMessage(member.token, Number(id), text);
      setMsgs((prev) => prev.map((m) => (m.id === optimistic.id ? sent : m)));
    } catch {
      setMsgs((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  if (!member) return null;

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-navy/30 hover:text-navy transition-colors"
        >
          <ArrowLeft size={16} />
        </button>

        {otherMember && (
          <>
            <div className="relative shrink-0">
              <Avatar member={otherMember} />
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white ${isOnline ? "bg-green-400" : "bg-navy/20"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-navy uppercase leading-tight">{otherMember.name}</p>
              <p className="text-[10px] text-navy/30 flex items-center gap-1.5 mt-0.5">
                <Circle size={6} className={isOnline ? "fill-green-400 text-green-400" : "fill-navy/20 text-navy/20"} />
                {isOnline ? "Online agora" : otherMember.role}
              </p>
            </div>
          </>
        )}

        {!otherMember && (
          <p className="text-sm font-black text-navy uppercase">Chat Privado</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 bg-mist">
        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-xs font-black italic text-navy/30 mb-1">Backend offline</p>
            <p className="text-[10px] text-navy/20">
              Endpoint <code className="font-mono">/community/dm/{id}</code> não encontrado.
            </p>
          </div>
        )}
        {!error && msgs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-xs font-black italic text-navy/25">
              Início da conversa com {otherMember?.name ?? "este membro"}
            </p>
            <p className="text-[10px] text-navy/20 mt-1">Nenhuma mensagem ainda</p>
          </div>
        )}

        {msgs.map((msg, i) => {
          const isMine = msg.authorId === member.id;
          const prev   = msgs[i - 1];
          const showHeader =
            !prev ||
            prev.authorId !== msg.authorId ||
            new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() > 300_000;

          return otherMember ? (
            <ChatRow
              key={msg.id}
              msg={msg}
              isMine={isMine}
              showHeader={showHeader}
              otherMember={otherMember}
            />
          ) : null;
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-t border-gray-100">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={otherMember ? `Mensagem para ${otherMember.name}...` : "Escreva uma mensagem..."}
          disabled={sending || !!error}
          className="flex-1 bg-mist border border-gray-100 text-navy text-sm px-4 py-2 focus:outline-none focus:border-navy/20 transition-colors placeholder:text-navy/25 disabled:opacity-40"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending || !!error}
          className="w-9 h-9 bg-crimson text-white flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-40 shrink-0"
        >
          <ArrowLeft size={14} className="rotate-180" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
