import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const NAV = [
  { to: '/dashboard', label: 'Dashboard',   icon: DashboardIcon },
  { to: '/live',      label: 'Live Session', icon: LiveIcon },
  { to: '/history',   label: 'History',     icon: HistoryIcon },
]

export function Sidebar() {
  const { activePlayer, signOut } = useApp()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  function handleSignOut() {
    signOut()
    navigate('/auth')
  }

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-56 xl:w-60'
      } bg-white border-r border-ink-100 flex flex-col shrink-0 h-full transition-all duration-200 overflow-hidden`}
    >

      {/* Brand + toggle */}
      <div className={`border-b border-ink-100 flex items-center ${collapsed ? 'justify-center px-0 py-5' : 'px-5 py-5'}`}>
        {collapsed ? (
          /* Collapsed: just the logomark, acts as toggle */
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            className="flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <LogoMark />
          </button>
        ) : (
          /* Expanded: logo + wordmark + collapse button */
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="flex items-center gap-2.5">
                <LogoMark />
                <span className="text-sm font-black tracking-tight text-ink-600 whitespace-nowrap">
                  Cric<span className="text-pitch-500">Sense</span>
                </span>
              </div>
              <p className="text-xs text-ink-200 mt-1.5 font-medium whitespace-nowrap">Batting Intelligence</p>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              className="text-ink-300 hover:text-ink-600 transition-colors p-1 rounded-lg hover:bg-cream-100 shrink-0"
            >
              <ChevronLeftIcon />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
        {!collapsed && (
          <p className="label px-2 mb-3">Navigation</p>
        )}

        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-xl transition-all duration-150 ${
                collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-ink-600 text-white shadow-card'
                  : 'text-ink-400 hover:bg-cream-100 hover:text-ink-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : ''}`} />
                {!collapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className={`border-t border-ink-100 space-y-3 ${collapsed ? 'p-2' : 'p-4'}`}>

        {/* Player identity */}
        {activePlayer && (
          collapsed ? (
            /* Collapsed: just avatar initial with sign-out on click */
            <button
              onClick={handleSignOut}
              title={`Sign out (${activePlayer.name})`}
              className="w-full flex justify-center"
            >
              <span className="w-8 h-8 rounded-full bg-ink-600 flex items-center justify-center text-white text-xs font-black hover:bg-ink-500 transition-colors">
                {activePlayer.name.charAt(0)}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5 px-1">
              <span className="w-7 h-7 rounded-full bg-ink-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                {activePlayer.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-ink-600 truncate">{activePlayer.name}</p>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-ink-300 hover:text-ink-500 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          )
        )}

        {/* Snapdragon badge — hidden when collapsed */}
        {!collapsed && (
          <div className="relative rounded-2xl bg-cream-100 p-3 overflow-hidden">
            <span className="absolute -right-4 -top-4 w-16 h-16 rounded-full border-2 border-cream-300 pointer-events-none" />
            <span className="absolute -right-1 -bottom-3 w-8 h-8 rounded-full border-2 border-cream-200 pointer-events-none" />
            <p className="relative text-xs text-ink-300 leading-relaxed whitespace-nowrap">
              On-device AI<br />
              <span className="font-semibold text-ink-500">Snapdragon® NPU</span>
            </p>
          </div>
        )}

        {/* Collapsed: small expand button at very bottom */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            className="w-full flex justify-center text-ink-300 hover:text-ink-600 transition-colors py-1"
          >
            <ChevronRightIcon />
          </button>
        )}
      </div>

    </aside>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function LogoMark() {
  return (
    <span className="relative flex items-center justify-center w-7 h-7 shrink-0">
      <span className="absolute inset-0 rounded-full border-2 border-ink-600" />
      <span className="absolute w-3.5 h-3.5 rounded-full border-2 border-pitch-500" />
      <span className="w-1 h-1 rounded-full bg-ink-600" />
    </span>
  )
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M10 4L6 8l4 4" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M6 4l4 4-4 4" />
    </svg>
  )
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  )
}

function LiveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M5.17 5.17a4 4 0 000 5.66M10.83 10.83a4 4 0 000-5.66" />
    </svg>
  )
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3l2 2" strokeLinejoin="round" />
    </svg>
  )
}
