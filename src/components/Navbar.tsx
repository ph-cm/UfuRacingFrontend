"use client";
import { useState, useEffect } from "react";
import { Menu, X, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "A Equipe", href: "#equipe" },
    { name: "Protótipos", href: "#prototipos" },
    { name: "Notícias", href: "#noticias" },
    { name: "Contato", href: "#contato" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-[#111111] shadow-lg py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-montserrat font-bold text-white tracking-tighter">
          FORMULA<span className="text-[#FFD000]">SAE</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-white/90 hover:text-[#FFD000] transition-colors uppercase tracking-wide"
            >
              {link.name}
            </Link>
          ))}
          
          <div className="flex gap-4 border-l border-white/20 pl-6">
            <Instagram className="w-5 h-5 text-white hover:text-[#FFD000] cursor-pointer" />
            <Linkedin className="w-5 h-5 text-white hover:text-[#FFD000] cursor-pointer" />
          </div>

          <button className="bg-[#FFD000] text-black px-6 py-2 font-bold font-montserrat uppercase text-sm tracking-wider hover:bg-yellow-400 transition-transform hover:scale-105 rounded-sm">
            Patrocine!
          </button>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#111111] border-t border-zinc-800">
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white hover:text-[#FFD000] font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <button className="w-full bg-[#FFD000] text-black py-3 font-bold uppercase mt-4">
              Seja Patrocinador
            </button>
          </div>
        </div>
      )}
    </motion.nav>
  );
}