"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wind, Box, Gauge, Cpu, Settings, BarChart2,
  ArrowRight, ChevronDown, ArrowUpRight,
} from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SponsorsMarquee from "@/components/SponsorsMarquee";

// ── Shared animation variant ───────────────────────────────────────
const fadeUp = {
  initial:   { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport:  { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
};

// ── Static data ────────────────────────────────────────────────────
interface AreaDetail { title: string; info: string; }
interface Area {
  id: string;
  icon: React.ReactNode;
  title: string;
  headline: string;
  desc: string;
  details: AreaDetail[];
}

const areas: Area[] = [
  {
    id: "aero",
    icon: <Wind size={16} strokeWidth={2} />,
    title: "Aerodinâmica",
    headline: "Máxima aderência em alta velocidade.",
    desc: "O sistema aerodinâmico maximiza o downforce do protótipo, permitindo maior velocidade em curvas através de geometrias otimizadas via CFD (ANSYS Fluent).",
    details: [
      { title: "Perfis de Asa", info: "Perfis selig otimizados para alta sustentação negativa com múltiplos elementos." },
      { title: "Sistema DRS",   info: "Redução ativa de arrasto para ganho de velocidade em retas longas." },
      { title: "Validação CFD", info: "Correlação entre simulação ANSYS e testes de pista para calibração." },
    ],
  },
  {
    id: "chassi",
    icon: <Box size={16} strokeWidth={2} />,
    title: "Chassi",
    headline: "Segurança, leveza e rigidez torcional.",
    desc: "Garante integridade estrutural e segurança do piloto, oferecendo a rigidez necessária para os pontos de fixação de suspensão e demais subsistemas.",
    details: [
      { title: "Estrutura Tubular", info: "Treliça em aço SAE 1020 otimizada por análise de elementos finitos." },
      { title: "Ergonomia",         info: "Cockpit projetado para mínima fadiga e resposta rápida do piloto." },
      { title: "Integração",        info: "Pontos de fixação co-projetados com suspensão, powertrain e aero." },
    ],
  },
  {
    id: "dinamica",
    icon: <Gauge size={16} strokeWidth={2} />,
    title: "Dinâmica Veicular",
    headline: "Traduzindo potência em movimento controlado.",
    desc: "Define a assinatura de pilotagem do carro através de setup calibrado de suspensão, direção e freios, otimizado para cada disciplina da competição.",
    details: [
      { title: "Suspensão",         info: "Geometria Duplo-A com amortecedores ajustáveis e anti-roll configurável." },
      { title: "Sistema de Freios", info: "Hidráulico com balanço de frenagem dianteiro/traseiro ajustável." },
      { title: "Direção",           info: "Geometria de Ackermann precisa para resposta imediata em curvas." },
    ],
  },
  {
    id: "eletrica",
    icon: <Cpu size={16} strokeWidth={2} />,
    title: "Eletrônica",
    headline: "O sistema nervoso digital do protótipo.",
    desc: "Monitora a saúde do veículo e transforma dados de sensores em estratégias de corrida em tempo real, com telemetria wireless para o box.",
    details: [
      { title: "Sensoriamento", info: "+30 sensores monitorando temperatura, pressão, aceleração e dinâmica." },
      { title: "ECU",           info: "FuelTech FT550 programável com mapas de injeção e ignição." },
      { title: "Telemetria",    info: "Transmissão sem fio de dados para análise em tempo real no box." },
    ],
  },
  {
    id: "powertrain",
    icon: <Settings size={16} strokeWidth={2} />,
    title: "Powertrain",
    headline: "Torque linear e confiabilidade máxima.",
    desc: "Otimiza o motor para entrega de torque em baixas rotações e resposta rápida do acelerador, com admissão e exaustão totalmente customizadas.",
    details: [
      { title: "Motor",        info: "KTM 450 EXC-R monocilíndrico com admissão restricta conforme SAE." },
      { title: "Plenum",       info: "Duto de admissão em fibra de carbono produzido por impressão 3D." },
      { title: "Transmissão",  info: "Coroa e pinhão selecionados para maximizar aceleração saindo das curvas." },
    ],
  },
  {
    id: "gestao",
    icon: <BarChart2 size={16} strokeWidth={2} />,
    title: "Gestão",
    headline: "Engenharia de negócios e viabilidade.",
    desc: "Conecta a engenharia ao mercado, garantindo parcerias estratégicas, controle financeiro e gestão de cronograma para a temporada competitiva.",
    details: [
      { title: "Marketing",  info: "Gestão de marca, redes sociais e apresentação de ROI a patrocinadores." },
      { title: "Financeiro", info: "Controle de fluxo de caixa, custos de fabricação e prestação de contas." },
      { title: "Eventos",    info: "Organização de lançamentos, processos seletivos e visitas técnicas." },
    ],
  },
];

const competitions = [
  { year: "2025",      name: "Fórmula SAE Brasil",    result: "32° Lugar Geral",            loc: "Piracicaba, SP" },
  { year: "2024",      name: "Fórmula SAE Brasil",    result: "36° Lugar Geral",            loc: "Piracicaba, SP" },
  { year: "2023",      name: "Fórmula SAE Brasil",    result: "48° Lugar Geral",            loc: "Piracicaba, SP" },
  { year: "2015–2022", name: "UFU Racing",             result: "Fundação e Desenvolvimento", loc: "Uberlândia, MG" },
];

const stats = [
  { value: "10+", label: "Anos de Competição" },
  { value: "40+", label: "Membros Ativos"     },
  { value: "6",   label: "Áreas Técnicas"     },
  { value: "32°", label: "Geral FSAE Brasil"  },
];

// ── Component ──────────────────────────────────────────────────────
export default function Home() {
  const { highlight, sponsors } = useProject();
  const [activeArea, setActiveArea] = useState<Area>(areas[0]);

  const hasHighlight = highlight?.memberName || highlight?.areaName;

  return (
    <>
      <Navbar />

      <main className="overflow-x-hidden bg-mist">

        {/* ══════════════════════════════════════════════
            1. HERO — Cinematográfico, full-height
        ══════════════════════════════════════════════ */}
        <section
          id="home"
          className="relative h-screen min-h-[640px] flex flex-col justify-end bg-carbon overflow-hidden"
        >
          {/* Background photo */}
          <div className="absolute inset-0" aria-hidden>
            <img
              src="https://images.unsplash.com/photo-1552176625-e47ff529b595?q=80&w=2069&auto=format&fit=crop"
              alt=""
              className="w-full h-full object-cover opacity-[0.18]"
              loading="eager"
              fetchPriority="high"
            />
            {/* Cinematic gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/70 to-carbon/10" />
            {/* Subtle radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_70%,rgba(8,12,16,0)_0%,rgba(8,12,16,0.6)_100%)]" />
          </div>

          {/* Left accent line */}
          <div
            className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 w-px h-28 bg-crimson/50"
            aria-hidden
          />

          {/* Hero content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pb-24 md:pb-28 w-full">
            {/* Eyebrow label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-7"
            >
              <span className="block w-6 h-px bg-crimson" />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/35">
                Formula SAE · UFU · Est. 2015
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(3.5rem,10vw,9.5rem)] font-black italic text-white uppercase leading-[0.88] tracking-tight mb-8"
            >
              UFU<br />
              <span className="text-crimson">Racing</span>
            </motion.h1>

            {/* Subline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-white/45 text-base md:text-lg max-w-md leading-relaxed mb-10"
            >
              Equipe de engenharia competitiva da Universidade Federal de Uberlândia,
              projetando e construindo protótipos Formula SAE desde 2015.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap gap-3"
            >
              <Link href="/sobre">
                <span className="inline-flex items-center gap-2 bg-crimson text-white text-[11px] font-black uppercase tracking-[0.15em] px-7 py-3.5 hover:bg-red-700 transition-colors cursor-pointer group">
                  Conheça a Equipe
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
              <Link href="/sponsors/contact">
                <span className="inline-flex items-center gap-2 border border-white/20 text-white/70 text-[11px] font-black uppercase tracking-[0.15em] px-7 py-3.5 hover:bg-white/5 hover:text-white transition-all cursor-pointer">
                  Seja Patrocinador
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-white/20" aria-hidden>
            <span className="text-[9px] font-bold uppercase tracking-[0.25em]">Scroll</span>
            <ChevronDown size={13} className="animate-bounce" />
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            2. STATS — Números da equipe
        ══════════════════════════════════════════════ */}
        <section className="bg-navy text-white">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.07 }}
                  className="py-10 px-6 md:px-10 text-center"
                >
                  <p className="text-[2.75rem] md:text-[3.5rem] font-black italic text-white leading-none mb-2">
                    {s.value}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                    {s.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            3. SOBRE — Editorial split
        ══════════════════════════════════════════════ */}
        <section className="py-32 bg-mist">
          <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-14 md:gap-20 items-start">

            {/* Left: pull-quote */}
            <div className="md:col-span-5 md:sticky md:top-24">
              <motion.div {...fadeUp}>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-crimson mb-5">
                  Sobre a Equipe
                </p>
                <h2 className="text-4xl md:text-5xl font-black italic text-navy leading-tight text-balance">
                  Engenharia que vai além da sala de aula.
                </h2>
                <div className="w-10 h-px bg-crimson mt-8" />
              </motion.div>
            </div>

            {/* Right: body text */}
            <div className="md:col-span-7">
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }} className="space-y-6">
                <p className="text-navy/60 text-lg leading-relaxed">
                  A UFU Racing é a equipe de Formula SAE da Universidade Federal de Uberlândia.
                  A cada temporada, estudantes de engenharia projetam, fabricam e competem com
                  um protótipo inteiramente desenvolvido dentro da universidade.
                </p>
                <p className="text-navy/55 text-base leading-relaxed">
                  O projeto abrange todo o espectro da engenharia — do projeto estrutural e
                  aerodinâmico à programação de ECU e gestão financeira — preparando os membros
                  para os maiores desafios da carreira profissional com experiência real de
                  projeto e competição.
                </p>

                {/* Highlights */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {[
                    { label: "Projeto de ponta a ponta", desc: "Do CAD à pista" },
                    { label: "Evento Nacional",           desc: "FSAE Brasil anual" },
                    { label: "Multidisciplinar",          desc: "6 áreas técnicas" },
                    { label: "Formação acelerada",        desc: "Experiência real" },
                  ].map((h, i) => (
                    <div key={i} className="border-l-2 border-navy/12 pl-4">
                      <p className="text-xs font-black uppercase tracking-wide text-navy mb-0.5">{h.label}</p>
                      <p className="text-xs text-navy/45">{h.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link href="/sobre">
                    <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-navy hover:text-crimson transition-colors cursor-pointer border-b border-navy/25 hover:border-crimson pb-0.5">
                      Ver a equipe completa <ArrowUpRight size={12} />
                    </span>
                  </Link>
                </div>
              </motion.div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════
            4. ÁREAS TÉCNICAS — Interativo, sem emojis
        ══════════════════════════════════════════════ */}
        <section id="subareas" className="py-32 bg-carbon text-white">
          <div className="max-w-7xl mx-auto px-6 md:px-10">

            <motion.div {...fadeUp} className="mb-16">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-crimson mb-4">
                Engenharia
              </p>
              <h2 className="text-4xl md:text-5xl font-black italic text-white">
                Sub-áreas técnicas
              </h2>
            </motion.div>

            <div className="grid lg:grid-cols-12 gap-6">

              {/* Sidebar — area list */}
              <div className="lg:col-span-4 flex flex-col gap-0.5">
                {areas.map((area) => {
                  const active = activeArea.id === area.id;
                  return (
                    <button
                      key={area.id}
                      onClick={() => setActiveArea(area)}
                      className={`flex items-center gap-4 px-5 py-4 text-left transition-all duration-200 border-l-2 ${
                        active
                          ? "border-crimson bg-white/6 text-white"
                          : "border-transparent text-white/38 hover:text-white/65 hover:bg-white/3"
                      }`}
                    >
                      <span className={`shrink-0 transition-colors ${active ? "text-crimson" : "text-white/25"}`}>
                        {area.icon}
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-[0.15em]">
                        {area.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Detail panel */}
              <div className="lg:col-span-8">
                <motion.div
                  key={activeArea.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-panel border border-white/6 p-8 md:p-12 h-full"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-crimson">{activeArea.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">
                      Sub-área técnica
                    </span>
                  </div>

                  <h3 className="text-3xl md:text-[2.5rem] font-black italic text-white leading-tight mb-2">
                    {activeArea.title}
                  </h3>
                  <p className="text-crimson text-xs font-bold uppercase tracking-wide mb-7">
                    {activeArea.headline}
                  </p>
                  <p className="text-white/45 leading-relaxed mb-10 text-[0.9375rem]">
                    {activeArea.desc}
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">
                    {activeArea.details.map((d, i) => (
                      <div key={i} className="border border-white/7 p-5">
                        <div className="w-4 h-px bg-crimson mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40 mb-2">
                          {d.title}
                        </p>
                        <p className="text-xs text-white/28 leading-relaxed">
                          {d.info}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            5. DESTAQUES — Condicional, só com dados reais
        ══════════════════════════════════════════════ */}
        {hasHighlight && (
          <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6 md:px-10">

              <motion.div {...fadeUp} className="mb-16">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-crimson mb-4">
                  Reconhecimento
                </p>
                <h2 className="text-4xl md:text-5xl font-black italic text-navy">
                  Destaques do mês
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">

                {/* Membro */}
                {highlight?.memberName && (
                  <motion.div
                    {...fadeUp}
                    className="group flex flex-col sm:flex-row border border-gray-100 overflow-hidden"
                  >
                    <div className="sm:w-[42%] h-60 sm:h-auto bg-gray-100 relative overflow-hidden shrink-0">
                      <img
                        src={highlight.memberPhoto || "https://images.unsplash.com/photo-1593344484962-996055d4939a?auto=format&fit=crop&q=80&w=600"}
                        alt={highlight.memberName}
                        className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="flex-1 p-8 flex flex-col justify-center bg-white">
                      <div className="w-5 h-px bg-crimson mb-5" />
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-crimson mb-2">
                        Membro do Mês
                      </p>
                      <h4 className="text-2xl font-black italic text-navy leading-tight mb-1">
                        {highlight.memberName}
                      </h4>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-navy/35">
                        {highlight.memberRole}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Área */}
                {highlight?.areaName && (
                  <motion.div
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: 0.1 }}
                    className="group flex flex-col sm:flex-row-reverse border border-navy/10 overflow-hidden"
                  >
                    <div className="sm:w-[42%] h-60 sm:h-auto bg-navy/10 relative overflow-hidden shrink-0">
                      <img
                        src={highlight.areaPhoto || "https://images.unsplash.com/photo-1547038577-da80abbc4f19?auto=format&fit=crop&q=80&w=600"}
                        alt={highlight.areaName}
                        className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500 scale-100 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-navy/55" />
                    </div>
                    <div className="flex-1 p-8 flex flex-col justify-center bg-navy text-white">
                      <div className="w-5 h-px bg-gold mb-5" />
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gold mb-2">
                        Área em Foco
                      </p>
                      <h4 className="text-2xl font-black italic leading-tight mb-2">
                        {highlight.areaName}
                      </h4>
                      <p className="text-white/40 text-sm leading-relaxed">
                        {highlight.areaDesc}
                      </p>
                    </div>
                  </motion.div>
                )}

              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════
            6. COMPETIÇÕES — Timeline editorial
        ══════════════════════════════════════════════ */}
        <section id="competicoes" className="py-32 bg-mist">
          <div className="max-w-7xl mx-auto px-6 md:px-10">

            <motion.div {...fadeUp} className="mb-16">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-crimson mb-4">
                Histórico
              </p>
              <h2 className="text-4xl md:text-5xl font-black italic text-navy">
                Trajetória na pista
              </h2>
            </motion.div>

            <div>
              {/* Table header */}
              <div className="grid grid-cols-12 pb-4 mb-1 border-b border-navy/12">
                {["Ano", "Competição", "Resultado", "Local"].map((h) => (
                  <span
                    key={h}
                    className={`text-[10px] font-black uppercase tracking-[0.18em] text-navy/30 ${
                      h === "Ano"        ? "col-span-2" :
                      h === "Competição" ? "col-span-5" :
                      h === "Resultado"  ? "col-span-3" :
                                          "col-span-2 text-right"
                    }`}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {competitions.map((c, i) => (
                <motion.div
                  key={i}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.07 }}
                  className="grid grid-cols-12 items-center py-6 border-b border-navy/8 group hover:bg-white/60 transition-colors px-2 -mx-2"
                >
                  <div className="col-span-2">
                    <span className="text-xl md:text-2xl font-black italic text-crimson">{c.year}</span>
                  </div>
                  <div className="col-span-5">
                    <span className="text-sm font-bold text-navy">{c.name}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.1em] bg-navy text-white px-3 py-1">
                      {c.result}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs text-navy/35">{c.loc}</span>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════
            7. PATROCINADORES — Marquee refinado
        ══════════════════════════════════════════════ */}
        <SponsorsMarquee
          title="Patrocinadores"
          subtitle="Parceiros Estratégicos"
          speedSeconds={28}
          heightPx={68}
          gapPx={72}
          pauseOnHover
        />

        {/* ══════════════════════════════════════════════
            8. CTA PATROCÍNIO — Dark, direto
        ══════════════════════════════════════════════ */}
        <section className="py-32 bg-navy text-white">
          <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-12 items-center">

            <div className="md:col-span-8">
              <motion.div {...fadeUp}>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gold mb-6">
                  Parcerias
                </p>
                <h2 className="text-4xl md:text-5xl font-black italic text-white leading-tight mb-6 text-balance">
                  Faça parte de uma equipe de alto desempenho.
                </h2>
                <p className="text-white/38 text-base leading-relaxed max-w-xl">
                  Associe sua marca a uma equipe universitária de engenharia competitiva.
                  Visibilidade em competições nacionais, conteúdo técnico e mídia digital com
                  alcance no setor de engenharia e tecnologia.
                </p>
              </motion.div>
            </div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.15 }}
              className="md:col-span-4 flex md:justify-end"
            >
              <Link href="/sponsors/contact">
                <span className="inline-flex items-center gap-3 bg-crimson text-white text-[11px] font-black uppercase tracking-[0.15em] px-8 py-4 hover:bg-red-700 transition-colors cursor-pointer group">
                  Quero patrocinar
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </motion.div>

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
