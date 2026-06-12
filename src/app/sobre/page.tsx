"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/context/ProjectContext";
import ReflectiveMemberCard from "@/components/ReflectiveMemberCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  initial:     { opacity: 0, y: 16 },
  animate:     { opacity: 1, y: 0 },
  exit:        { opacity: 0, y: 8 },
  transition:  { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
};

export default function SobrePage() {
  const { members } = useProject();
  const [activeTeam, setActiveTeam] = useState("Todos");

  const teams = useMemo(() => {
    const set = new Set(members.map((m) => m.team).filter(Boolean));
    return ["Todos", ...Array.from(set)];
  }, [members]);

  const filtered = useMemo(
    () => (activeTeam === "Todos" ? members : members.filter((m) => m.team === activeTeam)),
    [members, activeTeam]
  );

  const totalTeams = teams.length - 1; // exclude "Todos"

  return (
    <>
      <Navbar />

      <main>

        {/* ══ HERO ══════════════════════════════════════════════════ */}
        <section className="bg-carbon pt-36 pb-20">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-crimson mb-5">
                A Equipe
              </p>
              <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase leading-[0.9] tracking-tight mb-6">
                UFU<br />Racing Team
              </h1>
              <p className="text-white/40 text-base leading-relaxed max-w-md">
                Conheça os engenheiros por trás do protótipo. Uma equipe multidisciplinar
                movida pela competição e pelo rigor técnico.
              </p>
            </motion.div>

            {/* Stats */}
            {members.length > 0 && (
              <div className="flex items-center gap-8 mt-10 pt-10 border-t border-white/8">
                <div>
                  <p className="text-3xl font-black italic text-white leading-none">{members.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mt-1">Membros</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-3xl font-black italic text-white leading-none">{totalTeams}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mt-1">Sub-áreas</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══ FILTER BAR ════════════════════════════════════════════ */}
        {members.length > 0 && (
          <div className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
              <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
                {teams.map((team) => {
                  const active = activeTeam === team;
                  const count = team === "Todos"
                    ? members.length
                    : members.filter((m) => m.team === team).length;
                  return (
                    <button
                      key={team}
                      onClick={() => setActiveTeam(team)}
                      className={`shrink-0 flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                        active
                          ? "bg-navy text-white"
                          : "text-navy/40 hover:text-navy hover:bg-gray-50"
                      }`}
                    >
                      {team}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 min-w-5 text-center ${
                        active ? "bg-white/15 text-white" : "bg-gray-100 text-navy/40"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ GRID ══════════════════════════════════════════════════ */}
        <section className="py-16 bg-mist min-h-[60vh]">
          <div className="max-w-7xl mx-auto px-6 md:px-10">

            {members.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-12 h-12 border border-navy/10 flex items-center justify-center mb-6">
                  <span className="text-navy/20 font-black text-xl">?</span>
                </div>
                <h2 className="text-lg font-black italic text-navy mb-2">Nenhum membro cadastrado</h2>
                <p className="text-navy/40 text-sm">
                  Acesse o painel admin para adicionar os membros da equipe.
                </p>
              </div>
            ) : (
              <>
                {/* Active team label */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-px bg-crimson" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-navy/40">
                      {activeTeam === "Todos" ? "Todos os membros" : activeTeam}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-navy/30">
                    {filtered.length} {filtered.length === 1 ? "membro" : "membros"}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTeam}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5"
                  >
                    {filtered.map((member, i) => (
                      <motion.div
                        key={member.id}
                        {...fadeUp}
                        transition={{ ...fadeUp.transition, delay: Math.min(i * 0.04, 0.3) }}
                      >
                        <ReflectiveMemberCard member={member} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </>
            )}

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
