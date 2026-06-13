"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getNews, type NewsItem } from "@/services/api";
import BackButton from "@/components/BackButton";

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    setLoading(true);
    setError(null);

    getNews()
      .then((data) => {
        if (!alive) return;
        setNews(Array.isArray(data) ? data : []);
      })
      .catch((err: unknown) => {
        console.error("Erro ao carregar notícias:", err);
        if (!alive) return;
        setError("Notícias não encontradas (ou API fora do ar).");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-20 px-6 max-w-7xl mx-auto space-y-8">
        {/* ✅ BACKBUTTON sempre visível */}
        <div className="mb-2">
          <BackButton fallbackHref="/" label="Home" alwaysFallback/>
        </div>

        <div className="w-48 h-10 bg-gray-200 rounded-full animate-pulse mb-12" />
        <div className="grid md:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          {/* ✅ BACKBUTTON no erro também */}
          <div className="flex justify-center mb-6">
            <BackButton fallbackHref="/" label="Home" alwaysFallback/>
          </div>

          <h2 className="text-2xl font-black italic text-racing-red">{error}</h2>
          <p className="text-gray-500 mt-2">
            Confere se o backend está rodando e se o NEXT_PUBLIC_API_URL está correto.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => location.reload()}
              className="bg-racing-red text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest"
            >
              Tentar novamente
            </button>
            <Link
              href="/"
              className="bg-racing-blue text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest"
            >
              Voltar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="min-h-screen bg-white py-20 px-6 max-w-7xl mx-auto">
        {/* ✅ BACKBUTTON no vazio */}
        <div className="mb-6">
          <BackButton fallbackHref="/" label="Home" alwaysFallback/>
        </div>

        <h1 className="text-4xl font-black italic text-racing-blue mb-6">Notícias</h1>
        <p className="text-gray-500">Ainda não há notícias publicadas.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20 px-6 max-w-7xl mx-auto">
      {/* ✅ BACKBUTTON no normal */}
      <div className="mb-6">
        <BackButton fallbackHref="/" label="Home" alwaysFallback/>
      </div>

      <h1 className="text-4xl font-black italic text-racing-blue mb-12">
        Notícias
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {news.map((item, index) => (
          <Link key={item.id} href={`/news/${item.slug}`} className="group">
            <article
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:-translate-y-2 transition-all duration-300 cursor-pointer opacity-0 animate-[fadeIn_.45s_ease-out_forwards]"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 bg-linear-to-br flex items-center justify-center">
                    <span className="text-gray-300 text-4xl font-black italic">UFU</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-racing-blue mb-2 line-clamp-2">
                  {item.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {item.summary}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-racing-red font-black text-[10px] uppercase tracking-widest group-hover:text-racing-blue transition-colors">
                    Ler mais →
                  </span>

                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {new Date(item.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* animação inline (sem mexer em tailwind.config) */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}