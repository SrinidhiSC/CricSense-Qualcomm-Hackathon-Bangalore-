import { NavLink } from 'react-router-dom'

// Placeholder device pills — will receive real data in Step 2
const DEVICES = [
  { key: 'arduino', label: 'Bat', on: false },
  { key: 'phone',   label: 'Pose', on: false },
  { key: 'npu',     label: 'NPU', on: true  },
  { key: 'cloud',   label: 'Cloud', on: true },
]

export function TopBar() {
  return (
    <header className="h-14 bg-white border-b border-ink-100 flex items-center px-5 gap-4 z-20 shrink-0">
      {/* Wordmark */}
      <NavLink to="/" className="flex items-center gap-2.5 mr-4">
        {/* Geometric logo mark */}
        <span className="relative flex items-center justify-center w-8 h-8">
          <span className="absolute inset-0 rounded-full border-2 border-ink-600" />
          <span className="absolute w-4 h-4 rounded-full border-2 border-pitch-500" />
          <span className="w-1.5 h-1.5 rounded-full bg-ink-600" />
        </span>
        <span className="text-sm font-black tracking-tight text-ink-600">
          Cric<span className="text-pitch-500">Sense</span>
        </span>
      </NavLink>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-1">
        <TopNavLink to="/dashboard" label="Live" />
        <TopNavLink to="/history"   label="History" />
        <TopNavLink to="/players"   label="Players" />
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Device status pills */}
      <div className="hidden sm:flex items-center gap-1.5">
        {DEVICES.map(d => (
          <span
            key={d.key}
            className={`badge ${
              d.on
                ? 'bg-pitch-50 text-pitch-600 border border-pitch-100'
                : 'bg-cream-100 text-ink-300 border border-ink-100'
            }`}
          >
            <span className={d.on ? 'dot-on' : 'dot-off'} />
            {d.label}
          </span>
        ))}
      </div>

      {/* Session button */}
      <button className="btn-primary text-xs py-2 px-4">
        Start Session
      </button>
    </header>
  )
}

function TopNavLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-cream-100 text-ink-600'
            : 'text-ink-300 hover:text-ink-600 hover:bg-cream-50'
        }`
      }
    >
      {label}
    </NavLink>
  )
}
