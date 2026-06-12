export default function Mascot({ size = 40, animate = false }: { size?: number; animate?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={animate ? "animate-pulse" : undefined}
    >
      {/* Antenna */}
      <line x1="24" y1="10" x2="24" y2="3" stroke="#B8942F" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="2" r="2.5" fill="#B8942F" />

      {/* Head base */}
      <rect x="8" y="10" width="32" height="28" rx="6" fill="#041E3F" />

      {/* Left ear / speaker */}
      <rect x="3" y="18" width="6" height="10" rx="3" fill="#07152e" />
      <rect x="4.5" y="20" width="3" height="2" rx="1" fill="#0a1f45" />
      <rect x="4.5" y="23.5" width="3" height="2" rx="1" fill="#0a1f45" />

      {/* Right ear / speaker */}
      <rect x="39" y="18" width="6" height="10" rx="3" fill="#07152e" />
      <rect x="40.5" y="20" width="3" height="2" rx="1" fill="#0a1f45" />
      <rect x="40.5" y="23.5" width="3" height="2" rx="1" fill="#0a1f45" />

      {/* Visor band */}
      <rect x="11" y="17" width="26" height="11" rx="3.5" fill="#C8102E" />

      {/* Left eye */}
      <ellipse cx="18.5" cy="22.5" rx="3.5" ry="3" fill="white" opacity="0.95" />
      <circle cx="19.2" cy="23" r="1.8" fill="#C8102E" />
      <circle cx="18" cy="21.8" r="0.8" fill="white" opacity="0.6" />

      {/* Right eye */}
      <ellipse cx="29.5" cy="22.5" rx="3.5" ry="3" fill="white" opacity="0.95" />
      <circle cx="30.2" cy="23" r="1.8" fill="#C8102E" />
      <circle cx="29" cy="21.8" r="0.8" fill="white" opacity="0.6" />

      {/* Crimson side accent stripe */}
      <rect x="8" y="10" width="4" height="28" rx="2" fill="#C8102E" opacity="0.35" />

      {/* Chin / mouth grille */}
      <rect x="15" y="32" width="18" height="3.5" rx="1.75" fill="#07152e" />
      <rect x="17" y="33" width="3" height="1.5" rx="0.75" fill="#1a3060" />
      <rect x="22.5" y="33" width="3" height="1.5" rx="0.75" fill="#1a3060" />
      <rect x="28" y="33" width="3" height="1.5" rx="0.75" fill="#1a3060" />
    </svg>
  );
}
