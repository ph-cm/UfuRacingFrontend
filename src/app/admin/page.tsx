"use client";
import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import Link from "next/link";

// Mantenha seu array de validUsers aqui...
const validUsers = [
  { email: "admin@ufuracing.com", pass: "admin", name: "Admin Geral", role: "Diretoria" },
];

export default function AdminDashboard() {
  const { highlight, updateHighlight, addNews, addSponsor, news, sponsors } = useProject();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Forms
  const [newsForm, setNewsForm] = useState({ title: "", summary: "", image: "" });
  const [sponsorForm, setSponsorForm] = useState({ name: "", logoUrl: "" });
  const [highlightForm, setHighlightForm] = useState(highlight);
  
  const [activeTab, setActiveTab] = useState("destaques");

  const handleLogin = () => {
    const foundUser = validUsers.find(u => u.email === email && u.pass === password);
    if (foundUser) setCurrentUser(foundUser);
    else alert("Acesso Negado");
  };

  if (!currentUser) {
    /* ... (Mantenha o código da tela de login igual ao anterior) ... */
    return (
        <div className="min-h-screen flex items-center justify-center bg-racing-blue font-montserrat px-4">
            <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-black text-center text-racing-blue mb-6">LOGIN ADM</h2>
                <input className="w-full p-3 border rounded-full mb-4" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
                <input className="w-full p-3 border rounded-full mb-6" type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
                <button onClick={handleLogin} className="w-full bg-racing-red text-white font-bold py-3 rounded-full hover:bg-red-800">ENTRAR</button>
                 <Link href="/" className="block text-center mt-4 text-xs text-gray-400 font-bold uppercase">Voltar ao Site</Link>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex font-montserrat">
      {/* Sidebar (Mantenha igual) */}
      <aside className="w-64 bg-racing-blue text-white hidden md:block fixed h-full z-10 p-6">
        <div className="text-2xl font-black italic mb-10">UFU<span className="text-racing-red">RACING</span></div>
        <nav className="space-y-4">
            <button onClick={() => setActiveTab("destaques")} className={`w-full text-left p-3 rounded-xl font-bold ${activeTab === 'destaques' ? 'bg-racing-red' : 'hover:bg-white/10'}`}>🏆 Destaques</button>
            <button onClick={() => setActiveTab("noticias")} className={`w-full text-left p-3 rounded-xl font-bold ${activeTab === 'noticias' ? 'bg-racing-red' : 'hover:bg-white/10'}`}>📰 Notícias</button>
            <button onClick={() => setActiveTab("patrocinadores")} className={`w-full text-left p-3 rounded-xl font-bold ${activeTab === 'patrocinadores' ? 'bg-racing-red' : 'hover:bg-white/10'}`}>🤝 Parceiros</button>
        </nav>
        <Link href="/" className="block mt-10 p-3 text-center border border-white/20 rounded-full hover:bg-white hover:text-racing-blue text-xs font-bold uppercase">Ver Site</Link>
      </aside>

      <main className="flex-1 p-8 md:ml-64">
        {/* Header (Mantenha igual) */}
        <h1 className="text-3xl font-black text-racing-blue uppercase italic mb-8">{activeTab}</h1>

        {/* --- DESTAQUES --- */}
        {activeTab === "destaques" && (
            <div className="bg-white p-8 rounded-3xl shadow-lg max-w-4xl">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="font-bold text-racing-blue border-b pb-2">Membro do Mês</h4>
                        <input placeholder="Nome" value={highlightForm.memberName} onChange={e => setHighlightForm({...highlightForm, memberName: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl" />
                        <input placeholder="Cargo" value={highlightForm.memberRole} onChange={e => setHighlightForm({...highlightForm, memberRole: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl" />
                        <input placeholder="URL da Foto do Membro (http://...)" value={highlightForm.memberPhoto} onChange={e => setHighlightForm({...highlightForm, memberPhoto: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl text-xs" />
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-racing-blue border-b pb-2">Área Destaque</h4>
                        <input placeholder="Nome Área" value={highlightForm.areaName} onChange={e => setHighlightForm({...highlightForm, areaName: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl" />
                        <textarea placeholder="Descrição" value={highlightForm.areaDesc} onChange={e => setHighlightForm({...highlightForm, areaDesc: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl h-24" />
                        <input placeholder="URL da Foto da Área (http://...)" value={highlightForm.areaPhoto} onChange={e => setHighlightForm({...highlightForm, areaPhoto: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl text-xs" />
                    </div>
                </div>
                <button onClick={() => { updateHighlight(highlightForm); alert("Salvo!"); }} className="w-full bg-green-600 text-white font-bold py-3 rounded-full mt-6 hover:bg-green-700">Salvar Alterações</button>
            </div>
        )}

        {/* --- NOTICIAS --- */}
        {activeTab === "noticias" && (
            <div className="bg-white p-8 rounded-3xl shadow-lg max-w-2xl">
                <h3 className="font-bold text-lg mb-4 text-racing-blue">Nova Notícia</h3>
                <input placeholder="Título" className="w-full p-3 border rounded-xl mb-4" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} />
                <textarea placeholder="Resumo" className="w-full p-3 border rounded-xl mb-4 h-32" value={newsForm.summary} onChange={e => setNewsForm({...newsForm, summary: e.target.value})} />
                <input placeholder="URL da Imagem de Capa" className="w-full p-3 border rounded-xl mb-4 text-xs" value={newsForm.image} onChange={e => setNewsForm({...newsForm, image: e.target.value})} />
                <button onClick={() => { addNews({ id: Date.now(), ...newsForm, date: "Hoje" }); setNewsForm({title:"", summary:"", image:""}); alert("Publicado!"); }} className="w-full bg-racing-blue text-white font-bold py-3 rounded-full hover:bg-racing-dark">PUBLICAR</button>
            </div>
        )}

        {/* --- PATROCINADORES --- */}
        {activeTab === "patrocinadores" && (
            <div className="bg-white p-8 rounded-3xl shadow-lg max-w-2xl">
                <h3 className="font-bold text-lg mb-4 text-racing-blue">Novo Parceiro</h3>
                <div className="flex flex-col gap-4">
                    <input placeholder="Nome da Empresa" className="p-3 border rounded-xl" value={sponsorForm.name} onChange={e => setSponsorForm({...sponsorForm, name: e.target.value})} />
                    <input placeholder="URL do Logo (Fundo Transparente preferível)" className="p-3 border rounded-xl text-xs" value={sponsorForm.logoUrl} onChange={e => setSponsorForm({...sponsorForm, logoUrl: e.target.value})} />
                    <button onClick={() => { addSponsor({ id: Date.now(), ...sponsorForm }); setSponsorForm({name:"", logoUrl:""}); }} className="bg-racing-red text-white py-3 font-bold rounded-full hover:bg-red-800">ADICIONAR</button>
                </div>
                
                <div className="mt-8 grid grid-cols-3 gap-4">
                     {sponsors.map(s => (
                         <div key={s.id} className="border p-2 rounded-xl text-center">
                             {s.logoUrl ? <img src={s.logoUrl} className="h-8 mx-auto object-contain mb-2"/> : <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto mb-2"></div>}
                             <p className="text-xs font-bold">{s.name}</p>
                         </div>
                     ))}
                </div>
            </div>
        )}
      </main>
    </div>
  );
}