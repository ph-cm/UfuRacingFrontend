"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, ChevronRight, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createSponsorContact } from "@/services/api";

// ── Animation ──────────────────────────────────────────────────────
const fadeUp = {
  initial:     { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: "-50px" },
  transition:  { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const },
};

// ── Tier data ──────────────────────────────────────────────────────
interface Tier {
  name: string;
  tag: string;
  highlight: boolean;
  benefits: string[];
}

const tiers: Tier[] = [
  {
    name: "Apoiador",
    tag: "Entrada",
    highlight: false,
    benefits: [
      "Logo no site oficial da equipe",
      "Menção nas redes sociais",
      "Certificado digital de parceria",
      "Acesso ao relatório de impacto",
    ],
  },
  {
    name: "Parceiro",
    tag: "Popular",
    highlight: false,
    benefits: [
      "Tudo do nível Apoiador",
      "Logo nos uniformes da equipe",
      "Post dedicado nas redes sociais",
      "Presença em eventos locais",
      "Relatório semestral de impacto",
    ],
  },
  {
    name: "Patrocinador",
    tag: "Recomendado",
    highlight: true,
    benefits: [
      "Tudo do nível Parceiro",
      "Logo em destaque no monoposto",
      "Presença em competições nacionais",
      "Visita técnica à oficina da equipe",
      "Conteúdo técnico co-branded",
      "Relatório detalhado com métricas",
    ],
  },
  {
    name: "Master",
    tag: "Premium",
    highlight: false,
    benefits: [
      "Tudo do nível Patrocinador",
      "Logo principal no carro e capacete",
      "Naming rights da temporada",
      "Reuniões periódicas com a diretoria",
      "Relatório técnico customizado",
      "Acesso exclusivo a eventos internos",
    ],
  },
];

// ── Value propositions ─────────────────────────────────────────────
const valueProps = [
  {
    title: "Visibilidade técnica",
    desc:  "Sua marca presente em competições nacionais de engenharia universitária, com cobertura de mídia especializada e alcance no setor de tecnologia e indústria.",
  },
  {
    title: "Associação institucional",
    desc:  "Vincule sua empresa à formação dos próximos engenheiros do Brasil. A UFU está entre as principais universidades do país em engenharia.",
  },
  {
    title: "Retorno mensurável",
    desc:  "Relatórios de impacto com métricas reais: impressões, alcance digital, presença em eventos e dados de engajamento da comunidade técnica.",
  },
];

// ── Metrics ────────────────────────────────────────────────────────
const metrics = [
  { value: "40+",  label: "Membros Ativos"         },
  { value: "10+",  label: "Anos de Competição"      },
  { value: "6",    label: "Áreas Técnicas"          },
  { value: "100%", label: "Universitário"           },
];

// ── Component ──────────────────────────────────────────────────────
export default function SponsorsPage() {
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "", message: "",
  });
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.company || !form.email) {
      setError("Preencha Nome, Empresa e E-mail.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await createSponsorContact(form);
      setSent(true);
    } catch {
      setError("Erro ao enviar. Tente novamente ou entre em contato por e-mail.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Navbar />

      <main>

        {/* ══ 1. HERO ══════════════════════════════════════════════ */}
        <section className="relative bg-carbon pt-40 pb-28 overflow-hidden">
          {/* Subtle background grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-carbon via-carbon/80 to-carbon" aria-hidden />

          <div className="relative max-w-7xl mx-auto px-6 md:px-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Link
                  href="/"
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 hover:text-white/60 transition-colors"
                >
                  Home
                </Link>
                <ChevronRight size={10} className="text-white/15" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Patrocinadores
                </span>
              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-crimson mb-5">
                Parcerias &amp; Patrocínio
              </p>
              <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase leading-[0.9] tracking-tight mb-6 max-w-3xl">
                Acelere com a UFU Racing.
              </h1>
              <p className="text-white/45 text-lg leading-relaxed max-w-xl">
                Associe sua marca a uma equipe universitária de engenharia de alto desempenho
                presente nas principais competições Formula SAE do país.
              </p>

              <div className="flex flex-wrap gap-4 mt-10">
                <a href="#cotas">
                  <span className="inline-flex items-center gap-2 bg-crimson text-white text-[11px] font-black uppercase tracking-[0.15em] px-7 py-3.5 hover:bg-red-700 transition-colors cursor-pointer group">
                    Ver cotas
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </a>
                <a href="#contato">
                  <span className="inline-flex items-center gap-2 border border-white/20 text-white/70 text-[11px] font-black uppercase tracking-[0.15em] px-7 py-3.5 hover:bg-white/5 hover:text-white transition-all cursor-pointer">
                    Entrar em contato
                  </span>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ 2. METRICS ═══════════════════════════════════════════ */}
        <section className="bg-navy">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8">
              {metrics.map((m, i) => (
                <motion.div
                  key={i}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.07 }}
                  className="py-10 px-6 md:px-10 text-center"
                >
                  <p className="text-4xl md:text-5xl font-black italic text-white leading-none mb-2">
                    {m.value}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                    {m.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 3. POR QUE PATROCINAR ════════════════════════════════ */}
        <section className="py-32 bg-mist">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <motion.div {...fadeUp} className="mb-16">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-crimson mb-4">
                Por que patrocinar
              </p>
              <h2 className="text-4xl md:text-5xl font-black italic text-navy max-w-xl">
                Investimento com retorno real.
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-navy/10">
              {valueProps.map((v, i) => (
                <motion.div
                  key={i}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                  className="py-10 md:px-10 first:md:pl-0 last:md:pr-0"
                >
                  <div className="w-6 h-px bg-crimson mb-6" />
                  <h3 className="text-lg font-black italic text-navy mb-3">{v.title}</h3>
                  <p className="text-navy/55 text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 4. COTAS ═════════════════════════════════════════════ */}
        <section id="cotas" className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <motion.div {...fadeUp} className="mb-16">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-crimson mb-4">
                Cotas de patrocínio
              </p>
              <h2 className="text-4xl md:text-5xl font-black italic text-navy">
                Escolha o nível de parceria.
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.map((tier, i) => (
                <motion.div
                  key={tier.name}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                  className={`relative flex flex-col border p-7 ${
                    tier.highlight
                      ? "border-crimson bg-navy text-white"
                      : "border-gray-100 bg-white text-navy"
                  }`}
                >
                  {/* Tag */}
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className={`text-[9px] font-black uppercase tracking-[0.22em] ${
                        tier.highlight ? "text-crimson" : "text-gold"
                      }`}
                    >
                      {tier.tag}
                    </span>
                    {tier.highlight && (
                      <span className="text-[9px] font-black uppercase tracking-widest bg-crimson text-white px-2 py-0.5">
                        Mais escolhido
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3
                    className={`text-2xl font-black italic mb-8 ${
                      tier.highlight ? "text-white" : "text-navy"
                    }`}
                  >
                    {tier.name}
                  </h3>

                  {/* Benefits */}
                  <ul className="space-y-3 flex-1 mb-8">
                    {tier.benefits.map((b, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <Check
                          size={13}
                          className={`shrink-0 mt-0.5 ${
                            tier.highlight ? "text-crimson" : "text-gold"
                          }`}
                          strokeWidth={2.5}
                        />
                        <span
                          className={`text-xs leading-snug ${
                            tier.highlight ? "text-white/70" : "text-navy/60"
                          }`}
                        >
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a href="#contato">
                    <span
                      className={`inline-flex w-full items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] py-3 transition-all cursor-pointer group ${
                        tier.highlight
                          ? "bg-crimson text-white hover:bg-red-700"
                          : "border border-navy/20 text-navy hover:bg-navy hover:text-white"
                      }`}
                    >
                      Tenho interesse
                      <ArrowRight
                        size={11}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </span>
                  </a>
                </motion.div>
              ))}
            </div>

            <motion.p
              {...fadeUp}
              className="mt-8 text-center text-xs text-navy/35"
            >
              Os valores e benefícios exatos são definidos em negociação direta.
              Entre em contato para receber nosso mídia kit completo.
            </motion.p>
          </div>
        </section>

        {/* ══ 5. FORMULÁRIO DE CONTATO ═════════════════════════════ */}
        <section id="contato" className="py-32 bg-mist">
          <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-16 items-start">

            {/* Left: pitch */}
            <div className="md:col-span-5 md:sticky md:top-24">
              <motion.div {...fadeUp}>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-crimson mb-5">
                  Contato
                </p>
                <h2 className="text-4xl font-black italic text-navy leading-tight mb-6">
                  Vamos conversar sobre sua parceria.
                </h2>
                <p className="text-navy/55 text-base leading-relaxed mb-8">
                  Preencha o formulário e nossa equipe de gestão entrará em contato
                  em até 48 horas com nosso mídia kit e as opções de parceria disponíveis.
                </p>

                <div className="space-y-4">
                  {[
                    "Mídia kit completo",
                    "Proposta personalizada",
                    "Retorno em até 48h",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <Check size={13} className="text-crimson shrink-0" strokeWidth={2.5} />
                      <span className="text-sm text-navy/60">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-navy/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-navy/35 mb-1">
                    Contato direto
                  </p>
                  <a
                    href="mailto:contato@ufuracing.com.br"
                    className="text-sm font-bold text-navy hover:text-crimson transition-colors"
                  >
                    contato@ufuracing.com.br
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Right: form */}
            <div className="md:col-span-7">
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
                {sent ? (
                  <div className="bg-white border border-green-200 p-10 text-center">
                    <div className="w-12 h-12 bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-5">
                      <Check size={20} className="text-green-600" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-black italic text-navy mb-2">
                      Mensagem enviada.
                    </h3>
                    <p className="text-navy/50 text-sm leading-relaxed mb-8">
                      Recebemos seu contato e retornaremos em até 48 horas
                      com nosso mídia kit e as opções de parceria.
                    </p>
                    <button
                      onClick={() => { setSent(false); setForm({ name: "", company: "", email: "", phone: "", message: "" }); }}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 hover:text-navy transition-colors border-b border-navy/20 pb-0.5"
                    >
                      Enviar outra mensagem
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-gray-100 p-8 md:p-10 space-y-5"
                  >
                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField label="Nome do responsável" required>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="Seu nome"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                      </FormField>
                      <FormField label="Empresa / Organização" required>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="Nome da empresa"
                          value={form.company}
                          onChange={(e) => setForm({ ...form, company: e.target.value })}
                        />
                      </FormField>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField label="E-mail comercial" required>
                        <input
                          type="email"
                          className={inputCls}
                          placeholder="email@empresa.com.br"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </FormField>
                      <FormField label="Telefone / WhatsApp">
                        <input
                          type="tel"
                          className={inputCls}
                          placeholder="(34) 9 0000-0000"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </FormField>
                    </div>

                    <FormField label="Mensagem">
                      <textarea
                        className={`${inputCls} h-32 resize-none`}
                        placeholder="Conte um pouco sobre sua empresa e interesse em parceria..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                      />
                    </FormField>

                    {error && (
                      <p className="text-crimson text-xs font-bold">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full flex items-center justify-center gap-2.5 bg-crimson text-white font-black py-4 text-[11px] uppercase tracking-[0.18em] hover:bg-red-700 transition-colors disabled:opacity-60 group"
                    >
                      {sending ? (
                        "Enviando..."
                      ) : (
                        <>
                          Enviar contato
                          <Send size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-navy/30 text-center">
                      Seus dados são usados exclusivamente para retorno sobre parceria.
                    </p>
                  </form>
                )}
              </motion.div>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}

// ── Shared field wrapper ───────────────────────────────────────────
const inputCls =
  "w-full bg-gray-50 border border-gray-100 focus:border-navy/30 focus:bg-white px-4 py-3 text-sm text-navy outline-none transition-all placeholder:text-navy/25";

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[9px] font-black uppercase tracking-[0.22em] text-navy/40 mb-1.5">
        {label}
        {required && <span className="text-crimson ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
