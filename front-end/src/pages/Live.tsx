import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../layout/AppShell'
import { PoseCanvas } from '../components/PoseCanvas'
import { CoachAvatar } from '../components/CoachAvatar'
import { useWebSocket } from '../hooks/useWebSocket'
import { useApp } from '../context/AppContext'
import type { CoachingCue, SessionPhase } from '../types'

// ── Phase meta ─────────────────────────────────────────────────────────────────

const PHASE_META: Record<SessionPhase, { label: string; color: string; dot: string }> = {
  startup:       { label: 'Initialising',  color: 'bg-ink-200 text-ink-500',    dot: 'bg-ink-300'   },
  tracking:      { label: 'Tracking',      color: 'bg-pitch-50 text-pitch-700', dot: 'bg-pitch-400' },
  shot_detected: { label: 'Shot Detected', color: 'bg-amber-400 text-white',    dot: 'bg-white'     },
  qa_active:     { label: 'Coaching',      color: 'bg-ink-600 text-white',      dot: 'bg-pitch-400' },
  report:        { label: 'Report',        color: 'bg-cream-200 text-ink-500',  dot: 'bg-ink-300'   },
}

// ── TTS ────────────────────────────────────────────────────────────────────────

function speakCue(cue: CoachingCue) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(cue.text)
  u.lang  = cue.lang === 'hi' ? 'hi-IN' : 'en-US'
  u.rate  = 0.92
  u.pitch = 1.0
  window.speechSynthesis.speak(u)
}

// ── Coach card with speech bubble ─────────────────────────────────────────────

interface CoachCardProps {
  coaching: CoachingCue | null
  phase: SessionPhase
}

function CoachCard({ coaching, phase }: CoachCardProps) {
  // Use coaching.text as the key so the bubble re-animates on each new cue
  const bubbleKey = coaching?.text ?? 'idle'

  const idleText =
    phase === 'tracking'
      ? 'Watching your stance… play a shot.'
      : phase === 'startup'
        ? 'Waiting for devices to connect…'
        : 'Ready.'

  return (
    <div className="card p-4">
      <p className="text-sm font-bold text-ink-600 mb-3">Coach</p>

      <div className="flex items-end gap-4">
        {/* Avatar */}
        <div className="shrink-0 w-24">
          <CoachAvatar
            className={`w-full ${coaching ? 'animate-speak' : ''}`}
          />
        </div>

        {/* Speech bubble */}
        <div className="flex-1 relative min-h-[72px]">
          {/* Bubble tail */}
          <div className="absolute -left-3 bottom-5 w-0 h-0"
               style={{ borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: '12px solid #F9F6EF' }} />
          <div className="absolute -left-2.5 bottom-5 w-0 h-0"
               style={{ borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderRight: '11px solid #E8E4DC' }} />

          <div
            key={bubbleKey}
            className={`bg-cream-100 border border-ink-100 rounded-2xl rounded-bl-none px-4 py-3 animate-fade-slide`}
          >
            {coaching ? (
              <>
                <p className="text-sm font-semibold text-ink-600 leading-snug">
                  {coaching.text}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="badge bg-white text-ink-400 border border-ink-100 text-xs">
                    {coaching.lang === 'hi' ? 'Hindi' : 'English'}
                  </span>
                  <span className={`badge border text-xs ${
                    coaching.source === 'llm'
                      ? 'bg-pitch-50 text-pitch-700 border-pitch-100'
                      : 'bg-cream-200 text-ink-400 border-ink-100'
                  }`}>
                    {coaching.source === 'llm' ? 'AI' : 'Rule'}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-ink-300 italic">{idleText}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Gauge bar ──────────────────────────────────────────────────────────────────

function GaugeBar({ value, max, ideal, label, unit }: {
  value: number; max: number; ideal: [number, number]; label: string; unit: string
}) {
  const pct    = Math.min((value / max) * 100, 100)
  const inZone = value >= ideal[0] && value <= ideal[1]
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-ink-300">{label}</span>
        <span className={`text-sm font-black ${inZone ? 'text-pitch-500' : 'text-amber-400'}`}>
          {value.toFixed(0)}{unit}
        </span>
      </div>
      <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${inZone ? 'bg-pitch-400' : 'bg-amber-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-ink-200 mt-0.5">ideal {ideal[0]}–{ideal[1]}{unit}</p>
    </div>
  )
}

// ── Device dot ────────────────────────────────────────────────────────────────

function DeviceDot({ on, label }: { on: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full shrink-0 ${on ? 'bg-pitch-400' : 'bg-alert-400'}`} />
      <span className="text-xs text-ink-400">{label}</span>
    </div>
  )
}

// ── Metric tile ───────────────────────────────────────────────────────────────

function MetricTile({ label, value, unit, highlight }: {
  label: string; value: string; unit: string; highlight: boolean
}) {
  return (
    <div className={`rounded-xl p-3 text-center transition-colors duration-300 ${
      highlight ? 'bg-amber-400' : 'bg-cream-100'
    }`}>
      <p className={`text-xs mb-1 ${highlight ? 'text-white' : 'text-ink-300'}`}>{label}</p>
      <p className={`text-lg font-black leading-none ${highlight ? 'text-white' : 'text-ink-600'}`}>
        {value}
        <span className={`text-xs font-medium ${highlight ? 'text-white' : 'text-ink-300'}`}>{unit}</span>
      </p>
    </div>
  )
}

// ── LLM status badge ──────────────────────────────────────────────────────────

function LLMStatusBadge({ status }: { status: string }) {
  if (status === 'thinking') {
    return (
      <span className="flex items-center gap-2 text-xs font-semibold text-pitch-500">
        <span className="w-3 h-3 rounded-full border-2 border-pitch-400 border-t-transparent animate-spin" />
        Thinking…
      </span>
    )
  }
  if (status === 'replied') {
    return (
      <span className="flex items-center gap-2 text-xs font-semibold text-pitch-500">
        <span className="w-2 h-2 rounded-full bg-pitch-400" />
        Reply ready
      </span>
    )
  }
  return (
    <span className="flex items-center gap-2 text-xs text-ink-300">
      <span className="w-2 h-2 rounded-full bg-ink-200" />
      Idle
    </span>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Live() {
  const navigate           = useNavigate()
  const { activePlayer }   = useApp()
  const { frame, phase, connected } = useWebSocket()

  const [shotCount, setShotCount] = useState(0)
  const [elapsed, setElapsed]     = useState(0)
  const startTimeRef = useRef(Date.now())
  const prevPhaseRef = useRef<SessionPhase>('startup')

  // Shot counter + TTS trigger
  useEffect(() => {
    if (phase === 'shot_detected' && prevPhaseRef.current !== 'shot_detected') {
      setShotCount(n => n + 1)
    }
    prevPhaseRef.current = phase
  }, [phase])

  // Speak coaching cue via browser TTS when a new one arrives
  useEffect(() => {
    if (frame?.coaching) {
      speakCue(frame.coaching)
    }
  }, [frame?.coaching?.text])

  // Session timer
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  const pm      = PHASE_META[phase]
  const metrics = frame?.metrics
  const bat     = frame?.bat
  const devices = frame?.devices

  return (
    <AppShell>
      <div className="p-6 space-y-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-black text-ink-600 tracking-tight">Live Session</h1>
              <p className="text-xs text-ink-300 mt-0.5">{activePlayer?.name ?? 'Player'}</p>
            </div>
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${pm.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />
              {pm.label}
            </span>
            <span className={`flex items-center gap-1.5 text-xs font-medium ${connected ? 'text-pitch-500' : 'text-alert-400'}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-pitch-400 animate-pulse' : 'bg-alert-400'}`} />
              {connected ? 'Connected' : 'Connecting…'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-ink-300">Shots</p>
              <p className="text-2xl font-black text-ink-600 leading-none">{shotCount}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-300">Duration</p>
              <p className="text-2xl font-black text-ink-600 leading-none font-mono">{mm}:{ss}</p>
            </div>
            <button
              onClick={() => { window.speechSynthesis.cancel(); navigate('/dashboard') }}
              className="btn-ghost text-alert-400 border border-alert-400 hover:bg-alert-100"
            >
              End Session
            </button>
          </div>
        </div>

        {/* ── Body grid ── */}
        <div className="grid grid-cols-5 gap-4">

          {/* ── Left col: Pose + Bat sensor ── */}
          <div className="col-span-2 space-y-4">

            {/* Pose feed */}
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between">
                <p className="text-sm font-bold text-ink-600">Pose Feed</p>
                <span className="text-xs text-ink-300">OnePlus 15 · MediaPipe</span>
              </div>
              <div className="bg-ink-900 relative flex items-center justify-center" style={{ minHeight: 360 }}>
                <PoseCanvas
                  keypoints={frame?.keypoints ?? null}
                  width={360}
                  height={360}
                  className="block"
                />
                {phase === 'startup' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-pitch-400 border-t-transparent animate-spin" />
                    <p className="text-xs text-ink-300">Waiting for pose data…</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bat sensor */}
            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-ink-600">Bat Sensor</p>
                <span className="text-xs text-ink-300">Arduino · IMU</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <MetricTile
                  label="Swing Speed"
                  value={bat ? bat.swing.toFixed(1) : '—'}
                  unit=" km/h"
                  highlight={phase === 'shot_detected'}
                />
                <MetricTile
                  label="Wrist Snap"
                  value={bat ? bat.wrist.toFixed(0) : '—'}
                  unit="°"
                  highlight={phase === 'shot_detected'}
                />
                <MetricTile
                  label="Wrist Rate"
                  value={bat ? bat.wristRate.toFixed(0) : '—'}
                  unit="°/s"
                  highlight={false}
                />
              </div>
              {bat?.impact === 1 && (
                <div className="bg-amber-400 text-white text-xs font-bold text-center py-1.5 rounded-xl animate-pulse">
                  IMPACT DETECTED
                </div>
              )}
            </div>
          </div>

          {/* ── Right col: Data + Coach ── */}
          <div className="col-span-3 space-y-4">

            {/* Device status */}
            <div className="card p-4">
              <p className="text-sm font-bold text-ink-600 mb-3">Devices</p>
              <div className="grid grid-cols-4 gap-3">
                <DeviceDot on={devices?.arduino ?? false} label="Arduino" />
                <DeviceDot on={devices?.phone   ?? false} label="OnePlus 15" />
                <DeviceDot on={devices?.npu     ?? false} label="NPU" />
                <DeviceDot on={devices?.cloud   ?? false} label="Cloud AI" />
              </div>
            </div>

            {/* Body mechanics */}
            <div className="card p-4 space-y-4">
              <p className="text-sm font-bold text-ink-600">Body Mechanics</p>
              <GaugeBar
                label="Elbow Angle" value={metrics?.elbow ?? 0}
                max={180} ideal={[100, 130]} unit="°"
              />
              <GaugeBar
                label="Knee Bend" value={metrics?.knee ?? 0}
                max={180} ideal={[140, 160]} unit="°"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-300">Head Position</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  metrics?.head === 'over front knee'
                    ? 'bg-pitch-50 text-pitch-700'
                    : 'bg-amber-400 text-white'
                }`}>
                  {metrics?.head ?? '—'}
                </span>
              </div>
            </div>

            {/* ── Coach card with avatar + speech bubble ── */}
            <CoachCard coaching={frame?.coaching ?? null} phase={phase} />

            {/* Shot log */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-ink-600">Shot Log</p>
                <span className="text-xs text-ink-300">{shotCount} shot{shotCount !== 1 ? 's' : ''} this session</span>
              </div>
              {shotCount === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-ink-200">No shots recorded yet. Play a shot to see data here.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: shotCount }).map((_, i) => (
                    <span
                      key={i}
                      className="w-8 h-8 rounded-xl bg-cream-100 border border-ink-100 flex items-center justify-center text-xs font-bold text-ink-500"
                    >
                      {i + 1}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* AI status */}
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-ink-600">On-device AI</p>
                  <p className="text-xs text-ink-300 mt-0.5">Snapdragon® NPU · Gemma-3</p>
                </div>
                <LLMStatusBadge status={frame?.llmStatus ?? 'idle'} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  )
}
