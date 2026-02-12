import { Mail, MapPin, Phone, Instagram, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white py-16 border-t border-zinc-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-montserrat font-bold text-white mb-6">
              FORMULA<span className="text-[#FFD000]">SAE</span>
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Construindo mais do que carros de corrida. Formando os melhores engenheiros do país através da paixão e dedicação.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-[#FFD000]">Navegação</h3>
            <ul className="space-y-3 text-zinc-400 text-sm">
              <li><a href="#" className="hover:text-white transition">Home</a></li>
              <li><a href="#" className="hover:text-white transition">A Equipe</a></li>
              <li><a href="#" className="hover:text-white transition">Protótipos</a></li>
              <li><a href="#" className="hover:text-white transition">Transparência</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-[#FFD000]">Contato</h3>
            <ul className="space-y-4 text-zinc-400 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-white shrink-0" />
                <span>Av. Trabalhador São-carlense, 400<br/>São Carlos - SP</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-white" />
                <span>contato@formulasae.com.br</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
             <h3 className="font-bold text-lg mb-6 text-[#FFD000]">Siga-nos</h3>
             <div className="flex gap-4">
               <a href="#" className="w-10 h-10 bg-zinc-800 flex items-center justify-center rounded-full hover:bg-[#FFD000] hover:text-black transition-colors">
                 <Instagram size={20} />
               </a>
               <a href="#" className="w-10 h-10 bg-zinc-800 flex items-center justify-center rounded-full hover:bg-[#FFD000] hover:text-black transition-colors">
                 <Linkedin size={20} />
               </a>
               <a href="#" className="w-10 h-10 bg-zinc-800 flex items-center justify-center rounded-full hover:bg-[#FFD000] hover:text-black transition-colors">
                 <Youtube size={20} />
               </a>
             </div>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 mt-16 pt-8 text-center text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} Formula SAE Team. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}