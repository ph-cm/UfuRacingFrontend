"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getNewsBySlug, type NewsDetail } from "@/services/api";
import BackButton from "@/components/BackButton";

function isValidSlug(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export default function NewsDetailPage() {
  const params = useParams();

  const slugParam = useMemo(() => {
    const raw = (params as { id?: string | string[] })?.id; // seu folder é [id], mas aqui é SLUG
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    if (!isValidSlug(slugParam)) {
      setLoading(false);
      setError("Slug inválido.");
      return;
    }

    setLoading(true);
    setError(null);
    setNews(null);

    getNewsBySlug(slugParam)
      .then((data) => {
        if (!alive) return;
        setNews(data);
      })
      .catch((err: unknown) => {
        console.error("Erro ao carregar detalhes:", err);
        if (!alive) return;
        setError("Notícia não encontrada (ou API fora do ar).");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [slugParam]);

  // --- o resto do teu componente pode ficar igual ---
  if (loading) {
    return (
      <div className="min-h-screen bg-white animate-pulse">
        <div className="w-full h-[520px] bg-gray-200" />
        <div className="max-w-4xl mx-auto px-6 py-16 space-y-6">
          <div className="h-12 bg-gray-200 rounded-xl w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="space-y-4 mt-8">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-xl">
          <h2 className="text-3xl font-black italic text-racing-red">
            {error ?? "Notícia não encontrada."}
          </h2>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => location.reload()}
              className="bg-racing-red text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest"
            >
              Tentar novamente
            </button>

            <Link
              href="/news"
              className="bg-racing-blue text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest"
            >
              Voltar para notícias
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const dateLabel = new Date(news.created_at).toLocaleDateString("pt-BR");

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full h-[520px] relative overflow-hidden">
        <img
          src={news.image || "/placeholder.jpg"}
          alt={news.title}
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-black/10" />

        <div className="absolute top-6 left-6 z-10">
          <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-xl hover:bg-white transition">
            <BackButton fallbackHref="/news" label="Notícias" alwaysFallback />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16 -mt-32 relative z-10">
        <article className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-10 md:p-14">
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black italic text-racing-blue leading-tight">
              {news.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.25em]">
                {dateLabel}
              </span>

              {news.category ? (
                <span className="text-[10px] font-black uppercase tracking-widest text-racing-blue bg-gray-100 px-3 py-1 rounded-full">
                  {news.category}
                </span>
              ) : null}

              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                {news.author || "UFU Racing"}
              </span>
            </div>
          </header>

          <div className="prose max-w-none text-gray-700 leading-relaxed text-lg">
            {news.content}
          </div>
        </article>
      </div>
    </div>
  );
}