import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../layout/AppShell'
import { CricketAvatar } from '../components/CricketAvatar'
import { ChatBot } from '../components/ChatBot'
import { useApp } from '../context/AppContext'
import { PlayerAPI, type Player, type PlayerStats } from '../api'

// ── Mock data ─────────────────────────────────────────────────────────────────

const PLAYER = {
  name: 'Arjun Sharma',
  age: 17,
  category: 'U-19',
  hand: 'Right',
  jerseyNumber: 7,
  startDate: 'January 2023',
  experience: 'Intermediate',
  speciality: 'Middle-order batsman',
}

const KPI_DATA = [
  { label: 'Overall Score', value: '72', suffix: '/100', delta: '+4 this month' },
  { label: 'Attendance', value: '88', suffix: '%', delta: '+3% this month' },
  { label: 'Runs (YTD)', value: '1,240', suffix: '', delta: '' },
  { label: 'Fitness Score', value: '74', suffix: '/100', delta: '+2 this month' },
  { label: 'Coach Rating', value: '4.2', suffix: '/5', delta: '' },
]

const SUB_SCORES = [
  { label: 'Technique', value: 75 },
  { label: 'Fitness', value: 74 },
  { label: 'Discipline', value: 82 },
  { label: 'Match Awareness', value: 68 },
  { label: 'Mental Strength', value: 65 },
]

const TECHNIQUES = [
  { label: 'Front Foot Drives', score: 7.5 },
  { label: 'Defense', score: 6.8 },
  { label: 'Foot Movement', score: 6.2 },
  { label: 'Back Foot Play', score: 5.8 },
  { label: 'Cut Shot', score: 7.0 },
  { label: 'Pull Shot', score: 4.5 },
  { label: 'Balance', score: 7.8 },
  { label: 'Against Spin', score: 7.2 },
  { label: 'Footwork', score: 6.5 },
  { label: 'Reading Length', score: 7.0 },
  { label: 'Against Pace', score: 5.2 },
  { label: 'Timing', score: 8.0 },
  { label: 'Defensive Play', score: 7.3 },
]

const STRENGTHS = [
  'Strong cover drives with consistent follow-through',
  'Excellent concentration — plays each delivery on merit',
  'Reads spin bowling well from the hand',
]

const IMPROVEMENTS = [
  'Struggles against short-pitched bowling',
  'Plays away from body against outswing',
  'Slow strike rotation in the middle overs',
  'Off-spin on a turning pitch needs attention',
]

const GOALS = [
  { text: 'Improve front-foot defense against pace', done: true },
  { text: 'Face 500 balls against pace bowling in nets', done: false },
  { text: 'Reduce false shots by 20%', done: false },
  { text: 'Improve fitness score to 80+', done: false },
  { text: 'Complete the short-ball drill series', done: true },
]

const COACH_FEEDBACK = `Has shown excellent improvement in handling spin bowling over the past month. Footwork against left-arm orthodox has improved noticeably. Concentration at the crease remains a genuine strength — rarely throws away his wicket carelessly.\n\nThe key area needing attention is the short ball. Arjun must commit to a decisive response — either ducking under or pulling with conviction — rather than flinching with a half measure. Additional confidence work is recommended for high-pressure match situations.`

const PROGRESS_DATA = [
  { month: 'Jan', batting: 58, fitness: 66 },
  { month: 'Feb', batting: 64, fitness: 69 },
  { month: 'Mar', batting: 70, fitness: 72 },
  { month: 'Apr', batting: 76, fitness: 74 },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

interface DashboardData {
  player: Player
  stats: PlayerStats
}

function AvatarPanel({ data }: { data: DashboardData | null }) {
  const navigate = useNavigate()

  if (!data) {
    return (
      <div className="space-y-3">
        <div className="card relative overflow-hidden" style={{ height: 380 }}>
          <div className="flex items-center justify-center h-full">
            <p className="text-ink-300">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  const { player, stats } = data
  const skillLevelMap: Record<string, string> = {
    'Beginner': 'Beginner',
    'Amateur': 'Intermediate',
    'Club': 'Advanced',
    'Semi-Pro': 'Professional'
  }

  return (
    <div className="space-y-3">
      {/* 3D Player card */}
      <div className="card relative overflow-hidden" style={{ height: 380 }}>
        {/* Background rings */}
        <span className="absolute w-40 h-40 rounded-full border-2 border-cream-200 -top-10 -right-10 pointer-events-none z-10" />
        <span className="absolute w-20 h-20 rounded-full border-2 border-cream-300 bottom-20 -left-6 pointer-events-none z-10" />

        {/* Drag hint */}
        <span className="absolute bottom-3 left-0 right-0 text-center text-xs text-ink-200 z-10 pointer-events-none">
          drag to rotate
        </span>

        {/* Jersey number badge */}
        <div className="absolute top-4 left-4 w-9 h-9 bg-ink-600 rounded-xl flex items-center justify-center z-10">
          <span className="text-white text-sm font-black">7</span>
        </div>

        <CricketAvatar />
      </div>

      {/* Player identity */}
      <div className="card p-4">
        <h2 className="text-lg font-black text-ink-600 tracking-tight">{player.name}</h2>
        <p className="text-xs text-ink-300 mt-0.5">Cricket Player</p>

        <div className="mt-3 space-y-1.5">
          <Row label="Age" value={`${player.age} yrs`} />
          <Row label="Skill Level" value={player.skillLevel} />
          <Row label="Batting" value={`${player.hand.charAt(0).toUpperCase() + player.hand.slice(1)}-hand`} />
          <Row label="Experience" value={skillLevelMap[player.skillLevel] || player.skillLevel} />
          <Row label="Sessions" value={`${stats.totalSessions} completed`} />
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="badge bg-cream-100 text-ink-500 border border-ink-100 font-semibold">
            {player.skillLevel}
          </span>
          <span className="badge bg-pitch-50 text-pitch-700 border border-pitch-100">
            {player.hand.charAt(0).toUpperCase() + player.hand.slice(1)}-hand
          </span>
        </div>
      </div>

      {/* Start session button */}
      <button
        className="btn-primary w-full justify-center"
        onClick={() => navigate('/live')}
      >
        Start Live Session
      </button>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-ink-300">{label}</span>
      <span className="text-xs font-semibold text-ink-500">{value}</span>
    </div>
  )
}

function KPIStrip({ stats }: { stats: PlayerStats | null }) {
  if (!stats) return <div className="text-ink-300">Loading stats...</div>

  const kpiData = [
    { label: 'Overall Score', value: Math.round(stats.avgRating * 10).toString(), suffix: '/100', delta: '' },
    { label: 'Total Sessions', value: stats.totalSessions.toString(), suffix: '', delta: '' },
    { label: 'Total Shots', value: stats.totalShots.toString(), suffix: '', delta: '' },
    { label: 'Avg Elbow', value: stats.avgElbow.toFixed(1), suffix: '°', delta: '' },
    { label: 'Best Swing', value: stats.bestSwingSpeed.toFixed(1), suffix: ' m/s', delta: '' },
  ]

  return (
    <div className="grid grid-cols-5 gap-3">
      {kpiData.map(kpi => (
        <div key={kpi.label} className="card p-4 relative overflow-hidden">
          <span className="absolute w-16 h-16 rounded-full border-2 border-cream-200 -bottom-4 -right-4 pointer-events-none" />
          <p className="label mb-2">{kpi.label}</p>
          <div className="flex items-end gap-0.5">
            <span className="text-2xl font-black text-ink-600 leading-none">{kpi.value}</span>
            {kpi.suffix && (
              <span className="text-sm font-semibold text-ink-300 mb-0.5">{kpi.suffix}</span>
            )}
          </div>
          {kpi.delta && (
            <p className="text-xs text-pitch-500 font-medium mt-1.5">{kpi.delta}</p>
          )}
        </div>
      ))}
    </div>
  )
}

function ScoreRing({ score }: { score: number }) {
  const r = 48
  const circ = 2 * Math.PI * r
  const progress = (score / 100) * circ
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28 mx-auto">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#F3EDE0" strokeWidth="10" />
      <circle
        cx="60" cy="60" r={r}
        fill="none"
        stroke="#1A9459"
        strokeWidth="10"
        strokeDasharray={`${progress} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="57" textAnchor="middle" fontSize="24" fontWeight="800" fill="#241E16"
        fontFamily="Inter, sans-serif">{score}</text>
      <text x="60" y="72" textAnchor="middle" fontSize="10" fill="#9E9282"
        fontFamily="Inter, sans-serif">/ 100</text>
    </svg>
  )
}

function DevelopmentScore() {
  return (
    <div className="card p-5 h-full">
      <p className="label mb-4">Development Score</p>
      <ScoreRing score={72} />
      <p className="text-center text-xs text-ink-300 mt-2 mb-5">Overall Progress</p>
      <div className="space-y-3">
        {SUB_SCORES.map(s => {
          const color = s.value >= 75 ? 'bg-pitch-400' : s.value >= 65 ? 'bg-amber-400' : 'bg-alert-400'
          const text = s.value >= 75 ? 'text-pitch-600' : s.value >= 65 ? 'text-amber-500' : 'text-alert-400'
          return (
            <div key={s.label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-ink-400">{s.label}</span>
                <span className={`text-xs font-bold ${text}`}>{s.value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${s.value}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TechBar({ label, score }: { label: string; score: number }) {
  const color = score >= 7.5 ? 'bg-pitch-400' : score >= 5.5 ? 'bg-amber-400' : 'bg-alert-400'
  const text = score >= 7.5 ? 'text-pitch-600' : score >= 5.5 ? 'text-amber-500' : 'text-alert-400'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-ink-400 w-36 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-cream-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${(score / 10) * 100}%` }} />
      </div>
      <span className={`text-xs font-bold w-6 text-right ${text}`}>{score}</span>
    </div>
  )
}

function TechniquePanel() {
  const half = Math.ceil(TECHNIQUES.length / 2)
  const col1 = TECHNIQUES.slice(0, half)
  const col2 = TECHNIQUES.slice(half)
  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="label">Batting Technique</p>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-pitch-600"><span className="w-2 h-2 rounded-full bg-pitch-400 inline-block" />Strong</span>
          <span className="flex items-center gap-1 text-amber-500"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Developing</span>
          <span className="flex items-center gap-1 text-alert-400"><span className="w-2 h-2 rounded-full bg-alert-400 inline-block" />Needs work</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        <div className="space-y-3">
          {col1.map(t => <TechBar key={t.label} {...t} />)}
        </div>
        <div className="space-y-3">
          {col2.map(t => <TechBar key={t.label} {...t} />)}
        </div>
      </div>
    </div>
  )
}

function StrengthsPanel() {
  return (
    <div className="card p-5">
      <p className="label mb-3">Strengths</p>
      <div className="space-y-2.5">
        {STRENGTHS.map(s => (
          <div key={s} className="flex items-start gap-2.5">
            <span className="mt-0.5 w-4 h-4 rounded-full border border-pitch-300 flex items-center justify-center shrink-0">
              <CheckIcon />
            </span>
            <p className="text-sm text-ink-500 leading-snug">{s}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ImprovementsPanel() {
  return (
    <div className="card p-5">
      <p className="label mb-3">Areas for Improvement</p>
      <div className="space-y-2.5">
        {IMPROVEMENTS.map(s => (
          <div key={s} className="flex items-start gap-2.5">
            <span className="mt-0.5 w-4 h-4 rounded-full border border-amber-300 flex items-center justify-center shrink-0">
              <FlagIcon />
            </span>
            <p className="text-sm text-ink-500 leading-snug">{s}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CoachFeedback() {
  return (
    <div className="card p-6 border-l-4 border-l-ink-600 relative overflow-hidden">
      <span className="absolute w-32 h-32 rounded-full border-2 border-cream-200 -top-8 -right-8 pointer-events-none" />
      <span className="absolute w-16 h-16 rounded-full border-2 border-cream-300 bottom-4 right-16 pointer-events-none" />

      <div className="flex items-center gap-3 mb-4 relative">
        <div className="w-8 h-8 rounded-full bg-ink-600 flex items-center justify-center">
          <CoachIcon />
        </div>
        <div>
          <p className="text-sm font-bold text-ink-600">Coach Feedback</p>
          <p className="text-xs text-ink-300">Most recent assessment</p>
        </div>
      </div>

      {/* Large quotation mark */}
      <span className="absolute top-14 left-5 text-7xl font-black text-cream-200 leading-none select-none" aria-hidden>
        "
      </span>

      <div className="relative pl-2 space-y-3">
        {COACH_FEEDBACK.split('\n\n').map((para, i) => (
          <p key={i} className="text-sm text-ink-500 leading-relaxed">{para}</p>
        ))}
      </div>
    </div>
  )
}

function TrainingGoals() {
  const done = GOALS.filter(g => g.done).length
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="label">Training Goals</p>
        <span className="badge bg-pitch-50 text-pitch-600 border border-pitch-100">
          {done}/{GOALS.length} complete
        </span>
      </div>
      <div className="space-y-2.5">
        {GOALS.map(g => (
          <div key={g.text} className={`flex items-start gap-2.5 p-2.5 rounded-xl ${g.done ? 'bg-pitch-50' : 'bg-cream-50'}`}>
            <span className={`mt-0.5 shrink-0 ${g.done ? 'text-pitch-500' : 'text-ink-200'}`}>
              <GoalBox done={g.done} />
            </span>
            <p className={`text-sm leading-snug ${g.done ? 'text-pitch-700 line-through decoration-pitch-300' : 'text-ink-500'}`}>
              {g.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgressChart() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="label">Progress Tracking</p>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-ink-400">
            <span className="w-3 h-0.5 bg-ink-600 inline-block rounded" />Batting
          </span>
          <span className="flex items-center gap-1 text-ink-400">
            <span className="w-3 h-0.5 bg-pitch-400 inline-block rounded" />Fitness
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={PROGRESS_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EAE0CC" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: '#9E9282', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            domain={[50, 100]}
            tick={{ fill: '#9E9282', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
            axisLine={false} tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#fff', border: '1px solid #EAE0CC',
              borderRadius: 12, fontSize: 12, fontFamily: 'Inter, sans-serif',
            }}
            labelStyle={{ color: '#3D3228', fontWeight: 600 }}
          />
          <Line
            type="monotone" dataKey="batting" name="Batting"
            stroke="#241E16" strokeWidth={2.5} dot={{ fill: '#241E16', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone" dataKey="fitness" name="Fitness"
            stroke="#1A9459" strokeWidth={2.5} dot={{ fill: '#1A9459', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Micro icons (SVG, no emoji) ────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 5l2 2 4-4" stroke="#1A9459" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FlagIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 1v8M2 1h5l-1.5 3L8 7H2" stroke="#E07E08" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CoachIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="6" r="2.5" stroke="white" strokeWidth="1.5" />
      <path d="M3 13.5c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function GoalBox({ done }: { done: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="14" rx="4"
        stroke={done ? '#1A9459' : '#C8C0B0'} strokeWidth="1.5"
        fill={done ? '#1A9459' : 'none'}
      />
      {done && <path d="M4.5 8l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { activePlayer } = useApp()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!activePlayer?.id) return

      try {
        const [player, stats] = await Promise.all([
          PlayerAPI.getById(activePlayer.id),
          PlayerAPI.getStats(activePlayer.id)
        ])
        setDashboardData({ player, stats })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activePlayer?.id])

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-full">
          <p className="text-ink-300">Loading dashboard...</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex items-start gap-6 p-6 min-h-full">

        {/* ── Left: Avatar panel (sticky) ── */}
        <div className="w-64 shrink-0 sticky top-6 self-start">
          <AvatarPanel data={dashboardData} />
        </div>

        {/* ── Right: All content ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Page title strip */}
          <div className="flex items-center justify-between">
            <div>
              <p className="label mb-0.5">Player Profile</p>
              <h1 className="text-2xl font-black text-ink-600 tracking-tight">Dashboard</h1>
            </div>
            <span className="text-xs text-ink-200">Last updated: {new Date().toLocaleDateString()}</span>
          </div>

          {/* 1. KPI Strip */}
          <KPIStrip stats={dashboardData?.stats || null} />

          {/* 2. Technique + Development Score */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <TechniquePanel />
            </div>
            <DevelopmentScore />
          </div>

          {/* 3. Strengths + Improvements */}
          <div className="grid grid-cols-2 gap-4">
            <StrengthsPanel />
            <ImprovementsPanel />
          </div>

          {/* 4. Coach Feedback (prominent, full width) */}
          <CoachFeedback />

          {/* 5. Goals + Progress */}
          <div className="grid grid-cols-2 gap-4">
            <TrainingGoals />
            <ProgressChart />
          </div>

        </div>
      </div>
      <ChatBot />
    </AppShell>
  )
}
