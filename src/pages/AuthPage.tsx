import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy(true)
    const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password)
    setBusy(false)
    if (result) {
      setError(result)
    } else if (mode === 'signup') {
      setInfo('Регистрацията е успешна. Проверете имейла си, за да потвърдите акаунта.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg px-5">
      <div className="w-full max-w-sm rounded-2xl bg-app-card border border-app-border p-6 space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-app-text m-0">Пазарувай умно</h1>
          <p className="text-sm text-app-text-sec m-0">
            {mode === 'signin' ? 'Влезте в акаунта си' : 'Създайте нов акаунт'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Имейл"
            className="w-full rounded-xl border border-app-border bg-app-bg px-3.5 py-2.5 text-sm text-app-text placeholder:text-app-text-sec focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Парола"
            className="w-full rounded-xl border border-app-border bg-app-bg px-3.5 py-2.5 text-sm text-app-text placeholder:text-app-text-sec focus:outline-none"
          />

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">{error}</p>}
          {info && <p className="text-sm text-accent bg-accent/10 border border-accent/25 rounded-lg px-3.5 py-2.5">{info}</p>}

          <button
            type="submit"
            disabled={busy}
            className="pressable w-full rounded-xl bg-accent text-white font-semibold text-sm py-2.5 disabled:opacity-60"
          >
            {busy ? 'Моля, изчакайте…' : mode === 'signin' ? 'Вход' : 'Регистрация'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
            setError(null)
            setInfo(null)
          }}
          className="pressable w-full text-center text-[13px] font-medium text-app-text-sec"
        >
          {mode === 'signin' ? 'Нямате акаунт? Регистрирайте се' : 'Вече имате акаунт? Влезте'}
        </button>
      </div>
    </div>
  )
}
