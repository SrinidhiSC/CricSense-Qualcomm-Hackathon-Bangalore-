// Cricket player face — helmet + face guard, cropped bust.
// Designed for use as a circular profile logo at 72–96px.

export function CricketFaceAvatar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="58 18 86 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ── HEAD (skin) ── */}
      <circle cx="100" cy="75" r="30" fill="#C08A5A" />

      {/* Ear left */}
      <ellipse cx="71" cy="76" rx="5" ry="7" fill="#B07848" />
      {/* Ear right */}
      <ellipse cx="129" cy="76" rx="5" ry="7" fill="#B07848" />

      {/* ── GREY HAIR (tiny tuft at sides, below helmet) ── */}
      <path d="M71 73 Q69 68 72 62" stroke="#B0A898" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M129 73 Q131 68 128 62" stroke="#B0A898" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* ── HELMET DOME ── */}
      <path
        d="M70 68 Q70 30 100 27 Q130 30 130 68 L130 94 Q100 105 70 94 Z"
        fill="#0038A8"
      />
      {/* Dome highlight */}
      <path
        d="M78 34 Q96 26 116 31"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Side seam lines */}
      <path d="M70 68 Q68 80 70 91" stroke="#002A8C" strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M130 68 Q132 80 130 91" stroke="#002A8C" strokeWidth="1.5" fill="none" opacity="0.6" />

      {/* ── LEFT EAR GUARD ── */}
      <path d="M70 68 Q63 74 62 85 Q67 93 70 91 Z" fill="#002A8C" />

      {/* ── RIGHT EAR GUARD ── */}
      <path d="M130 68 Q137 74 138 85 Q133 93 130 91 Z" fill="#002A8C" />

      {/* ── VISOR / PEAK ── */}
      <path d="M70 68 Q60 72 58 80 Q64 88 70 86" fill="#00228A" />

      {/* ── CHIN STRAP ── */}
      <path d="M70 91 Q80 102 88 108" stroke="#002A8C" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M130 91 Q120 102 112 108" stroke="#002A8C" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* ── FACE GUARD GRILLE — vertical bars ── */}
      <g stroke="#A8B4C4" strokeWidth="2.5" strokeLinecap="round">
        <line x1="74" y1="70" x2="74" y2="92" />
        <line x1="81" y1="68" x2="81" y2="94" />
        <line x1="88" y1="67" x2="88" y2="96" />
        <line x1="95" y1="67" x2="95" y2="97" />
        <line x1="102" y1="67" x2="102" y2="97" />
        <line x1="109" y1="67" x2="109" y2="96" />
      </g>
      {/* Grille horizontal bars */}
      <g stroke="#A8B4C4" strokeWidth="1.5" opacity="0.6">
        <line x1="73" y1="78" x2="110" y2="77" />
        <line x1="73" y1="87" x2="110" y2="87" />
      </g>

      {/* ── EYE (visible through grille) ── */}
      <circle cx="94" cy="80" r="3.5" fill="#1A1208" opacity="0.6" />
      <circle cx="94" cy="79" r="1.2" fill="rgba(255,255,255,0.35)" />
    </svg>
  )
}
