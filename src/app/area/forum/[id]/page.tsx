"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Send } from "lucide-react";
import { useMemberAuth } from "@/context/MemberAuthContext";
import { getThread, createPost } from "@/services/forum";
import type { ForumThread, ForumPost } from "@/types/forum";

const CATEGORY_COLORS: Record<string, string> = {
  Geral: "bg-navy/8 text-navy/50",
  Técnico: "bg-crimson/8 text-crimson",
  Competição: "bg-gold/10 text-amber-700",
  Logística: "bg-green-50 text-green-700",
  Reuniões: "bg-purple-50 text-purple-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Avatar({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  if (photoUrl) {
    return <img src={photoUrl} alt={name} className="w-9 h-9 rounded-full object-cover border border-gray-100" />;
  }
  return (
    <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center shrink-0">
      <span className="text-white text-xs font-black">{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

function PostCard({ post, isOriginal = false }: { post: ForumPost; isOriginal?: boolean }) {
  return (
    <div className={`bg-white border flex gap-4 p-5 ${isOriginal ? "border-crimson/20" : "border-gray-100"}`}>
      <Avatar name={post.authorName} photoUrl={post.authorPhotoUrl} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-xs font-black text-navy uppercase">{post.authorName}</span>
          {isOriginal && (
            <span className="text-[9px] font-black uppercase tracking-[0.12em] bg-crimson/8 text-crimson px-1.5 py-0.5">
              OP
            </span>
          )}
          <span className="text-[10px] text-navy/25 flex items-center gap-1 ml-auto">
            <Clock size={9} />
            {formatDate(post.createdAt)}
          </span>
        </div>
        <p className="text-sm text-navy/70 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>
    </div>
  );
}

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const { member } = useMemberAuth();
  const router = useRouter();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!member || !id) return;
    setLoading(true);
    try {
      const data = await getThread(member.token, Number(id));
      setThread(data.thread);
      setPosts(data.posts);
    } catch {
      setThread(null);
    } finally {
      setLoading(false);
    }
  }, [member, id]);

  useEffect(() => { load(); }, [load]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!member || !thread || !reply.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const post = await createPost(member.token, thread.id, reply.trim());
      setPosts((prev) => [...prev, post]);
      setThread((t) => t ? { ...t, replyCount: t.replyCount + 1 } : t);
      setReply("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar resposta.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-5 h-5 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-navy font-black text-sm mb-2">Thread não encontrada</p>
        <button onClick={() => router.back()} className="text-crimson text-xs font-bold hover:underline">
          ← Voltar ao fórum
        </button>
      </div>
    );
  }

  // Build post list: original post as first "post" + replies
  const originalPost: ForumPost = {
    id: 0,
    threadId: thread.id,
    authorId: thread.authorId,
    authorName: thread.authorName,
    authorPhotoUrl: thread.authorPhotoUrl,
    content: thread.content,
    createdAt: thread.createdAt,
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-navy/35 hover:text-navy/70 transition-colors mb-3"
        >
          <ArrowLeft size={12} />
          Fórum
        </button>

        <div className="flex items-start gap-3 flex-wrap">
          <span className={`text-[9px] font-black uppercase tracking-[0.12em] px-2 py-0.5 shrink-0 ${CATEGORY_COLORS[thread.category] ?? "bg-gray-100 text-navy/40"}`}>
            {thread.category}
          </span>
          <h1 className="text-base font-black text-navy uppercase leading-tight">{thread.title}</h1>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] text-navy/30 font-bold">{thread.authorName}</span>
          <span className="text-[10px] text-navy/20 flex items-center gap-1">
            <Clock size={9} />
            {formatDate(thread.createdAt)}
          </span>
          <span className="text-[10px] text-navy/20 ml-auto">
            {thread.replyCount} {thread.replyCount === 1 ? "resposta" : "respostas"}
          </span>
        </div>
      </div>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
        <PostCard post={originalPost} isOriginal />

        {posts.length > 0 && (
          <>
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-navy/25">
                {posts.length} {posts.length === 1 ? "resposta" : "respostas"}
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      <div className="shrink-0 bg-white border-t border-gray-100 px-6 py-4">
        <form onSubmit={handleReply} className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            {member && <Avatar name={member.name} photoUrl={member.photoUrl} />}
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Escreva sua resposta..."
              rows={3}
              className="flex-1 resize-none bg-gray-50 border border-gray-100 text-navy text-sm px-4 py-2.5 focus:outline-none focus:border-navy/20 transition-colors placeholder:text-navy/25"
            />
          </div>

          {error && <p className="text-crimson text-xs font-bold">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !reply.trim()}
              className="flex items-center gap-2 bg-crimson text-white text-[10px] font-black uppercase tracking-[0.15em] px-5 py-2.5 hover:bg-red-700 transition-colors disabled:opacity-40"
            >
              <Send size={11} strokeWidth={2.5} />
              {submitting ? "Enviando..." : "Responder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
