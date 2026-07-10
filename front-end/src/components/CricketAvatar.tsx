import { useState, useRef } from 'react'

function PlayerSVG() {
  return (
    <svg viewBox="0 0 200 430" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">

      {/* Ground shadow */}
      <ellipse cx="100" cy="422" rx="50" ry="7" fill="#D4CAB8" opacity="0.45"/>

      {/* ── BAT (behind body) ── */}
      {/* Handle */}
      <rect x="144" y="138" width="13" height="82" rx="6.5" fill="#3D2008"/>
      <g stroke="#2A1405" strokeWidth="1.5" opacity="0.5">
        <line x1="145" y1="152" x2="156" y2="152"/>
        <line x1="145" y1="162" x2="156" y2="162"/>
        <line x1="145" y1="172" x2="156" y2="172"/>
        <line x1="145" y1="182" x2="156" y2="182"/>
        <line x1="145" y1="192" x2="156" y2="192"/>
      </g>
      {/* Blade */}
      <path d="M136 218 Q132 325 136 375 Q141 384 149 382 Q157 380 160 373 Q163 323 159 218 Z" fill="#9C7830"/>
      <path d="M139 220 Q136 320 139 368 Q143 376 149 374 Q155 374 157 368 Q159 320 156 220 Z" fill="#C09840"/>
      {/* Edge highlight */}
      <path d="M159 222 Q163 322 159 370" stroke="#C8A845" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      {/* Toe */}
      <ellipse cx="148" cy="376" rx="14" ry="5" fill="#8C6A28" opacity="0.75"/>

      {/* ── SHOES ── */}
      <path d="M68 406 Q56 408 53 415 Q65 422 81 420 L87 408 Z" fill="#1C2235"/>
      <path d="M120 406 Q132 408 135 415 Q123 422 107 420 L101 408 Z" fill="#1C2235"/>
      {/* Sole highlight */}
      <path d="M56 413 Q66 411 80 413" stroke="#2A3248" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M108 413 Q120 411 132 413" stroke="#2A3248" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>

      {/* ── PADS ── */}
      {/* Left */}
      <rect x="58" y="304" width="34" height="102" rx="12" fill="#F0EDE5" stroke="#D4CCC0" strokeWidth="1.5"/>
      <rect x="60" y="320" width="30" height="5" rx="2.5" fill="#DDD5C5"/>
      <rect x="60" y="346" width="30" height="5" rx="2.5" fill="#DDD5C5"/>
      <rect x="60" y="372" width="30" height="5" rx="2.5" fill="#DDD5C5"/>
      <rect x="60" y="394" width="30" height="5" rx="2.5" fill="#DDD5C5"/>
      {/* Right */}
      <rect x="108" y="302" width="34" height="102" rx="12" fill="#F0EDE5" stroke="#D4CCC0" strokeWidth="1.5"/>
      <rect x="110" y="318" width="30" height="5" rx="2.5" fill="#DDD5C5"/>
      <rect x="110" y="344" width="30" height="5" rx="2.5" fill="#DDD5C5"/>
      <rect x="110" y="370" width="30" height="5" rx="2.5" fill="#DDD5C5"/>
      <rect x="110" y="392" width="30" height="5" rx="2.5" fill="#DDD5C5"/>

      {/* ── PANTS (white cricket trousers) ── */}
      {/* Left leg */}
      <path d="M72 250 Q65 308 59 304 L93 302 Q96 296 97 250 Z" fill="#F5F3EF"/>
      {/* Right leg */}
      <path d="M128 250 Q135 306 141 302 L107 300 Q104 294 103 250 Z" fill="#F5F3EF"/>
      {/* Crease line */}
      <path d="M74 250 Q70 285 66 302" stroke="#DDD8D0" strokeWidth="1" opacity="0.6" fill="none"/>
      <path d="M126 250 Q130 283 134 300" stroke="#DDD8D0" strokeWidth="1" opacity="0.6" fill="none"/>

      {/* ── JERSEY ── */}
      <path d="M56 124 Q54 252 58 254 L142 254 Q146 252 144 124 Q100 113 56 124 Z" fill="#0038A8"/>
      {/* Side shading */}
      <path d="M56 127 Q54 228 58 254 L65 254 Q61 228 63 127 Z" fill="#002A8C" opacity="0.55"/>
      <path d="M144 127 Q146 228 142 254 L135 254 Q139 228 137 127 Z" fill="#002A8C" opacity="0.55"/>
      {/* Collar */}
      <path d="M84 124 Q100 115 116 124 L113 135 Q100 128 87 135 Z" fill="#002C90"/>
      {/* Jersey number */}
      <text x="100" y="203" textAnchor="middle" fill="rgba(255,255,255,0.92)" fontSize="30" fontWeight="800" fontFamily="Inter, sans-serif">7</text>

      {/* ── ARMS ── */}
      {/* Left arm */}
      <path d="M58 136 Q44 180 45 212 Q58 230 74 234" stroke="#0038A8" strokeWidth="24" strokeLinecap="round" fill="none"/>
      <path d="M58 136 Q44 180 45 212 Q58 230 74 234" stroke="#002C90" strokeWidth="15" strokeLinecap="round" fill="none"/>
      {/* Right arm */}
      <path d="M142 136 Q156 180 155 212 Q143 230 132 234" stroke="#0038A8" strokeWidth="24" strokeLinecap="round" fill="none"/>
      <path d="M142 136 Q156 180 155 212 Q143 230 132 234" stroke="#002C90" strokeWidth="15" strokeLinecap="round" fill="none"/>

      {/* ── GLOVES ── */}
      {/* Left */}
      <ellipse cx="77" cy="238" rx="18" ry="14" fill="#7A2E0A"/>
      <ellipse cx="77" cy="238" rx="14" ry="10" fill="#953C14"/>
      <g stroke="#6A2408" strokeWidth="1" opacity="0.5">
        <line x1="67" y1="234" x2="65" y2="244"/><line x1="72" y1="230" x2="70" y2="242"/>
        <line x1="78" y1="229" x2="77" y2="241"/><line x1="84" y1="231" x2="84" y2="242"/>
      </g>
      {/* Right */}
      <ellipse cx="129" cy="238" rx="18" ry="14" fill="#7A2E0A"/>
      <ellipse cx="129" cy="238" rx="14" ry="10" fill="#953C14"/>
      <g stroke="#6A2408" strokeWidth="1" opacity="0.5">
        <line x1="119" y1="234" x2="117" y2="244"/><line x1="124" y1="230" x2="122" y2="242"/>
        <line x1="130" y1="229" x2="129" y2="241"/><line x1="136" y1="231" x2="136" y2="242"/>
      </g>

      {/* ── NECK ── */}
      <path d="M86 108 Q100 102 114 108 L114 125 Q100 119 86 125 Z" fill="#C08A5A"/>

      {/* ── HEAD ── */}
      <circle cx="100" cy="70" r="36" fill="#C8936A"/>
      {/* Ear left */}
      <ellipse cx="65" cy="72" rx="6.5" ry="8.5" fill="#B8824A"/>
      {/* Inner ear */}
      <path d="M67 69 Q69 72 67 76" stroke="#A87040" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"/>
      {/* Ear right */}
      <ellipse cx="135" cy="72" rx="6.5" ry="8.5" fill="#B8824A"/>
      <path d="M133 69 Q131 72 133 76" stroke="#A87040" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"/>

      {/* ── HELMET ── */}
      {/* Main dome */}
      <path d="M64 64 Q64 20 100 16 Q136 20 136 64 L136 92 Q100 106 64 92 Z" fill="#0038A8"/>
      {/* Dome highlight */}
      <path d="M76 24 Q99 16 124 22" stroke="rgba(255,255,255,0.18)" strokeWidth="5" strokeLinecap="round" fill="none"/>
      {/* Side seam */}
      <path d="M64 64 Q62 76 64 90" stroke="#002A8C" strokeWidth="2" fill="none" opacity="0.6"/>
      <path d="M136 64 Q138 76 136 90" stroke="#002A8C" strokeWidth="2" fill="none" opacity="0.6"/>
      {/* Left ear guard */}
      <path d="M64 64 Q56 71 55 83 Q61 91 64 89 Z" fill="#002A8C"/>
      {/* Right ear guard */}
      <path d="M136 64 Q144 71 145 83 Q139 91 136 89 Z" fill="#002A8C"/>
      {/* Visor */}
      <path d="M64 64 Q52 68 50 77 Q57 86 64 84" fill="#001C70"/>

      {/* Chin straps */}
      <path d="M64 89 Q74 101 86 108" stroke="#002A8C" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M136 89 Q126 101 114 108" stroke="#002A8C" strokeWidth="5" strokeLinecap="round" fill="none"/>

      {/* ── FACE GUARD — vertical bars ── */}
      <g stroke="#B0C4D6" strokeWidth="2.5" strokeLinecap="round">
        <line x1="72"  y1="66" x2="72"  y2="88"/>
        <line x1="79"  y1="64" x2="79"  y2="90"/>
        <line x1="86"  y1="63" x2="86"  y2="92"/>
        <line x1="93"  y1="63" x2="93"  y2="93"/>
        <line x1="100" y1="63" x2="100" y2="93"/>
        <line x1="107" y1="63" x2="107" y2="92"/>
        <line x1="114" y1="64" x2="114" y2="90"/>
      </g>
      {/* Horizontal bars */}
      <g stroke="#B0C4D6" strokeWidth="1.5" opacity="0.7">
        <line x1="71" y1="74" x2="115" y2="73"/>
        <line x1="71" y1="84" x2="115" y2="84"/>
      </g>

      {/* ── EYES — both visible through grille ── */}
      <circle cx="87" cy="77" r="4.2" fill="#1A1208" opacity="0.65"/>
      <circle cx="109" cy="77" r="4.2" fill="#1A1208" opacity="0.65"/>
      {/* Highlights */}
      <circle cx="88.5" cy="75.5" r="1.5" fill="rgba(255,255,255,0.45)"/>
      <circle cx="110.5" cy="75.5" r="1.5" fill="rgba(255,255,255,0.45)"/>

    </svg>
  )
}

// ── Drag-to-rotate wrapper ────────────────────────────────────────────────────

export function CricketAvatar() {
  const [rotY, setRotY] = useState(0)
  const dragging = useRef(false)
  const startX   = useRef(0)
  const startRot = useRef(0)

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true
    startX.current   = e.clientX
    startRot.current = rotY
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return
    const delta = (e.clientX - startX.current) * 0.55
    setRotY(Math.max(-40, Math.min(40, startRot.current + delta)))
  }

  function onPointerUp() {
    dragging.current = false
    // Spring back to centre
    setRotY(0)
  }

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        transform: `perspective(900px) rotateY(${rotY}deg)`,
        transition: dragging.current ? 'none' : 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        cursor: dragging.current ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <PlayerSVG />
    </div>
  )
}
