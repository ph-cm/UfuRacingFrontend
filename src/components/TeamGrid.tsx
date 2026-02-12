"use client";
import { motion } from "framer-motion";

const members = [
  { name: "João Silva", role: "Capitão Geral", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60" },
  { name: "Maria Souza", role: "Diretora Técnica", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60" },
  { name: "Pedro Santos", role: "Gerente Administrativo", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60" },
];

export default function TeamGrid() {
  return (
    <section className="py-24 bg-zinc-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-montserrat font-thin text-zinc-400 mb-2">
            Conheça nossa gestão
          </h2>
          <h3 className="text-4xl md:text-5xl font-montserrat font-bold text-[#111]">
            Administrativo
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative group overflow-hidden shadow-xl"
            >
              {/* Imagem com Hover Zoom */}
              <div className="h-[450px] overflow-hidden bg-zinc-800">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                />
              </div>

              {/* Overlay de info */}
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-20">
                <h4 className="text-white font-bold font-montserrat text-xl">
                  {member.name}
                </h4>
                <p className="text-[#FFD000] font-medium text-sm uppercase tracking-wider">
                  {member.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}