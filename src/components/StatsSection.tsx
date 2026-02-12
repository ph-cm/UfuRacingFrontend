"use client";
import { Trophy, Wrench, Medal, Users } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  {
    icon: Trophy,
    title: "Tetracampeã",
    desc: "Uma das universidades públicas com mais títulos na competição nacional.",
  },
  {
    icon: Wrench,
    title: "Melhor Projeto",
    desc: "Equipe eleita diversas vezes como o melhor projeto de engenharia.",
  },
  {
    icon: Medal,
    title: "Inovação",
    desc: "Reconhecimento internacional pelo sistema de freio e design.",
  },
  {
    icon: Users,
    title: "Time de Elite",
    desc: "Estudantes dedicados transformando teoria em alta performance.",
  },
];

export default function StatsSection() {
  return (
    <section id="equipe" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-montserrat font-bold text-[#111] uppercase mb-4">
            A Equipe
          </h2>
          <div className="w-20 h-1 bg-[#FFD000] mx-auto mb-6" />
          <p className="text-zinc-600 leading-relaxed">
            Fundada com o objetivo de participar das competições SAE Brasil, todo o protótipo é concebido pelos estudantes, desde o projeto até a manufatura e montagem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="text-center group"
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-zinc-50 rounded-full group-hover:bg-[#FFD000]/10 transition-colors">
                  <stat.icon className="w-12 h-12 text-[#FFD000]" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-xl font-bold font-montserrat text-[#111] mb-3">
                {stat.title}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed px-4">
                {stat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}