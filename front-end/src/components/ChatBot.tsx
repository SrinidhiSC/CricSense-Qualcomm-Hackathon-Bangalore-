import { useState, useRef, useEffect } from 'react'
import { getResponse, SUGGESTIONS } from '../data/coachingQA'

interface Message {
  id: number
  role: 'user' | 'coach'
  text: string
}

let _id = 0
const nextId = () => ++_id

// ── Icons ─────────────────────────────────────────────────────────────────────

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  )
}

// ── Chat panel ────────────────────────────────────────────────────────────────

interface PanelProps {
  onClose: () => void
}

function ChatPanel({ onClose }: PanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId(),
      role: 'coach',
      text: 'Hello! I am your CricSense coaching assistant. Ask me anything about your batting technique, footwork, or training.',
    },
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setShowSuggestions(false)
    setMessages(m => [...m, { id: nextId(), role: 'user', text: trimmed }])
    setInput('')
    setLoading(true)

    const answer = await getResponse(trimmed)

    setMessages(m => [...m, { id: nextId(), role: 'coach', text: answer }])
    setLoading(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-ink-100 shadow-float overflow-hidden"
         style={{ width: 340, height: 480 }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 bg-ink-600">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-pitch-400" />
          <div>
            <p className="text-sm font-bold text-white leading-none">Coaching Assistant</p>
            <p className="text-xs text-ink-200 mt-0.5">CricSense AI</p>
          </div>
        </div>
        <button onClick={onClose} className="text-ink-300 hover:text-white transition-colors p-1">
          <CloseIcon />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-cream-50">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-ink-600 text-white rounded-br-sm'
                  : 'bg-white text-ink-500 border border-ink-100 rounded-bl-sm shadow-card'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-ink-100 rounded-2xl rounded-bl-sm shadow-card">
              <TypingDots />
            </div>
          </div>
        )}

        {/* Suggestion chips */}
        {showSuggestions && !loading && (
          <div className="pt-1 space-y-1.5">
            <p className="text-xs text-ink-300 font-medium">Suggested questions</p>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="block w-full text-left text-xs text-ink-500 bg-white border border-ink-100 rounded-xl px-3 py-2 hover:bg-cream-100 hover:border-ink-200 transition-all duration-150"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-ink-100 flex gap-2 bg-white">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about technique, drills…"
          disabled={loading}
          className="flex-1 text-sm px-3 py-2 rounded-xl border border-ink-100 focus:border-ink-400 focus:ring-2 focus:ring-ink-400/10 outline-none bg-cream-50 text-ink-600 placeholder:text-ink-200 disabled:opacity-50"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="w-9 h-9 flex items-center justify-center bg-ink-600 text-white rounded-xl hover:bg-ink-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  )
}

// ── Floating button ───────────────────────────────────────────────────────────

export function ChatBot() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && <ChatPanel onClose={() => setOpen(false)} />}

      <button
        onClick={() => setOpen(o => !o)}
        className={`w-14 h-14 rounded-full shadow-float flex items-center justify-center transition-all duration-200 ${
          open
            ? 'bg-ink-500 text-white scale-95'
            : 'bg-ink-600 text-white hover:bg-ink-500 hover:scale-105'
        }`}
        aria-label="Open coaching assistant"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* Notification dot — shown when closed */}
      {!open && (
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-pitch-400 rounded-full border-2 border-cream-100" />
      )}
    </div>
  )
}
