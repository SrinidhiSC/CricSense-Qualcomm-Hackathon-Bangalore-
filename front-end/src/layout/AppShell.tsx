import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface Props {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  return (
    <div className="h-screen flex overflow-hidden bg-cream-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
