"use client";
import { useProject } from "@/context/ProjectContext";

export default function SponsorsBanner() {
  const { sponsors } = useProject();

  // Proteção contra lista vazia
  if (!sponsors || sponsors.length === 0) return null;

  // Triplicamos para garantir que a esteira nunca mostre um fundo vazio
  const sliderItems = [...sponsors, ...sponsors, ...sponsors];

  return (
    <section className="sponsor-container">
      <div className="header-area">
        <p className="subtitle">Parceiros Estratégicos</p>
        <div className="divider"></div>
      </div>
      
      <div className="slider-wrapper">
        <div className="slider-track">
          {sliderItems.map((sponsor, index) => (
            <div key={`${sponsor.id}-${index}`} className="slide-item">
              {sponsor.logoUrl ? (
                <img 
                  src={sponsor.logoUrl} 
                  alt={sponsor.name} 
                  className="sponsor-logo"
                />
              ) : (
                <span className="sponsor-name">{sponsor.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .sponsor-container {
          width: 100%;
          background: white;
          padding: 3.5rem 0;
          border-bottom: 1px solid #f3f4f6;
          overflow: hidden;
        }
        .header-area {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .subtitle {
          font-size: 10px;
          font-weight: 900;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5em;
          margin-bottom: 0.5rem;
        }
        .divider {
          height: 2px;
          width: 40px;
          background: #B70328;
          margin: 0 auto;
          opacity: 0.5;
        }
        .slider-wrapper {
          width: 100%;
          overflow: hidden;
          position: relative;
          /* Máscara de gradiente lateral */
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
        .slider-track {
          display: flex;
          width: max-content;
          animation: scroll-it 20s linear infinite;
        }
        .slider-track:hover {
          animation-play-state: paused;
        }
        .slide-item {
          flex-shrink: 0;
          padding: 0 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sponsor-logo {
          height: 3.5rem;
          width: auto;
          object-fit: contain;
          filter: grayscale(100%);
          opacity: 0.4;
          transition: all 0.5s ease;
        }
        .slide-item:hover .sponsor-logo {
          filter: grayscale(0%);
          opacity: 1;
          transform: scale(1.1);
        }
        .sponsor-name {
          font-weight: 900;
          font-style: italic;
          color: #041E3F;
          font-size: 1.25rem;
          opacity: 0.4;
        }

        @keyframes scroll-it {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }

        /* Ajustes Mobile */
        @media (max-width: 768px) {
          .sponsor-logo { height: 2.5rem; }
          .slide-item { padding: 0 1.5rem; }
        }
      `}</style>
    </section>
  );
}