"use client";

import { useState } from "react";
import { Mail, Linkedin, Cake } from "lucide-react";
import type { Member } from "@/types/member";

function isBirthday(birthDate?: string | null): boolean {
  if (!birthDate) return false;
  // slice(0,10) normalizes both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ssZ"
  const p = birthDate.slice(0, 10).split("-");
  if (p.length < 3) return false;
  const t = new Date();
  return +p[1]! - 1 === t.getMonth() && +p[2]! === t.getDate();
}

export default function ReflectiveMemberCard({ member }: { member: Member }) {
  const birthday = isBirthday(member.birthDate);
  const hasLinks = member.email || member.linkedin;
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      className={`group flex flex-col bg-white border transition-all duration-300 ${
        birthday
          ? "border-gold shadow-[0_0_0_1px_--theme(--color-gold/30),0_4px_24px_--theme(--color-gold/20)]"
          : "border-gray-100 hover:border-gray-200 hover:shadow-lg"
      }`}
    >
      {/* Photo */}
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        {member.photoUrl && !imgFailed ? (
          <img
            src={member.photoUrl}
            alt={member.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-navy/6">
            <span className="text-5xl font-black text-navy/15 uppercase select-none">
              {member.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Birthday tag */}
        {birthday && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gold text-navy text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1">
            <Cake size={10} strokeWidth={2.5} />
            Aniversário
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="w-5 h-px bg-crimson mb-3" />

        <h3 className="text-sm font-black text-navy uppercase leading-tight truncate">
          {member.name}
        </h3>
        <p className="text-[10px] font-bold text-navy/40 uppercase tracking-widest truncate mt-0.5">
          {member.role}
        </p>

        {/* Social links */}
        {hasLinks && (
          <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-50">
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                aria-label={`E-mail de ${member.name}`}
                className="text-navy/20 hover:text-crimson transition-colors"
              >
                <Mail size={14} strokeWidth={1.75} />
              </a>
            )}
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label={`LinkedIn de ${member.name}`}
                className="text-navy/20 hover:text-navy transition-colors"
              >
                <Linkedin size={14} strokeWidth={1.75} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
