"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { useMemberAuth } from "@/context/MemberAuthContext";
import { sendMessage, uploadFile } from "@/services/agent";
import Mascot from "@/components/Mascot";
import type { AgentMessage, AgentAttachment } from "@/types/agent";

const WELCOME: AgentMessage = {
  id: "welcome",
  role: "agent",
  content:
    "Olá! Sou o **Turing**, agente de inteligência artificial da UFU Racing. Posso te ajudar com as regras da SAE, análise de documentos técnicos, imagens do protótipo e muito mais. Como posso ajudar?",
  timestamp: new Date().toISOString(),
};

const SUGGESTIONS = [
  "Quais são os requisitos de segurança da SAE?",
  "Explique o regulamento de chassi 2024.",
  "Analise este documento técnico.",
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-navy/30 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: AgentMessage }) {
  const isAgent = msg.role === "agent";
  const content = msg.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  return (
    <div className={`flex gap-3 ${isAgent ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      {isAgent ? (
        <div className="shrink-0 mt-1">
          <Mascot size={32} />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center shrink-0 mt-1">
          <span className="text-white text-xs font-black">V</span>
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[75%] ${isAgent ? "" : "items-end"}`}>
        {/* Attachments */}
        {msg.attachments?.map((att, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-3 py-2 border text-xs font-bold ${
              isAgent
                ? "bg-white border-gray-100 text-navy/60"
                : "bg-crimson/10 border-crimson/20 text-crimson"
            }`}
          >
            {att.type === "image" ? (
              <ImageIcon size={12} strokeWidth={1.75} />
            ) : (
              <FileText size={12} strokeWidth={1.75} />
            )}
            {att.name}
          </div>
        ))}

        {/* Text bubble */}
        <div
          className={`px-4 py-3 text-sm leading-relaxed ${
            isAgent
              ? "bg-white border border-gray-100 text-navy shadow-sm"
              : "bg-navy text-white"
          }`}
        >
          {msg.loading ? (
            <TypingDots />
          ) : (
            <span dangerouslySetInnerHTML={{ __html: content }} />
          )}
        </div>

        <span className="text-[10px] text-navy/25 px-1">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  );
}

export default function AgentePage() {
  const { member } = useMemberAuth();
  const [messages, setMessages] = useState<AgentMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [pendingAttachment, setPendingAttachment] = useState<AgentAttachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text && !pendingAttachment) return;
    if (!member) return;
    setSending(true);

    const userMsg: AgentMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      attachments: pendingAttachment ? [pendingAttachment] : undefined,
      timestamp: new Date().toISOString(),
    };

    const loadingMsg: AgentMessage = {
      id: crypto.randomUUID(),
      role: "agent",
      content: "",
      loading: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setPendingAttachment(null);

    try {
      const res = await sendMessage(member.token, text, sessionId, pendingAttachment?.fileId);
      setSessionId(res.session_id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id ? { ...m, content: res.reply, loading: false } : m
        )
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? {
                ...m,
                content: `Erro ao conectar com o agente: ${err.message}. Verifique se o backend está online.`,
                loading: false,
              }
            : m
        )
      );
    } finally {
      setSending(false);
    }
  }, [input, pendingAttachment, member, sessionId]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !member) return;
    e.target.value = "";
    setUploading(true);
    try {
      const uploaded = await uploadFile(member.token, file);
      setPendingAttachment({
        name: file.name,
        type: uploaded.type,
        fileId: uploaded.file_id,
        previewUrl: uploaded.type === "image" ? URL.createObjectURL(file) : undefined,
      });
    } catch {
      setPendingAttachment({ name: file.name, type: file.type.startsWith("image/") ? "image" : "document" });
    } finally {
      setUploading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const userInitial = member?.name.charAt(0).toUpperCase() ?? "M";
  const showWelcome = messages.length === 1;

  return (
    <div className="flex flex-col h-full bg-mist">

      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Mascot size={36} />
        <div>
          <h1 className="text-sm font-black text-navy uppercase tracking-wide leading-tight">Turing</h1>
          <p className="text-[10px] text-navy/40 font-bold uppercase tracking-widest">
            Agente IA · SAE Formula Rules
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-[10px] font-bold text-navy/30 uppercase tracking-wider">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">

        {/* Welcome suggestions */}
        {showWelcome && (
          <div className="flex flex-col items-center gap-4 py-4 mb-2">
            <Mascot size={56} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/30">
              Sugestões para começar
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                  className="px-4 py-2 bg-white border border-gray-100 text-navy/60 text-xs font-bold hover:border-navy/20 hover:text-navy transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={{
              ...msg,
              content: msg.role === "user" && msg.content === "" ? "" : msg.content,
            }}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 bg-white border-t border-gray-100 px-4 py-3">

        {/* Attachment preview */}
        {pendingAttachment && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="flex items-center gap-2 bg-navy/5 border border-navy/10 px-3 py-1.5 text-xs font-bold text-navy/60">
              {pendingAttachment.type === "image" ? (
                <ImageIcon size={12} strokeWidth={1.75} />
              ) : (
                <FileText size={12} strokeWidth={1.75} />
              )}
              {pendingAttachment.name}
            </div>
            <button
              onClick={() => setPendingAttachment(null)}
              className="text-navy/30 hover:text-navy/60 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-3">
          {/* File upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="shrink-0 w-10 h-10 flex items-center justify-center text-navy/30 hover:text-navy/60 transition-colors disabled:opacity-40 border border-gray-100 hover:border-gray-200"
            title="Anexar arquivo ou imagem"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-navy/30 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Paperclip size={16} strokeWidth={1.75} />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte ao Turing sobre as regras SAE, documentos, imagens..."
            rows={1}
            className="flex-1 resize-none bg-gray-50 border border-gray-100 text-navy text-sm px-4 py-2.5 focus:outline-none focus:border-navy/20 transition-colors placeholder:text-navy/25 max-h-32 leading-relaxed"
            style={{ height: "auto" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
            }}
          />

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={sending || (!input.trim() && !pendingAttachment)}
            className="shrink-0 w-10 h-10 flex items-center justify-center bg-crimson text-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={15} strokeWidth={2} />
          </button>
        </div>

        <p className="text-[9px] text-navy/20 text-center mt-2 font-bold uppercase tracking-wider">
          Enter para enviar · Shift+Enter para quebra de linha
        </p>
      </div>
    </div>
  );
}
