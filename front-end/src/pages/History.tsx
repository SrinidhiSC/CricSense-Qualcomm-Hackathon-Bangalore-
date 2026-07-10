import { AppShell } from '../layout/AppShell'

export default function History() {
  return (
    <AppShell>
      <div className="mb-5">
        <p className="label mb-1">Sessions</p>
        <h1 className="text-2xl font-black text-ink-600 tracking-tight">History</h1>
      </div>

      <div className="card p-12 flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ minHeight: 320 }}>
        <div className="geo-ring w-40 h-40 -top-8 -left-8 border-cream-200" />
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-cream-100 flex items-center justify-center text-3xl mb-4 mx-auto">📊</div>
          <h2 className="text-lg font-bold text-ink-500 mb-2">No sessions recorded</h2>
          <p className="text-sm text-ink-200 max-w-xs">Complete a live session to see your history and AI-generated reports here.</p>
        </div>
      </div>
    </AppShell>
  )
}
