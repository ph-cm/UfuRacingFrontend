"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemberAuth } from "@/context/MemberAuthContext";
import Mascot from "@/components/Mascot";

export default function LoginPage() {
  const { login, member } = useMemberAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) router.replace("/area/agente");
  }, [member, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.replace("/area/agente");
    } catch (err: any) {
      setError(err.message || "Credenciais inválidas. Verifique seu e-mail e senha.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-crimson/60 transition-colors placeholder:text-white/20";

  return (
    <div className="min-h-screen bg-carbon flex flex-col">
      {/* Topbar */}
      <div className="px-8 py-5 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="block w-0.5 h-5 bg-crimson" />
          <span className="text-white font-black text-sm tracking-tight uppercase select-none">
            UFU<span className="text-crimson">Racing</span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 hover:text-white/60 transition-colors"
        >
          ← Voltar ao site
        </Link>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          {/* Mascot */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Mascot size={72} />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-carbon" />
            </div>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-crimson mb-2 text-center">
            Turing · Área do Membro
          </p>
          <h1 className="text-2xl font-black italic text-white uppercase text-center mb-1">
            Acesso Restrito
          </h1>
          <p className="text-white/30 text-xs text-center mb-8">
            Exclusivo para membros da equipe UFU Racing
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={inputCls}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={inputCls}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-crimson/10 border border-crimson/30 px-4 py-2.5">
                <p className="text-crimson text-xs font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-crimson text-white text-[11px] font-black uppercase tracking-[0.18em] py-3.5 hover:bg-red-700 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
