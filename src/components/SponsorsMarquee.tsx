"use client";

import React, { useMemo, useState } from "react";
import { useProject } from "@/context/ProjectContext";

type Props = {
  title?: string;
  subtitle?: string;
  speedSeconds?: number; // menor = mais rápido
  heightPx?: number;
  gapPx?: number;
  grayscale?: boolean;
  pauseOnHover?: boolean;
  minLogosOnTrack?: number; // garante esteira longa mesmo com poucos sponsors
  className?: string;
};

function normalizeUrl(url?: string) {
  if (!url) return "";
  return String(url).trim();
}

export default function SponsorsMarquee({
  title = "Nossos Patrocinadores",
  subtitle = "Parceiros Estratégicos",
  speedSeconds = 18,
  heightPx = 80,
  gapPx = 48,
  grayscale = true,
  pauseOnHover = true,
  minLogosOnTrack = 12,
  className = "",
}: Props) {
  const { sponsors } = useProject();

  const baseSponsors = useMemo(() => {
    const list = (sponsors ?? [])
      .map((s: any) => ({
        id: s.id,
        name: String(s.name ?? "").trim(),
        logoUrl: normalizeUrl(s.logoUrl ?? s.logo_url ?? s.logo),
      }))
      .filter((s) => s.name.length > 0);

    // remove duplicados por id (opcional)
    const seen = new Set<string>();
    return list.filter((s) => {
      const key = String(s.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [sponsors]);

  // 1) Repete a lista até ter uma sequência longa o suficiente
  const sequence = useMemo(() => {
    if (!baseSponsors.length) return [];
    const repeats = Math.max(1, Math.ceil(minLogosOnTrack / baseSponsors.length));
    const seq: typeof baseSponsors = [];
    for (let r = 0; r < repeats; r++) seq.push(...baseSponsors);
    return seq;
  }, [baseSponsors, minLogosOnTrack]);

  // 2) Duplica a sequência pra loop perfeito (A + A)
  const items = useMemo(() => [...sequence, ...sequence], [sequence]);

  const [broken, setBroken] = useState<Record<string, boolean>>({});

  // Early return após todos os hooks
  if (!baseSponsors.length) return null;

  const speed = Math.max(8, speedSeconds);
  const trackStyle = {
    ["--speed" as any]: `${speed}s`,
    ["--gap" as any]: `${gapPx}px`,
    ["--logoH" as any]: `${heightPx}px`,
  } as React.CSSProperties;

  return (
    <section className={`sponsors ${className}`}>
      <div className="head">
        {subtitle ? <p className="subtitle">{subtitle}</p> : null}
        {title ? <h3 className="title">{title}</h3> : null}
        <div className="divider" />
      </div>

      <div className={`marquee ${pauseOnHover ? "pauseOnHover" : ""}`}>
        <div className="track" style={trackStyle} role="list" aria-label="Patrocinadores">
          {items.map((s, idx) => {
            const key = `${s.id}-${idx}`;
            const isBroken = !!broken[key];
            const hasLogo = !!s.logoUrl && !isBroken;

            return (
              <div className="item" key={key} role="listitem" aria-label={s.name}>
                {hasLogo ? (
                  <img
                    src={s.logoUrl}
                    alt={s.name}
                    className={`logo ${grayscale ? "grayscale" : ""}`}
                    loading="lazy"
                    decoding="async"
                    onError={() => setBroken((prev) => ({ ...prev, [key]: true }))}
                  />
                ) : (
                  <span className="fallback">{s.name}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .sponsors {
          background: #ffffff;
          padding: 56px 0;
          border-bottom: 1px solid #f3f4f6;
          overflow: hidden;
        }

        .head {
          text-align: center;
          margin-bottom: 26px;
          padding: 0 16px;
        }

        .subtitle {
          font-size: 10px;
          font-weight: 900;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5em;
          margin: 0 0 8px 0;
        }

        .title {
          margin: 0;
          font-size: 28px;
          font-weight: 900;
          font-style: italic;
          color: #041e3f;
        }

        .divider {
          height: 2px;
          width: 46px;
          background: #b70328;
          margin: 14px auto 0 auto;
          opacity: 0.55;
        }

        .marquee {
          position: relative;
          overflow: hidden;
          width: 100%;
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
        }

        .track {
          display: flex;
          align-items: center;
          width: max-content;
          gap: var(--gap);
          padding: 10px 0;
          animation: marquee var(--speed) linear infinite;
          will-change: transform;
        }

        .pauseOnHover:hover .track {
          animation-play-state: paused;
        }

        .item {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(var(--logoH) + 10px);
          padding: 0 4px;
        }

        .logo {
          height: var(--logoH);
          width: auto;
          max-width: 220px;
          object-fit: contain;
          opacity: 0.55;
          transition: transform 250ms ease, opacity 250ms ease, filter 250ms ease;
        }

        .logo.grayscale {
          filter: grayscale(100%);
        }

        .item:hover .logo {
          opacity: 1;
          transform: scale(1.06);
          filter: none;
        }

        .fallback {
          font-weight: 900;
          font-style: italic;
          color: #041e3f;
          opacity: 0.7;
          white-space: nowrap;
          font-size: 16px;
        }

        /* O pulo some porque a segunda metade é IDÊNTICA à primeira */
        @keyframes marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .track {
            animation: none;
            transform: none;
          }
        }

        @media (max-width: 768px) {
          .sponsors {
            padding: 40px 0;
          }
          .title {
            font-size: 22px;
          }
          .logo {
            max-width: 160px;
          }
        }
      `}</style>
    </section>
  );
}