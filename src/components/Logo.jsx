// TailorBot — the TailorTrac mascot. Strokes inherit currentColor, so set the
// colour on the parent (e.g. text-white inside the gradient tile).
export default function Logo({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="TailorTrac"
    >
      {/* needle antenna */}
      <path d="M32 21 L32 13.5" />
      <ellipse cx="32" cy="9.5" rx="3" ry="4" strokeWidth={3} />
      {/* ears */}
      <path d="M13.5 29 L10.5 29 A3.5 3.5 0 0 0 7 32.5 L7 37.5 A3.5 3.5 0 0 0 10.5 41 L13.5 41 Z" fill="currentColor" />
      <path d="M50.5 29 L53.5 29 A3.5 3.5 0 0 1 57 32.5 L57 37.5 A3.5 3.5 0 0 1 53.5 41 L50.5 41 Z" fill="currentColor" />
      {/* head */}
      <rect x="13" y="21" width="38" height="28" rx="12" />
      {/* face */}
      <circle cx="24" cy="32" r="3.2" fill="currentColor" stroke="none" />
      <path d="M36 33.5 Q39.5 29.8 43 33.5" strokeWidth={3.2} />
      <path d="M26 38.5 Q32 44.5 38 38.5" strokeWidth={3.2} />
    </svg>
  );
}
