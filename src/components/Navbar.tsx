"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Instagram, Linkedin, Youtube, Lock, User } from "lucide-react";
import { useMemberAuth } from "@/context/MemberAuthContext";

const navLinks = [
  { label: "Equipe", href: "/sobre" },
  { label: "Notícias", href: "/news" },
  { label: "Projeto", href: "/#subareas" },
  { label: "Competições", href: "/#competicoes" },
];

const socialLinks = [
  { label: "Instagram", icon: Instagram, href: "#" },
  { label: "LinkedIn",  icon: Linkedin,  href: "#" },
  { label: "YouTube",   icon: Youtube,   href: "#" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { member } = useMemberAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-carbon/98 backdrop-blur-sm border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">

        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="block w-0.5 h-6 bg-crimson" />
          <span className="text-white font-black text-sm tracking-tight uppercase leading-none select-none">
            UFU<span className="text-crimson">Racing</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-9" aria-label="Navegação principal">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/55 hover:text-white transition-colors duration-200"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-5">
          <div className="flex items-center gap-3.5 border-r border-white/10 pr-5">
            {socialLinks.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
                className="text-white/35 hover:text-white/80 transition-colors"
              >
                <Icon size={14} strokeWidth={1.75} />
              </a>
            ))}
          </div>
          <Link href="/sponsors/contact">
            <span className="inline-block bg-crimson text-white text-[10px] font-black uppercase tracking-[0.18em] px-5 py-2.5 hover:bg-red-700 transition-colors cursor-pointer">
              Patrocine
            </span>
          </Link>
          {/* Member area */}
          <Link
            href={member ? "/area/agente" : "/login"}
            aria-label={member ? `Área do membro — ${member.name}` : "Login de membro"}
            className="relative"
          >
            <span className="text-white/25 hover:text-white/60 transition-colors cursor-pointer block">
              <User size={14} strokeWidth={1.75} />
            </span>
            {member && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 border border-carbon" />
            )}
          </Link>

          <Link href="/admin" aria-label="Área administrativa">
            <span className="text-white/20 hover:text-white/50 transition-colors cursor-pointer">
              <Lock size={13} strokeWidth={2} />
            </span>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white/80 p-1 hover:text-white transition-colors"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-carbon/98 backdrop-blur-sm border-t border-white/5">
          <nav className="flex flex-col px-6 py-8 gap-6" aria-label="Menu mobile">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-bold uppercase tracking-[0.15em] text-white/60 hover:text-white transition-colors"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/8 flex flex-col gap-3">
              <Link href="/sponsors/contact" onClick={() => setOpen(false)}>
                <span className="inline-block w-full bg-crimson text-white text-xs font-black uppercase tracking-widest py-3 text-center cursor-pointer">
                  Seja Patrocinador
                </span>
              </Link>
              <Link
                href={member ? "/area/agente" : "/login"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-white/40 hover:text-white transition-colors"
              >
                <User size={14} strokeWidth={1.75} />
                {member ? `Área do Membro` : "Login de Membro"}
                {member && <span className="w-2 h-2 rounded-full bg-green-400 ml-1" />}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
