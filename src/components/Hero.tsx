"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image com Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1552176625-e47ff529b595?q=80&w=2069&auto=format&fit=crop" 
          alt="Carro Formula SAE"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/70 to-[#111111]/30" />
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-block py-1 px-3 border border-[#FFD000] text-[#FFD000] text-xs font-bold tracking-[0.2em] uppercase mb-6"
        >
          Desde 2003
        </motion.span>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-5xl md:text-7xl lg:text-8xl font-montserrat font-black text-white uppercase leading-tight mb-6"
        >
          Velocidade <br /> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD000] to-yellow-200">Engenharia</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-zinc-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light"
        >
          Projetando o futuro do automobilismo universitário. Somos uma equipe movida por desafios, inovação e performance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col md:flex-row gap-4 justify-center"
        >
          <button className="bg-[#FFD000] text-black px-8 py-4 font-montserrat font-bold text-lg uppercase tracking-wide hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 group">
            Seja Patrocinador
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="border border-white text-white px-8 py-4 font-montserrat font-bold text-lg uppercase tracking-wide hover:bg-white hover:text-black transition-all">
            Conheça o Carro
          </button>
        </motion.div>
      </div>
    </section>
  );
}