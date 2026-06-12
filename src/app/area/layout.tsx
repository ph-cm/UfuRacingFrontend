"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, Users2, LayoutDashboard, LogOut, Menu, ChevronRight } from "lucide-react";
import { useMemberAuth } from "@/context/MemberAuthContext";
import MemberGuard from "@/components/MemberGuard";
import Mascot from "@/components/Mascot";

const tabs = [
  { href: "/area/painel",     label: "Painel",     sub: "Tarefas & Agenda", icon: LayoutDashboard },
  { href: "/area/agente",     label: "Turing",     sub: "Agente IA",        icon: MessageCircle },
  { href: "/area/comunidade", label: "Comunidade", sub: "Chat & Forum",     icon: Users2 },
];

export default function AreaLayout({ children }: { children: React.ReactNode }) {
  const { member, logout } = useMemberAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <MemberGuard>
      <div className="flex h-screen bg-mist overflow-hidden">

        {/* ── Sidebar ───────────────────────────────────────────── */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-60 bg-navy flex flex-col transition-transform duration-300
            md:relative md:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Brand */}
          <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="block w-0.5 h-5 bg-crimson" />
              <span className="text-white font-black text-xs tracking-tight uppercase select-none">
                UFU<span className="text-crimson">Racing</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-white/30 hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Member card */}
          {member && (
            <div className="px-4 py-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-9 h-9 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-black">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[11px] font-black uppercase truncate leading-tight">
                    {member.name}
                  </p>
                  <p className="text-white/30 text-[10px] truncate mt-0.5">{member.team}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mascot turing teaser */}
          <div className="px-4 py-3 border-b border-white/8 flex items-center gap-3">
            <Mascot size={28} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/60">Turing</p>
              <p className="text-[9px] text-white/25">Agente SAE · Online</p>
            </div>
            <span className="ml-auto w-2 h-2 rounded-full bg-green-400 shrink-0" />
          </div>

          {/* Nav */}
          <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
            {tabs.map(({ href, label, sub, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 transition-all rounded-sm ${
                    active
                      ? "bg-white/8 text-white border-l-2 border-crimson pl-2.5"
                      : "text-white/40 hover:text-white/70 border-l-2 border-transparent"
                  }`}
                >
                  <Icon size={15} strokeWidth={active ? 2.5 : 1.75} />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest leading-tight">
                      {label}
                    </p>
                    <p className={`text-[9px] mt-0.5 ${active ? "text-white/40" : "text-white/20"}`}>
                      {sub}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-2 py-3 border-t border-white/8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-white/25 hover:text-white/60 transition-colors"
            >
              <LogOut size={14} strokeWidth={1.75} />
              <span className="text-[11px] font-bold uppercase tracking-widest">Sair</span>
            </button>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile topbar */}
          <div className="md:hidden flex items-center gap-4 px-5 h-14 bg-navy border-b border-white/8 shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <Menu size={18} />
            </button>
            <span className="text-white font-black text-sm tracking-tight uppercase select-none">
              UFU<span className="text-crimson">Racing</span>
            </span>
          </div>

          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </MemberGuard>
  );
}
