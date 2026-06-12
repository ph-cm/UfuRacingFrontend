"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMemberAuth } from "@/context/MemberAuthContext";

export default function MemberGuard({ children }: { children: React.ReactNode }) {
  const { member, loading } = useMemberAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !member) router.replace("/login");
  }, [member, loading, router]);

  if (loading) {
    return (
      <div className="h-screen bg-carbon flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!member) return null;

  return <>{children}</>;
}
