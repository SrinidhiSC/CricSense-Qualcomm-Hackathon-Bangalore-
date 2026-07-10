import { AppShell } from '../layout/AppShell'

export default function Players() {
  return (
    <AppShell>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="label mb-1">Roster</p>
          <h1 className="text-2xl font-black text-ink-600 tracking-tight">Players</h1>
        </div>
        <button className="btn-primary">+ New Player</button>
      </div>

      {/* Empty state with geometric art */}
      <div className="card p-12 flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ minHeight: 320 }}>
        <div className="geo-ring w-48 h-48 -top-12 -right-12 border-cream-200" />
        <div className="geo-ring w-24 h-24 bottom-4 left-4 border-cream-300" />
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-cream-100 flex items-center justify-center text-3xl mb-4 mx-auto">🏏</div>
          <h2 className="text-lg font-bold text-ink-500 mb-2">No players yet</h2>
          <p className="text-sm text-ink-200 mb-6 max-w-xs">Create your first player profile to start tracking batting performance.</p>
          <button className="btn-primary">Create First Player</button>
        </div>
      </div>
    </AppShell>
  )
}
