import { useState, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PlayerAPI } from '../api'

type Mode = 'signin' | 'signup' | 'forgot'

// ── Icons ─────────────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M3 3l14 14M10 4c4.5 0 7.5 4.5 8 6-.5 1.5-2 4-4.5 5.5M6 5.5C3.5 7 2 9.5 2 10c.5 1.5 3.5 6 8 6 1.5 0 2.8-.4 3.9-1" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 4l-6 6 6 6" />
    </svg>
  )
}

// ── Field component ───────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  id: string
  type?: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  error?: string
  placeholder?: string
  children?: React.ReactNode
}

function Field({ label, id, type = 'text', value, onChange, onBlur, error, placeholder, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-ink-500">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm text-ink-600 bg-cream-50
            placeholder:text-ink-200 outline-none transition-all duration-150
            focus:ring-2 focus:ring-offset-0
            ${error
              ? 'border-alert-400 focus:ring-alert-400/20'
              : 'border-ink-100 focus:border-ink-400 focus:ring-ink-400/10'
            }`}
        />
        {children}
      </div>
      {error && <p className="text-xs text-alert-400 font-medium">{error}</p>}
    </div>
  )
}

// ── Password field ────────────────────────────────────────────────────────────

interface PasswordFieldProps {
  label: string
  id: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  error?: string
}

function PasswordField({ label, id, value, onChange, onBlur, error }: PasswordFieldProps) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-ink-500">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm text-ink-600 bg-cream-50
            placeholder:text-ink-200 outline-none transition-all duration-150
            focus:ring-2 focus:ring-offset-0
            ${error
              ? 'border-alert-400 focus:ring-alert-400/20'
              : 'border-ink-100 focus:border-ink-400 focus:ring-ink-400/10'
            }`}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500 transition-colors"
          tabIndex={-1}
        >
          <EyeIcon open={show} />
        </button>
      </div>
      {error && <p className="text-xs text-alert-400 font-medium">{error}</p>}
    </div>
  )
}

// ── Logo ──────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex flex-col items-center gap-3 mb-8">
      <span className="relative flex items-center justify-center w-10 h-10 shrink-0">
        <span className="absolute inset-0 rounded-full border-2 border-ink-600" />
        <span className="absolute w-5 h-5 rounded-full border-2 border-pitch-500" />
        <span className="w-1.5 h-1.5 rounded-full bg-ink-600" />
      </span>
      <p className="text-lg font-black tracking-tight text-ink-600">
        Cric<span className="text-pitch-500">Sense</span>
      </p>
    </div>
  )
}

// ── Validators ────────────────────────────────────────────────────────────────

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const isValidPhone = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\s/g, ''))
const isValidContact = (v: string) => isValidEmail(v) || isValidPhone(v)

// ── Sign In ───────────────────────────────────────────────────────────────────

interface SignInProps {
  onSwitch: (m: Mode) => void
}

function SignIn({ onSwitch }: SignInProps) {
  const navigate = useNavigate()
  const { setActivePlayer } = useApp()
  const uid = useId()

  const [contact, setContact] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (!contact.trim()) e.contact = 'This field is required.'
    else if (!isValidContact(contact)) e.contact = 'Enter a valid email or 10-digit phone number.'
    if (!password) e.password = 'Password is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function blurContact() {
    if (contact && !isValidContact(contact))
      setErrors(p => ({ ...p, contact: 'Enter a valid email or 10-digit phone number.' }))
    else
      setErrors(p => { const n = { ...p }; delete n.contact; return n })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setApiError('')
    setLoading(true)
    try {
      // For now, fetch all players and find by contact (email)
      const players = await PlayerAPI.getAll()
      const player = players.find(p => p.name.toLowerCase().includes(contact.toLowerCase()))

      if (player) {
        setActivePlayer({
          id: player.id,
          name: player.name,
          jerseyNumber: 7,
          hand: player.hand === 'right' ? 'Right' : 'Left',
          age: player.age
        })
        localStorage.setItem('cricsense_player_id', player.id)
        navigate('/dashboard')
      } else {
        setApiError('Player not found. Please sign up first.')
      }
    } catch (error) {
      setApiError('Failed to sign in. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = contact.trim() && password && !loading

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-black text-ink-600 tracking-tight">Sign in</h1>
        <p className="text-sm text-ink-300">Welcome back. Continue your training.</p>
      </div>

      {apiError && (
        <p className="text-sm text-alert-400 font-medium">{apiError}</p>
      )}

      <Field
        label="Email or Phone Number"
        id={`${uid}-contact`}
        value={contact}
        onChange={setContact}
        onBlur={blurContact}
        error={errors.contact}
        placeholder="you@example.com or 9876543210"
      />

      <PasswordField
        label="Password"
        id={`${uid}-password`}
        value={password}
        onChange={setPassword}
        onBlur={() => {
          if (!password) setErrors(p => ({ ...p, password: 'Password is required.' }))
          else setErrors(p => { const n = { ...p }; delete n.password; return n })
        }}
        error={errors.password}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onSwitch('forgot')}
          className="text-xs text-ink-400 hover:text-ink-600 transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <p className="text-sm text-center text-ink-300">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => onSwitch('signup')}
          className="font-semibold text-ink-500 hover:text-ink-600 transition-colors"
        >
          Sign up
        </button>
      </p>
    </form>
  )
}

// ── Sign Up ───────────────────────────────────────────────────────────────────

interface SignUpProps {
  onSwitch: (m: Mode) => void
}

function SignUp({ onSwitch }: SignUpProps) {
  const navigate = useNavigate()
  const { setActivePlayer } = useApp()
  const uid = useId()

  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [age, setAge] = useState('')
  const [category, setCategory] = useState('')
  const [hand, setHand] = useState<'Right' | 'Left'>('Right')
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function blurField(field: string, value: string) {
    let msg = ''
    if (field === 'name' && !value.trim()) msg = 'Full name is required.'
    if (field === 'contact' && !value.trim()) msg = 'This field is required.'
    else if (field === 'contact' && !isValidContact(value)) msg = 'Enter a valid email or 10-digit phone number.'
    if (field === 'password' && value.length > 0 && value.length < 8) msg = 'Password must be at least 8 characters.'
    if (field === 'confirm' && value && value !== password) msg = 'Passwords do not match.'
    if (field === 'age') {
      const n = parseInt(value)
      if (!value) msg = 'Age is required.'
      else if (isNaN(n) || n < 8 || n > 60) msg = 'Enter a valid age (8–60).'
    }
    if (field === 'category' && !value) msg = 'Select a category.'
    setErrors(p => msg ? { ...p, [field]: msg } : (() => { const n = { ...p }; delete n[field]; return n })())
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Full name is required.'
    if (!contact.trim()) e.contact = 'This field is required.'
    else if (!isValidContact(contact)) e.contact = 'Enter a valid email or 10-digit phone number.'
    if (!password) e.password = 'Password is required.'
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (!confirm) e.confirm = 'Please confirm your password.'
    else if (confirm !== password) e.confirm = 'Passwords do not match.'
    const n = parseInt(age)
    if (!age) e.age = 'Age is required.'
    else if (isNaN(n) || n < 8 || n > 60) e.age = 'Enter a valid age (8–60).'
    if (!category) e.category = 'Select a playing category.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !agreed) return
    setLoading(true)
    try {
      // Create player in backend
      const player = await PlayerAPI.create({
        name: name.trim(),
        age: parseInt(age),
        hand: hand.toLowerCase() as 'right' | 'left',
        skillLevel: category as 'Beginner' | 'Amateur' | 'Club' | 'Semi-Pro',
        avatarIndex: Math.floor(Math.random() * 6) // Random avatar 0-5
      })

      // Store player ID and set active
      localStorage.setItem('cricsense_player_id', player.id)
      setActivePlayer({
        id: player.id,
        name: player.name,
        jerseyNumber: 7,
        hand: player.hand === 'right' ? 'Right' : 'Left',
        age: player.age
      })
      navigate('/dashboard')
    } catch (error) {
      setErrors({ submit: 'Failed to create account. Please try again.' })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = name && contact && password && confirm && age && category && agreed && !loading

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-black text-ink-600 tracking-tight">Create account</h1>
        <p className="text-sm text-ink-300">Set up your CricSense player profile.</p>
      </div>

      <Field
        label="Full Name"
        id={`${uid}-name`}
        value={name}
        onChange={setName}
        onBlur={() => blurField('name', name)}
        error={errors.name}
        placeholder="Arjun Sharma"
      />

      <Field
        label="Email or Phone Number"
        id={`${uid}-contact`}
        value={contact}
        onChange={setContact}
        onBlur={() => blurField('contact', contact)}
        error={errors.contact}
        placeholder="you@example.com or 9876543210"
      />

      <PasswordField
        label="Password"
        id={`${uid}-password`}
        value={password}
        onChange={setPassword}
        onBlur={() => blurField('password', password)}
        error={errors.password}
      />

      <PasswordField
        label="Confirm Password"
        id={`${uid}-confirm`}
        value={confirm}
        onChange={setConfirm}
        onBlur={() => blurField('confirm', confirm)}
        error={errors.confirm}
      />

      {/* Age + Category side by side */}
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Age"
          id={`${uid}-age`}
          type="number"
          value={age}
          onChange={setAge}
          onBlur={() => blurField('age', age)}
          error={errors.age}
          placeholder="17"
        />

        <div className="space-y-1.5">
          <label htmlFor={`${uid}-category`} className="block text-sm font-semibold text-ink-500">
            Playing Category
          </label>
          <select
            id={`${uid}-category`}
            value={category}
            onChange={e => setCategory(e.target.value)}
            onBlur={() => blurField('category', category)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-cream-50 text-ink-600 outline-none
              transition-all duration-150 focus:ring-2 focus:ring-offset-0
              ${errors.category
                ? 'border-alert-400 focus:ring-alert-400/20'
                : 'border-ink-100 focus:border-ink-400 focus:ring-ink-400/10'
              }`}
          >
            <option value="">Select…</option>
            <option value="Beginner">Beginner</option>
            <option value="Amateur">Amateur</option>
            <option value="Club">Club</option>
            <option value="Semi-Pro">Semi-Pro</option>
          </select>
          {errors.category && (
            <p className="text-xs text-alert-400 font-medium">{errors.category}</p>
          )}
        </div>
      </div>

      {/* Batting Style toggle */}
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-ink-500">Batting Style</p>
        <div className="flex rounded-xl border border-ink-100 overflow-hidden">
          {(['Right', 'Left'] as const).map(h => (
            <button
              key={h}
              type="button"
              onClick={() => setHand(h)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-150 ${hand === h
                ? 'bg-ink-600 text-white'
                : 'bg-cream-50 text-ink-400 hover:bg-cream-100'
                }`}
            >
              {h}-hand
            </button>
          ))}
        </div>
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-ink-200 accent-ink-600 shrink-0"
        />
        <span className="text-xs text-ink-300 leading-relaxed">
          I agree to the{' '}
          <span className="font-medium text-ink-500">Terms of Service</span> and{' '}
          <span className="font-medium text-ink-500">Privacy Policy</span>
        </span>
      </label>

      <button
        type="submit"
        disabled={!canSubmit}
        className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {loading ? 'Creating account…' : 'Create Account'}
      </button>

      <p className="text-sm text-center text-ink-300">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => onSwitch('signin')}
          className="font-semibold text-ink-500 hover:text-ink-600 transition-colors"
        >
          Sign in
        </button>
      </p>
    </form>
  )
}

// ── Forgot Password ───────────────────────────────────────────────────────────

interface ForgotProps {
  onSwitch: (m: Mode) => void
}

function ForgotPassword({ onSwitch }: ForgotProps) {
  const uid = useId()
  const [contact, setContact] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!contact.trim() || !isValidContact(contact)) {
      setError('Enter a valid email or 10-digit phone number.')
      return
    }
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setSent(true)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <button
        type="button"
        onClick={() => onSwitch('signin')}
        className="flex items-center gap-1.5 text-xs text-ink-300 hover:text-ink-500 transition-colors -ml-0.5"
      >
        <BackIcon />
        Back to sign in
      </button>

      <div className="space-y-1">
        <h1 className="text-xl font-black text-ink-600 tracking-tight">Reset password</h1>
        <p className="text-sm text-ink-300">We'll send a reset link to your email or phone.</p>
      </div>

      {sent ? (
        <div className="rounded-xl border border-pitch-200 bg-pitch-50 px-4 py-3">
          <p className="text-sm font-semibold text-pitch-700">Reset link sent</p>
          <p className="text-xs text-pitch-600 mt-0.5">
            If an account exists for that contact, a reset link has been sent.
          </p>
        </div>
      ) : (
        <>
          <Field
            label="Email or Phone Number"
            id={`${uid}-contact`}
            value={contact}
            onChange={setContact}
            onBlur={() => {
              if (contact && !isValidContact(contact))
                setError('Enter a valid email or 10-digit phone number.')
              else setError('')
            }}
            error={error}
            placeholder="you@example.com or 9876543210"
          />

          <button
            type="submit"
            disabled={!contact.trim() || loading}
            className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </>
      )}
    </form>
  )
}

// ── Auth page (root) ──────────────────────────────────────────────────────────

export default function Auth() {
  const [mode, setMode] = useState<Mode>('signin')

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Logo />

        <div className="card p-8">
          {mode === 'signin' && <SignIn onSwitch={setMode} />}
          {mode === 'signup' && <SignUp onSwitch={setMode} />}
          {mode === 'forgot' && <ForgotPassword onSwitch={setMode} />}
        </div>
      </div>
    </div>
  )
}
