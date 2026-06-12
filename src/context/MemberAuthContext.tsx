"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { memberLogin, memberMe, type MemberSession } from "@/services/memberAuth";

const LS_KEY = "@ufuracing-member";

interface MemberAuthContextType {
  member: MemberSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const MemberAuthContext = createContext<MemberAuthContextType | undefined>(undefined);

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<MemberSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      const parsed: MemberSession = JSON.parse(stored);
      memberMe(parsed.token)
        .then((m) => {
          setMember(m);
          localStorage.setItem(LS_KEY, JSON.stringify(m));
        })
        .catch(() => localStorage.removeItem(LS_KEY))
        .finally(() => setLoading(false));
    } catch {
      localStorage.removeItem(LS_KEY);
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const session = await memberLogin(email, password);
    setMember(session);
    localStorage.setItem(LS_KEY, JSON.stringify(session));
  }

  function logout() {
    setMember(null);
    localStorage.removeItem(LS_KEY);
  }

  return (
    <MemberAuthContext.Provider value={{ member, loading, login, logout }}>
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const ctx = useContext(MemberAuthContext);
  if (!ctx) throw new Error("useMemberAuth deve ser usado dentro de MemberAuthProvider");
  return ctx;
}
