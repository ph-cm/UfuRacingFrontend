"use client";

import { useRouter } from "next/navigation";

type Props = {
  fallbackHref?: string;
  label?: string;
  alwaysFallback?: boolean;
};

export default function BackButton({
  fallbackHref = "/",
  label = "Voltar",
  alwaysFallback = false,
}: Props) {
  const router = useRouter();

  const onClick = () => {
    if (alwaysFallback) {
      router.push(fallbackHref);
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className="
        inline-flex items-center gap-3
        px-6 py-3 rounded-2xl
        bg-racing-blue text-white shadow-lg
        font-black uppercase text-[11px] tracking-widest
        transition-all duration-300
        hover:bg-racing-red hover:shadow-xl hover:-translate-y-1
        active:scale-95
      "
    >
      <span className="text-base leading-none">←</span>
      {label}
    </button>
  );
}