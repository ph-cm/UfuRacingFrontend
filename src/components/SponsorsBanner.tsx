"use client";
import { useProject } from "@/context/ProjectContext";

export default function SponsorsBanner() {
  const { sponsors } = useProject();
  // Multiplicamos a lista para garantir que o scroll seja infinito visualmente
  const sliderItems = [...sponsors, ...sponsors, ...sponsors, ...sponsors];

  return (
    <div className="w-full bg-white py-10 border-b border-gray-200 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.3em]">Nossos Parceiros</h3>
      </div>
      
      {/* Container com a máscara de gradiente (esconde as pontas) */}
      <div className="mask-gradient-x w-full flex overflow-hidden">
        <div className="flex gap-16 animate-scroll w-max hover:[animation-play-state:paused]">
            {sliderItems.map((sponsor, index) => (
                <div key={index} className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-500 opacity-60 hover:opacity-100 cursor-pointer transform hover:scale-110">
                    {/* Placeholder bonito para Logos */}
                    <div className="text-2xl font-black italic text-racing-blue flex items-center gap-2">
                        <span className="text-racing-red text-3xl">★</span> {sponsor.name.toUpperCase()}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}