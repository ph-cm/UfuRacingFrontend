import Link from "next/link";
import { Instagram, Linkedin, Youtube, Mail, MapPin } from "lucide-react";

const year = new Date().getFullYear();

const navLinks = [
  { label: "A Equipe",     href: "/sobre" },
  { label: "Notícias",     href: "/news" },
  { label: "Competições",  href: "/#competicoes" },
  { label: "Projeto",      href: "/#subareas" },
];

const socialLinks = [
  { label: "Instagram", icon: Instagram, href: "#" },
  { label: "LinkedIn",  icon: Linkedin,  href: "#" },
  { label: "YouTube",   icon: Youtube,   href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-carbon text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Top grid */}
        <div className="grid md:grid-cols-12 gap-12 pt-20 pb-16 border-b border-white/8">

          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="block w-0.5 h-6 bg-crimson" />
              <span className="text-white font-black text-sm tracking-tight uppercase leading-none">
                UFU<span className="text-crimson">Racing</span>
              </span>
            </div>
            <p className="text-white/35 text-sm leading-relaxed max-w-xs">
              Equipe Formula SAE da Universidade Federal de Uberlândia.
              Formando engenheiros de alta performance através da competição real desde 2015.
            </p>
            <div className="flex items-center gap-3 mt-8">
              {socialLinks.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 border border-white/12 flex items-center justify-center text-white/35 hover:text-white hover:border-white/30 transition-all"
                >
                  <Icon size={13} strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div className="md:col-span-3">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25 mb-6">
              Navegação
            </p>
            <ul className="space-y-3.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/45 hover:text-white/90 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25 mb-6">
              Contato
            </p>
            <div className="space-y-4">
              <a
                href="mailto:contato@ufuracing.com.br"
                className="flex items-center gap-3 text-sm text-white/45 hover:text-white/90 transition-colors"
              >
                <Mail size={13} className="shrink-0 text-crimson" strokeWidth={2} />
                contato@ufuracing.com.br
              </a>
              <div className="flex items-start gap-3 text-sm text-white/35">
                <MapPin size={13} className="shrink-0 text-white/25 mt-0.5" strokeWidth={2} />
                Universidade Federal de Uberlândia — Uberlândia, MG
              </div>
            </div>

            <div className="mt-8">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25 mb-3">
                Parcerias
              </p>
              <Link href="/sponsors/contact">
                <span className="inline-block border border-crimson/60 text-crimson text-[10px] font-black uppercase tracking-[0.15em] px-5 py-2.5 hover:bg-crimson hover:text-white transition-all cursor-pointer">
                  Seja Patrocinador
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-7 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/18">
            © {year} UFU Racing — Formula SAE · Universidade Federal de Uberlândia
          </p>
          <Link href="/admin">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/12 hover:text-white/30 transition-colors cursor-pointer">
              Admin
            </span>
          </Link>
        </div>

      </div>
    </footer>
  );
}
