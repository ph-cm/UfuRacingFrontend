"use client"; 

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProject } from "@/context/ProjectContext"; 

// --- DEFINIÇÃO DE TIPOS (Para corrigir os erros de 'Property does not exist') ---
interface AreaDetailItem {
  title: string;
  info: string;
}

interface AreaData {
  id: string;
  title: string;
  icon: string;
  headline: string;
  desc: string;
  visual: string;
  details: AreaDetailItem[];
}

// --- ÍCONES SVG ---
const Icons = {
  Check: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
};

// --- DADOS ESTÁTICOS DETALHADOS (Tipados) ---
const areasDetailed: AreaData[] = [
  { 
    id: 'aero', 
    title: 'Aerodinâmica', 
    icon: '💨',
    headline: 'Máxima aderência e estabilidade em alta velocidade.',
    desc: 'O sistema aerodinâmico é responsável por maximizar o downforce do protótipo, permitindo maior velocidade em curvas e estabilidade em frenagens, com controle preciso do arrasto (drag) para eficiência em retas.',
    visual: 'CFD_FLOW',
    details: [
        { title: 'Asas & Flaps', info: 'Perfis selig otimizados para alta sustentação negativa.' },
        { title: 'Sistema DRS', info: 'Redução ativa de arrasto para ganho de final em retas.' },
        { title: 'Validação', info: 'Correlação entre CFD (ANSYS) e testes de pista.' }
    ]
  },
  { 
    id: 'chassi', 
    title: 'Chassi', 
    icon: '🏎️',
    headline: 'Segurança, leveza e rigidez torcional.',
    desc: 'Garante a integridade estrutural e a segurança do piloto, oferecendo a rigidez torcional necessária para que a suspensão trabalhe com a máxima eficiência prevista em projeto.',
    visual: 'FEM_ANALYSIS',
    details: [
        { title: 'Estrutura', info: 'Treliça tubular em Aço otimizada no SolidWorks.' },
        { title: 'Ergonomia', info: 'Cockpit projetado para conforto e resposta rápida.' },
        { title: 'Integração', info: 'Pontos de fixação otimizados para todos os subsistemas.' }
    ]
  },
  { 
    id: 'dinamica', 
    title: 'Dinâmica', 
    icon: '🛞',
    headline: 'Traduzindo potência em movimento controlado.',
    desc: 'Define a assinatura de pilotagem do carro. Através de um setup calibrado de suspensão, direção e freios, garantimos que o pneu mantenha o contato ideal com o solo em todas as condições.',
    visual: 'SUSPENSION_GEO',
    details: [
        { title: 'Suspensão', info: 'Geometria Duplo-A com amortecedores ajustáveis.' },
        { title: 'Frenagem', info: 'Sistema hidráulico com balanço de freio ajustável.' },
        { title: 'Direção', info: 'Sistema preciso para resposta rápida em curvas.' }
    ]
  },
  { 
    id: 'eletrica', 
    title: 'Eletrônica', 
    icon: '⚡',
    headline: 'O cérebro digital e aquisição de dados.',
    desc: 'Monitora milimetricamente a saúde do veículo. Transforma dados brutos de sensores em estratégias de corrida, além de gerenciar a injeção eletrônica e a segurança elétrica.',
    visual: 'TELEMETRY_DATA',
    details: [
        { title: 'Sensoriamento', info: '+30 sensores monitorando motor e dinâmica.' },
        { title: 'Gestão', info: 'ECU FuelTech programável com mapas de performance.' },
        { title: 'Telemetria', info: 'Transmissão de dados sem fio para o box.' }
    ]
  },
  { 
    id: 'powertrain', 
    title: 'Powertrain', 
    icon: '⚙️',
    headline: 'Entrega de torque linear e confiabilidade.',
    desc: 'Otimiza o motor para as restrições da competição, focando em torque em baixas rotações e resposta rápida do acelerador para os circuitos travados da Formula SAE.',
    visual: 'ENGINE_CAD',
    details: [
        { title: 'Motor', info: 'Monocilíndrico KTM 450cc com admissão customizada.' },
        { title: 'Admissão', info: 'Plenum em fibra de carbono impresso em 3D.' },
        { title: 'Transmissão', info: 'Relação coroa-pinhão ajustada para aceleração.' }
    ]
  },
  { 
    id: 'gestao', 
    title: 'Gestão', 
    icon: '📊',
    headline: 'Engenharia de negócios e viabilidade.',
    desc: 'Estrutura a equipe como uma empresa. Conecta a engenharia ao mercado para garantir recursos financeiros, parcerias tecnológicas e a gestão de prazos do projeto.',
    visual: 'GANTT_CHART',
    details: [
        { title: 'Marketing', info: 'Gestão de marca e retorno aos patrocinadores.' },
        { title: 'Financeiro', info: 'Controle de fluxo de caixa e custos de manufatura.' },
        { title: 'Eventos', info: 'Organização de lançamentos e processos seletivos.' }
    ]
  },
];

const competitionsHistory = [
  { year: "2025", name: "Fórmula SAE Brasil", result: "32º Lugar Geral (Evolução de 4 posições)", loc: "Piracicaba-SP" },
  { year: "2024", name: "Fórmula SAE Brasil", result: "36º Lugar Geral (Evolução de 12 posições)", loc: "Piracicaba-SP" },
  { year: "2023", name: "Fórmula SAE Brasil", result: "48º Lugar Geral (Primeiro protótipo)", loc: "Piracicaba-SP" },
  { year: "2015-2022", name: "Universidade Federal de Uberlandia", result: "Construção da base", loc: "Piracicaba-SP" },
]

export default function Home() {
  const { highlight, news, sponsors } = useProject();
  
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  // Tipagem explícita no useState para evitar inferência errada
  const [activeArea, setActiveArea] = useState<AreaData>(areasDetailed[0]);

  useEffect(() => {
    if (news.length === 0) return;
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [news]);

  const currentNews = news.length > 0 ? news[currentNewsIndex] : { title: "Bem-vindo à UFU Racing", summary: "Engenharia de Ponta", date: "", image: "" };

  return (
    <main className="min-h-screen bg-racing-offWhite text-racing-dark font-montserrat overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed w-full z-50 bg-racing-blue/95 border-b border-racing-gold/30 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="text-2xl font-black italic tracking-tighter text-white">
            UFU<span className="text-racing-red">RACING</span>
          </div>
          <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-white">
            {['Home', 'Destaques', 'Subáreas', 'Competições', 'Contato'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`} className="hover:text-racing-gold transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-racing-gold transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>
          <div className="flex gap-4">
             <Link href="/admin">
                <button className="border border-white/30 text-white px-6 py-2 text-xs font-bold uppercase hover:bg-white hover:text-racing-blue transition-all rounded-xl">
                    Login ADM
                </button>
             </Link>
             <button className="bg-racing-red text-white px-8 py-2 text-xs font-black uppercase tracking-wider hover:bg-red-700 transition-transform hover:scale-105 shadow-lg shadow-racing-red/20 rounded-xl">
                Apoie
             </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="relative h-screen flex items-end pb-24 md:items-center md:pb-0 justify-center overflow-hidden bg-black">
        {news.map((item, index) => (
            <div 
                key={item.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentNewsIndex ? 'opacity-50' : 'opacity-0'}`}
                style={{
                    backgroundImage: item.image ? `url(${item.image})` : 'linear-gradient(45deg, #041E3F, #000000)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-racing-blue via-racing-blue/50 to-transparent z-10"></div>
        <div className="relative z-20 container mx-auto px-6 flex flex-col items-start md:items-center text-left md:text-center mt-20">
          <div className="inline-flex items-center gap-2 bg-racing-red/90 text-white px-4 py-1 rounded-xl text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Em Destaque Agora
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic text-white leading-tight mb-4 drop-shadow-2xl transition-all duration-500 transform translate-y-0">
            {currentNews.title}
          </h1>
          <p className="text-gray-200 max-w-2xl text-lg mb-8 font-medium line-clamp-2 md:text-center">
            {currentNews.summary}
          </p>
          <div className="flex gap-2 mb-8">
            {news.map((_, idx) => (
                <button 
                    key={idx} 
                    onClick={() => setCurrentNewsIndex(idx)}
                    className={`h-1 rounded-full transition-all duration-300 ${idx === currentNewsIndex ? 'w-8 bg-racing-gold' : 'w-2 bg-white/30'}`}
                />
            ))}
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
             <button className="bg-racing-gold text-racing-blue px-10 py-4 font-black uppercase tracking-widest hover:bg-white transition-colors rounded-xl shadow-[0_0_20px_rgba(218,203,136,0.3)]">
               Ler Matéria Completa
             </button>
             <button className="border border-white text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-racing-red hover:border-racing-red transition-colors rounded-xl">
               Conheça a Equipe
             </button>
          </div>
        </div>
      </section>

      {/* PATROCINADORES */}
      <div className="w-full bg-racing-blue border-t-4 border-racing-red py-10 overflow-hidden relative z-30 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
             <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.3em] mb-2">Apoio Oficial</h3>
          </div>
          <div className="flex overflow-hidden">
             <div className="flex animate-scroll w-max hover:[animation-play-state:paused]">
                <div className="flex items-center gap-32 px-16">
                   {[...sponsors, ...sponsors, ...sponsors].map((sponsor, index) => (
                      <div key={`group1-${index}`} className="flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-all duration-300 cursor-pointer transform hover:scale-110">
                          <div className="h-20 w-auto flex items-center justify-center mb-2 relative"> 
                              {sponsor.logoUrl ? (
                                  <img src={sponsor.logoUrl} alt={sponsor.name} className="h-full w-auto object-contain drop-shadow-md" />
                              ) : (
                                  <span className="text-5xl">🏎️</span>
                              )}
                          </div>
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest mt-1 group-hover:text-racing-gold transition-colors">
                              {sponsor.name}
                          </span>
                      </div>
                   ))}
                </div>
                <div className="flex items-center gap-32 px-16">
                   {[...sponsors, ...sponsors, ...sponsors].map((sponsor, index) => (
                      <div key={`group2-${index}`} className="flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-all duration-300 cursor-pointer transform hover:scale-110">
                          <div className="h-20 w-auto flex items-center justify-center mb-2 relative"> 
                              {sponsor.logoUrl ? (
                                  <img src={sponsor.logoUrl} alt={sponsor.name} className="h-full w-auto object-contain drop-shadow-md" />
                              ) : (
                                  <span className="text-5xl">🏎️</span>
                              )}
                          </div>
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest mt-1 group-hover:text-racing-gold transition-colors">
                              {sponsor.name}
                          </span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
      </div>

      {/* DESTAQUES */}
      <section id="destaques" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-1 w-12 bg-racing-red"></div>
            <h2 className="text-3xl md:text-4xl font-black italic text-racing-blue uppercase">Destaques do Mês</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-racing-offWhite rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row group hover:-translate-y-2 transition-transform duration-300 border border-gray-200">
              <div className="md:w-1/2 bg-gray-300 min-h-[300px] relative">
                 {highlight.memberPhoto ? <img src={highlight.memberPhoto} className="absolute inset-0 w-full h-full object-cover" alt="Membro" /> : <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold">FOTO MEMBRO</div>}
                 <div className="absolute top-0 left-0 bg-racing-gold text-racing-blue text-xs font-bold px-4 py-1 rounded-br-xl">MVP</div>
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-center bg-white text-racing-blue relative">
                <h3 className="text-racing-red font-bold uppercase text-xs tracking-widest mb-2">Membro Destaque</h3>
                <h4 className="text-2xl font-black italic mb-1">{highlight.memberName}</h4>
                <p className="text-gray-500 text-sm font-bold mb-4">{highlight.memberRole}</p>
                <p className="text-gray-600 text-sm leading-relaxed">"Exemplo de dedicação e liderança técnica na bancada e na pista."</p>
              </div>
            </div>
            <div className="bg-racing-blue rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row-reverse group hover:-translate-y-2 transition-transform duration-300 text-white">
              <div className="md:w-1/2 bg-gray-800 min-h-[300px] relative">
                 {highlight.areaPhoto ? <img src={highlight.areaPhoto} className="absolute inset-0 w-full h-full object-cover" alt="Área" /> : <div className="absolute inset-0 flex items-center justify-center text-white/20 font-bold">FOTO ÁREA</div>}
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-center relative">
                <h3 className="text-racing-gold font-bold uppercase text-xs tracking-widest mb-2">Área Destaque</h3>
                <h4 className="text-2xl font-black italic mb-1">{highlight.areaName}</h4>
                <p className="text-gray-300 text-sm font-bold mb-4">Performance & Tech</p>
                <p className="text-gray-400 text-sm leading-relaxed">{highlight.areaDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 5. SUBÁREAS TÉCNICAS (GRID EQUALIZADO) --- */}
      <section id="subareas" className="py-24 relative overflow-hidden">
        {/* Fundo Geométrico */}
        <div className="absolute inset-0 bg-racing-blue"></div>
        <div className="absolute inset-0 bg-racing-red" style={{clipPath: 'polygon(75% 0, 100% 0, 100% 100%, 35% 100%)'}}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 text-white">
            <h2 className="text-4xl md:text-5xl font-black italic mb-4 uppercase drop-shadow-md">Engenharia de Detalhe</h2>
            <p className="text-white/90 font-medium">Explore os sistemas que compõem nosso protótipo</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUNA ESQUERDA: Botões */}
            <div className="flex flex-col gap-3 h-full">
              {areasDetailed.map((area) => (
                <button
                  key={area.id}
                  onClick={() => setActiveArea(area)}
                  className={`p-4 text-left rounded-xl transition-all flex items-center gap-4 border-2 flex-1 ${ 
                    activeArea.id === area.id
                      ? "bg-white text-racing-blue border-white shadow-xl scale-105 font-bold"
                      : "bg-racing-blue/50 text-white border-white/20 hover:bg-white/10 hover:border-white/50"
                  }`}
                >
                  <span className="text-xl">{area.icon}</span>
                  <span className="uppercase text-sm tracking-wider font-bold">{area.title}</span>
                </button>
              ))}
            </div>

            {/* COLUNA DIREITA: Card de Conteúdo */}
            <div className="lg:col-span-2 h-full">
                <div className="bg-white rounded-[2rem] p-10 shadow-2xl relative flex flex-col justify-center h-full text-racing-dark border-t-8 border-racing-red overflow-hidden">
                   <div key={activeArea.id} className="relative z-10 animate-fade-in-up">
                       <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                            <div className="w-16 h-16 bg-racing-offWhite rounded-2xl flex items-center justify-center text-4xl shadow-inner text-racing-blue">
                                {activeArea.icon}
                            </div>
                            <div>
                                <h3 className="text-4xl font-black italic text-racing-blue uppercase leading-none mb-1">{activeArea.title}</h3>
                                <p className="text-racing-red font-bold text-lg">{activeArea.headline}</p>
                            </div>
                       </div>
                       
                       <p className="text-lg text-gray-600 leading-relaxed mb-10 font-medium max-w-2xl">
                          {activeArea.desc}
                       </p>
                       
                       <div className="grid md:grid-cols-3 gap-6">
                           {activeArea.details.map((detail, idx) => (
                               <div key={idx} className="bg-racing-offWhite p-5 rounded-2xl border border-gray-100 hover:border-racing-gold/50 transition-colors group">
                                   <div className="text-racing-gold mb-2">
                                      {Icons.Check}
                                   </div>
                                   <h4 className="font-black text-racing-blue uppercase text-xs tracking-wider mb-2 group-hover:text-racing-red transition-colors">
                                       {detail.title}
                                   </h4>
                                   <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                       {detail.info}
                                   </p>
                               </div>
                           ))}
                       </div>
                       
                       <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none hidden md:block">
                            <span className="text-[8rem] font-black text-racing-blue">CAD</span>
                       </div>
                   </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPETIÇÕES */}
      <section id="competicoes" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-black italic text-racing-blue text-center mb-16 uppercase">Nossa História</h2>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-racing-red before:to-transparent">
            {competitionsHistory.map((comp, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 bg-racing-blue text-racing-gold">
                  <span className="font-bold text-base">🏆</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-3xl shadow border transition-shadow bg-gray-50 border-gray-100 hover:shadow-lg">
                  <div className="flex items-center justify-between space-x-2 mb-2">
                    <span className="font-black uppercase text-lg text-racing-blue">{comp.name}</span>
                    <span className="font-bold text-xl text-racing-red">{comp.year}</span>
                  </div>
                  <div className="text-sm mb-4 text-gray-500">{comp.loc}</div>
                  <div className="inline-block px-4 py-2 rounded-xl text-sm font-bold uppercase bg-racing-red/10 text-racing-red">
                     {comp.result}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contato" className="bg-racing-blue text-white pt-20 pb-10 border-t-8 border-racing-red">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <h3 className="text-3xl font-black italic mb-6">UFU<span className="text-racing-red">RACING</span></h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">Equipe de Formula SAE da Universidade Federal de Uberlândia.</p>
            <div className="flex gap-3">
              {['instagram', 'linkedin', 'youtube', 'facebook'].map((social) => (
                <a key={social} href="#" className="w-8 h-8 bg-white/10 hover:bg-racing-red flex items-center justify-center rounded-xl transition-colors text-xs uppercase font-bold">{social[0]}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-racing-gold uppercase tracking-wider mb-6 text-sm">Navegação</h4>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#subareas" className="hover:text-white transition-colors">Subáreas</a></li>
              <li><a href="/admin" className="text-racing-red font-bold hover:text-white transition-colors">Área Restrita</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-racing-gold uppercase tracking-wider mb-6 text-sm">Contato</h4>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li className="flex gap-3 items-start"><span className="text-racing-red mt-1">📍</span><span>Campus Santa Mônica<br/>Uberlândia - MG</span></li>
              <li className="flex gap-3"><span className="text-racing-red">✉️</span><a href="mailto:parceria@ufuracing.com" className="hover:text-white">parceria@ufuracing.com</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 UFU Racing Formula Team.</p>
        </div>
      </footer>
    </main>
  );
}