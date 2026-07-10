import { useEffect, useRef, useState, useCallback } from 'react'
import type { WSFrame, SessionPhase } from '../types'
import { buildMockFrame } from '../mocks/mockFrames'
import { WS_URL, MOCK_MODE } from '../config'

const PHASE_DURATIONS: Record<SessionPhase, number> = {
  startup:       1500,
  tracking:      6000,
  shot_detected:  500,
  qa_active:     3000,
  report:           0,
}

const PHASE_CYCLE: SessionPhase[] = ['tracking', 'shot_detected', 'qa_active', 'tracking']

export function useWebSocket() {
  const [frame, setFrame]   = useState<WSFrame | null>(null)
  const [phase, setPhase]   = useState<SessionPhase>('startup')
  const [connected, setConnected] = useState(false)

  const wsRef        = useRef<WebSocket | null>(null)
  const phaseRef     = useRef<SessionPhase>('startup')
  const cycleIdxRef  = useRef(0)
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef       = useRef<number | null>(null)
  const stoppedRef   = useRef(false)

  const updatePhase = useCallback((p: SessionPhase) => {
    phaseRef.current = p
    setPhase(p)
  }, [])

  // Mock state machine
  const runMockMachine = useCallback(() => {
    if (stoppedRef.current) return

    // Startup phase first
    timerRef.current = setTimeout(() => {
      if (stoppedRef.current) return
      setConnected(true)
      updatePhase('tracking')

      const tick = () => {
        if (stoppedRef.current) return
        setFrame(buildMockFrame(phaseRef.current))
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)

      const cycleThroughPhases = () => {
        if (stoppedRef.current) return
        const nextPhase = PHASE_CYCLE[cycleIdxRef.current % PHASE_CYCLE.length]
        cycleIdxRef.current++
        updatePhase(nextPhase)
        timerRef.current = setTimeout(cycleThroughPhases, PHASE_DURATIONS[nextPhase] || 4000)
      }

      timerRef.current = setTimeout(cycleThroughPhases, PHASE_DURATIONS.tracking)
    }, PHASE_DURATIONS.startup)
  }, [updatePhase])

  // Real WebSocket
  const connectReal = useCallback(() => {
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen  = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onerror = () => setConnected(false)
    ws.onmessage = (ev) => {
      try {
        const data: WSFrame = JSON.parse(ev.data)
        setFrame(data)
        updatePhase(data.phase)
      } catch { /* ignore malformed frames */ }
    }
  }, [updatePhase])

  useEffect(() => {
    stoppedRef.current = false

    if (MOCK_MODE) {
      runMockMachine()
    } else {
      connectReal()
    }

    return () => {
      stoppedRef.current = true
      if (timerRef.current) clearTimeout(timerRef.current)
      if (rafRef.current)   cancelAnimationFrame(rafRef.current)
      if (wsRef.current)    wsRef.current.close()
    }
  }, [runMockMachine, connectReal])

  return { frame, phase, connected }
}
