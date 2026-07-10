export function CoachAvatar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ── SHIRT / SHOULDERS ── */}
      <path
        d="M18 240 Q22 182 55 170 Q76 162 100 160 Q124 162 145 170 Q178 182 182 240 Z"
        fill="#1F3A6E"
      />
      {/* Shirt collar V */}
      <path
        d="M88 164 L100 178 L112 164"
        stroke="#162C56"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Shirt chest stripe */}
      <path
        d="M100 178 L100 240"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="10"
      />

      {/* ── NECK ── */}
      <path
        d="M86 150 Q100 145 114 150 L114 168 Q100 165 86 168 Z"
        fill="#C08A5A"
      />

      {/* ── HEAD ── */}
      <circle cx="100" cy="98" r="54" fill="#C8936A" />

      {/* ── EARS ── */}
      <ellipse cx="48" cy="100" rx="7" ry="9" fill="#B8824A" />
      <ellipse cx="152" cy="100" rx="7" ry="9" fill="#B8824A" />
      {/* Ear canal detail */}
      <path d="M50 97 Q52 100 50 103" stroke="#A87240" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M150 97 Q148 100 150 103" stroke="#A87240" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />

      {/* ── GREY HAIR (sides, visible below cap) ── */}
      <path d="M48 95 Q46 78 56 64" stroke="#B0A898" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M152 95 Q154 78 144 64" stroke="#B0A898" strokeWidth="9" strokeLinecap="round" fill="none" />

      {/* ── CRICKET CAP ── */}
      {/* Cap dome */}
      <path d="M52 82 Q52 36 100 32 Q148 36 148 82 Z" fill="#1F2A4A" />
      {/* Cap highlight */}
      <path d="M62 44 Q96 32 130 40" stroke="rgba(255,255,255,0.1)" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Cap band */}
      <path d="M52 82 Q100 77 148 82" stroke="#283558" strokeWidth="3.5" fill="none" />
      {/* Visor */}
      <path d="M44 86 Q100 80 156 86 Q148 96 44 86 Z" fill="#162040" />
      {/* Visor edge highlight */}
      <path d="M46 87 Q100 82 154 87" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />

      {/* ── EYEBROWS (grey, friendly arch) ── */}
      <path d="M70 92 Q81 87 93 90" stroke="#8A7A6A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M107 90 Q119 87 130 92" stroke="#8A7A6A" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* ── GLASSES ── */}
      {/* Left lens */}
      <rect x="68" y="94" width="28" height="19" rx="9" stroke="#5A5248" strokeWidth="1.8" fill="rgba(180,210,240,0.12)" />
      {/* Right lens */}
      <rect x="104" y="94" width="28" height="19" rx="9" stroke="#5A5248" strokeWidth="1.8" fill="rgba(180,210,240,0.12)" />
      {/* Bridge */}
      <path d="M96 103 Q100 101 104 103" stroke="#5A5248" strokeWidth="1.8" fill="none" />
      {/* Temple arms */}
      <path d="M68 103 L58 101" stroke="#5A5248" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M132 103 L142 101" stroke="#5A5248" strokeWidth="1.8" strokeLinecap="round" />

      {/* ── EYES ── */}
      <circle cx="82" cy="103" r="4.5" fill="#2E2010" />
      <circle cx="118" cy="103" r="4.5" fill="#2E2010" />
      {/* Shine */}
      <circle cx="84" cy="101" r="1.4" fill="rgba(255,255,255,0.55)" />
      <circle cx="120" cy="101" r="1.4" fill="rgba(255,255,255,0.55)" />

      {/* ── NOSE ── */}
      <path
        d="M100 114 Q97 122 95 124 Q100 127 105 124 Q103 122 100 114 Z"
        fill="#B8824A"
        opacity="0.45"
      />

      {/* ── MOUSTACHE ── */}
      <path
        d="M89 127 Q95 124 100 127 Q105 124 111 127"
        stroke="#7A6858"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── SMILE ── */}
      <path
        d="M88 134 Q100 144 112 134"
        stroke="#9A6A42"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── AGE LINES (subtle) ── */}
      <path d="M66 93 Q64 100 66 108" stroke="#B07840" strokeWidth="0.7" opacity="0.2" fill="none" />
      <path d="M134 93 Q136 100 134 108" stroke="#B07840" strokeWidth="0.7" opacity="0.2" fill="none" />
      {/* Forehead line */}
      <path d="M80 84 Q100 82 120 84" stroke="#B07840" strokeWidth="0.5" opacity="0.15" fill="none" />
    </svg>
  )
}
