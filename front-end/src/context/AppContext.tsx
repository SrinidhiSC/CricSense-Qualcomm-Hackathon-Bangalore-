import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface ActivePlayer {
  id: string
  name: string
  jerseyNumber: number
  category?: string
  hand?: 'Right' | 'Left'
  age?: number
}

interface AppContextValue {
  activePlayer: ActivePlayer | null
  setActivePlayer: (p: ActivePlayer | null) => void
  isAuthenticated: boolean
  signOut: () => void
}

const AppContext = createContext<AppContextValue>({
  activePlayer: null,
  setActivePlayer: () => {},
  isAuthenticated: false,
  signOut: () => {},
})

export function AppProvider({ children }: { children: ReactNode }) {
  const [activePlayer, setActivePlayer] = useState<ActivePlayer | null>(null)

  const isAuthenticated = activePlayer !== null

  function signOut() {
    setActivePlayer(null)
  }

  return (
    <AppContext.Provider value={{ activePlayer, setActivePlayer, isAuthenticated, signOut }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
