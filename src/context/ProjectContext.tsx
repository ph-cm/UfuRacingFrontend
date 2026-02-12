"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

// Tipos atualizados com campos de Imagem
type NewsItem = { id: number; title: string; date: string; summary: string; image: string };
type Sponsor = { id: number; name: string; logoUrl: string }; 
type Highlight = { 
    memberName: string; 
    memberRole: string; 
    memberPhoto: string; // Novo
    areaName: string; 
    areaDesc: string;
    areaPhoto: string;   // Novo
};

interface ProjectContextType {
  news: NewsItem[];
  sponsors: Sponsor[];
  highlight: Highlight;
  addNews: (item: NewsItem) => void;
  addSponsor: (item: Sponsor) => void;
  updateHighlight: (data: Highlight) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  // Dados Iniciais com Placeholders de Imagem
  const [news, setNews] = useState<NewsItem[]>([
    { id: 1, title: "Lançamento do Protótipo 2026", date: "10/02/2026", summary: "A nova aerodinâmica foi testada com sucesso.", image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1000" },
  ]);

  const [sponsors, setSponsors] = useState<Sponsor[]>([
    { id: 1, name: "UFU", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Bras%C3%A3o_UFU.jpg/1200px-Bras%C3%A3o_UFU.jpg" },
    { id: 2, name: "METAL HORSE", logoUrl: "" }, // Exemplo sem logo
  ]);

  const [highlight, setHighlight] = useState<Highlight>({
    memberName: "Pedro Henrique",
    memberRole: "Diretor Financeiro",
    memberPhoto: "https://randomuser.me/api/portraits/men/32.jpg", // Exemplo
    areaName: "Aerodinâmica",
    areaDesc: "Otimização do fluxo de ar para ganho de downforce.",
    areaPhoto: "https://images.unsplash.com/photo-1580273916550-e323be2ed532?auto=format&fit=crop&q=80&w=1000",
  });

  const addNews = (item: NewsItem) => setNews([item, ...news]);
  const addSponsor = (item: Sponsor) => setSponsors([...sponsors, item]);
  const updateHighlight = (data: Highlight) => setHighlight(data);

  return (
    <ProjectContext.Provider value={{ news, sponsors, highlight, addNews, addSponsor, updateHighlight }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProject must be used within a ProjectProvider");
  return context;
};