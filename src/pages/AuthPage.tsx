import { useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { IconCart, IconUser, IconMail, IconLock, IconEye, IconEyeSlash, IconCheck, IconChevronRight } from '../lib/icons'
import Bezel from '../components/Bezel'

type Mode = 'login' | 'register'
type FieldErrors = Partial<Record<string, string>>

const STRENGTH_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#22C55E']
const STRENGTH_LABELS = ['Слаба', 'Средна', 'Добра', 'Силна']

function passwordStrength(pass: string): number {
  if (pass.length < 4) return 0
  if (pass.length < 6) return 1
  if (pass.length < 8) return 2
  return 3
}

function fieldClasses(hasError: boolean, shaking: boolean): string {
  const ring = hasError || shaking ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-accent/40'
  return `relative flex items-center rounded-2xl bg-app-bg transition-shadow ${ring} ${shaking ? 'shake' : ''}`
}

export default function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [fading, setFading] = useState(false)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)

  const [errors, setErrors] = useState<FieldErrors>({})
  const [showPass, setShowPass] = useState(false)
  const [busy, setBusy] = useState(false)
  const [shakeField, setShakeField] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  function clearError(field: string) {
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function shake(field: string) {
    setShakeField(field)
    setTimeout(() => setShakeField(''), 400)
  }

  function switchMode(next: Mode) {
    setFading(true)
    setErrors({})
    setNotice(null)
    setResetSent(false)
    setTimeout(() => {
      setMode(next)
      setFading(false)
    }, 200)
  }

  function validateLogin(): boolean {
    const e: FieldErrors = {}
    if (!loginEmail.trim()) {
      e.loginEmail = 'Въведи имейл'
      shake('loginEmail')
    } else if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      e.loginEmail = 'Невалиден имейл'
      shake('loginEmail')
    }
    if (!loginPass) {
      e.loginPass = 'Въведи парола'
      shake('loginPass')
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateRegister(): boolean {
    const e: FieldErrors = {}
    if (!regName.trim()) {
      e.regName = 'Въведи име'
      shake('regName')
    }
    if (!regEmail.trim()) {
      e.regEmail = 'Въведи имейл'
      shake('regEmail')
    } else if (!/\S+@\S+\.\S+/.test(regEmail)) {
      e.regEmail = 'Невалиден имейл'
      shake('regEmail')
    }
    if (!regPass) {
      e.regPass = 'Въведи парола'
      shake('regPass')
    } else if (regPass.length < 6) {
      e.regPass = 'Минимум 6 символа'
      shake('regPass')
    }
    if (regPass !== regConfirm) {
      e.regConfirm = 'Паролите не съвпадат'
      shake('regConfirm')
    }
    if (!agreed) {
      e.agreed = 'Трябва да приемеш условията'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleLogin() {
    if (!validateLogin()) return
    setNotice(null)
    setBusy(true)
    const result = await signIn(loginEmail, loginPass)
    setBusy(false)
    if (result) setErrors({ form: result })
  }

  async function handleRegister() {
    if (!validateRegister()) return
    setNotice(null)
    setBusy(true)
    const result = await signUp(regEmail, regPass, regName.trim())
    setBusy(false)
    if (result) {
      setErrors({ form: result })
    } else {
      setNotice('Регистрацията е успешна. Проверете имейла си, за да потвърдите акаунта.')
    }
  }

  async function handleForgotPassword() {
    if (!loginEmail.trim() || !/\S+@\S+\.\S+/.test(loginEmail)) {
      setErrors({ loginEmail: 'Въведи имейл, за да изпратим линк за възстановяване' })
      shake('loginEmail')
      return
    }
    setBusy(true)
    const result = await resetPassword(loginEmail)
    setBusy(false)
    if (result) {
      setErrors({ form: result })
    } else {
      setResetSent(true)
      setNotice(`Изпратихме линк за възстановяване на ${loginEmail}.`)
    }
  }

  const strength = passwordStrength(regPass)

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-app-bg px-5 py-10">
      <div className="w-full max-w-sm transition-opacity duration-200" style={{ opacity: fading ? 0 : 1 }}>
        <Bezel variant="full" className="bg-app-card p-6 sm:p-7">
          {/* Logo & branding */}
          <div className="flex flex-col items-center text-center pb-6">
            <div
              className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center mb-3.5 shadow-[0_8px_24px_rgba(232,113,42,0.3)]"
              style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))' }}
            >
              <IconCart size={32} color="#fff" />
            </div>
            <div className="text-2xl font-display font-extrabold tracking-tight text-app-text">Пазарувай умно</div>
            <div className="text-sm text-app-text-sec mt-1">
              {mode === 'login' ? 'Влез в акаунта си' : 'Създай нов акаунт'}
            </div>
          </div>

          {/* ─── LOGIN ─── */}
          {mode === 'login' && (
            <form
              className="flex flex-col gap-3.5"
              onSubmit={(e) => {
                e.preventDefault()
                handleLogin()
              }}
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-app-text-sec">Имейл</label>
                <div className={fieldClasses(!!errors.loginEmail, shakeField === 'loginEmail')}>
                  <span className="absolute left-3.5 flex items-center pointer-events-none text-app-text-sec">
                    <IconMail size={18} color="currentColor" />
                  </span>
                  <input
                    type="email"
                    placeholder="ime@example.com"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value)
                      clearError('loginEmail')
                    }}
                    className="w-full bg-transparent rounded-2xl pl-11 pr-4 py-3.5 text-sm text-app-text placeholder:text-app-text-sec outline-none"
                  />
                </div>
                {errors.loginEmail && <span className="text-xs font-medium text-red-500 pl-0.5">{errors.loginEmail}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-app-text-sec">Парола</label>
                <div className={fieldClasses(!!errors.loginPass, shakeField === 'loginPass')}>
                  <span className="absolute left-3.5 flex items-center pointer-events-none text-app-text-sec">
                    <IconLock size={18} color="currentColor" />
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginPass}
                    onChange={(e) => {
                      setLoginPass(e.target.value)
                      clearError('loginPass')
                    }}
                    className="w-full bg-transparent rounded-2xl pl-11 pr-11 py-3.5 text-sm text-app-text placeholder:text-app-text-sec outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 flex items-center p-1 text-app-text-sec"
                    aria-label={showPass ? 'Скрий паролата' : 'Покажи паролата'}
                  >
                    {showPass ? <IconEyeSlash size={18} color="currentColor" /> : <IconEye size={18} color="currentColor" />}
                  </button>
                </div>
                {errors.loginPass && <span className="text-xs font-medium text-red-500 pl-0.5">{errors.loginPass}</span>}
              </div>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={busy || resetSent}
                className="self-end -mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-accent disabled:opacity-60"
              >
                {resetSent && <IconCheck size={13} color="var(--color-accent)" />}
                {resetSent ? 'Линкът е изпратен' : 'Забравена парола?'}
              </button>

              {errors.form && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 m-0">{errors.form}</p>
              )}
              {notice && (
                <p className="text-sm text-accent bg-accent/10 rounded-xl px-3.5 py-2.5 m-0">{notice}</p>
              )}

              <button
                type="submit"
                disabled={busy}
                className={`magnetic pressable flex items-center rounded-full text-white text-[15px] font-bold pl-6 pr-1.5 py-1.5 min-h-[50px] shadow-[0_4px_16px_rgba(232,113,42,0.3)] disabled:cursor-not-allowed ${busy ? 'justify-center' : 'justify-between'}`}
                style={{ background: busy ? 'var(--color-accent)' : 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))', opacity: busy ? 0.7 : 1 }}
              >
                {busy ? (
                  <span className="spinner" />
                ) : (
                  <>
                    Вход
                    <span className="magnetic-icon w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                      <IconChevronRight size={18} color="#fff" />
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="text-[13px] text-app-text-sec">Нямаш акаунт?</span>
                <button type="button" onClick={() => switchMode('register')} className="text-[13px] font-bold text-accent">
                  Регистрирай се
                </button>
              </div>
            </form>
          )}

          {/* ─── REGISTER ─── */}
          {mode === 'register' && (
            <form
              className="flex flex-col gap-3.5"
              onSubmit={(e) => {
                e.preventDefault()
                handleRegister()
              }}
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-app-text-sec">Име</label>
                <div className={fieldClasses(!!errors.regName, shakeField === 'regName')}>
                  <span className="absolute left-3.5 flex items-center pointer-events-none text-app-text-sec">
                    <IconUser size={18} color="currentColor" />
                  </span>
                  <input
                    type="text"
                    placeholder="Иван Иванов"
                    value={regName}
                    onChange={(e) => {
                      setRegName(e.target.value)
                      clearError('regName')
                    }}
                    className="w-full bg-transparent rounded-2xl pl-11 pr-4 py-3.5 text-sm text-app-text placeholder:text-app-text-sec outline-none"
                  />
                </div>
                {errors.regName && <span className="text-xs font-medium text-red-500 pl-0.5">{errors.regName}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-app-text-sec">Имейл</label>
                <div className={fieldClasses(!!errors.regEmail, shakeField === 'regEmail')}>
                  <span className="absolute left-3.5 flex items-center pointer-events-none text-app-text-sec">
                    <IconMail size={18} color="currentColor" />
                  </span>
                  <input
                    type="email"
                    placeholder="ime@example.com"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value)
                      clearError('regEmail')
                    }}
                    className="w-full bg-transparent rounded-2xl pl-11 pr-4 py-3.5 text-sm text-app-text placeholder:text-app-text-sec outline-none"
                  />
                </div>
                {errors.regEmail && <span className="text-xs font-medium text-red-500 pl-0.5">{errors.regEmail}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-app-text-sec">Парола</label>
                <div className={fieldClasses(!!errors.regPass, shakeField === 'regPass')}>
                  <span className="absolute left-3.5 flex items-center pointer-events-none text-app-text-sec">
                    <IconLock size={18} color="currentColor" />
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Минимум 6 символа"
                    value={regPass}
                    onChange={(e) => {
                      setRegPass(e.target.value)
                      clearError('regPass')
                    }}
                    className="w-full bg-transparent rounded-2xl pl-11 pr-11 py-3.5 text-sm text-app-text placeholder:text-app-text-sec outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 flex items-center p-1 text-app-text-sec"
                    aria-label={showPass ? 'Скрий паролата' : 'Покажи паролата'}
                  >
                    {showPass ? <IconEyeSlash size={18} color="currentColor" /> : <IconEye size={18} color="currentColor" />}
                  </button>
                </div>
                {errors.regPass && <span className="text-xs font-medium text-red-500 pl-0.5">{errors.regPass}</span>}
                {regPass.length > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-[3px] rounded-full transition-colors duration-300"
                        style={{ background: i <= strength ? STRENGTH_COLORS[strength] : 'var(--color-app-border)' }}
                      />
                    ))}
                    <span className="text-[11px] text-app-text-sec ml-1.5">{STRENGTH_LABELS[strength]}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-app-text-sec">Потвърди парола</label>
                <div className={fieldClasses(!!errors.regConfirm, shakeField === 'regConfirm')}>
                  <span className="absolute left-3.5 flex items-center pointer-events-none text-app-text-sec">
                    <IconCheck size={18} color="currentColor" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regConfirm}
                    onChange={(e) => {
                      setRegConfirm(e.target.value)
                      clearError('regConfirm')
                    }}
                    className="w-full bg-transparent rounded-2xl pl-11 pr-11 py-3.5 text-sm text-app-text placeholder:text-app-text-sec outline-none"
                  />
                  {regConfirm && regPass === regConfirm && (
                    <span className="absolute right-3.5 flex items-center pointer-events-none">
                      <IconCheck size={16} color="#22C55E" />
                    </span>
                  )}
                </div>
                {errors.regConfirm && <span className="text-xs font-medium text-red-500 pl-0.5">{errors.regConfirm}</span>}
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAgreed((v) => !v)
                    clearError('agreed')
                  }}
                  className="pressable flex items-center justify-center w-[22px] h-[22px] rounded-[7px] border-2 shrink-0 transition-colors"
                  style={{
                    background: agreed ? 'var(--color-accent)' : 'transparent',
                    borderColor: errors.agreed ? '#EF4444' : agreed ? 'var(--color-accent)' : 'var(--color-app-text-sec)',
                  }}
                  aria-pressed={agreed}
                >
                  {agreed && <IconCheck size={12} color="#fff" />}
                </button>
                <span className="text-xs leading-snug text-app-text-sec">
                  Приемам <span className="font-semibold text-accent">Условията за ползване</span> и{' '}
                  <span className="font-semibold text-accent">Политиката за поверителност</span>
                </span>
              </div>
              {errors.agreed && <span className="text-xs font-medium text-red-500 pl-0.5 -mt-2">{errors.agreed}</span>}

              {errors.form && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 m-0">{errors.form}</p>
              )}
              {notice && (
                <p className="text-sm text-accent bg-accent/10 rounded-xl px-3.5 py-2.5 m-0">{notice}</p>
              )}

              <button
                type="submit"
                disabled={busy}
                className={`magnetic pressable flex items-center rounded-full text-white text-[15px] font-bold pl-6 pr-1.5 py-1.5 min-h-[50px] shadow-[0_4px_16px_rgba(232,113,42,0.3)] disabled:cursor-not-allowed mt-0.5 ${busy ? 'justify-center' : 'justify-between'}`}
                style={{ background: busy ? 'var(--color-accent)' : 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))', opacity: busy ? 0.7 : 1 }}
              >
                {busy ? (
                  <span className="spinner" />
                ) : (
                  <>
                    Създай акаунт
                    <span className="magnetic-icon w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                      <IconChevronRight size={18} color="#fff" />
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="text-[13px] text-app-text-sec">Вече имаш акаунт?</span>
                <button type="button" onClick={() => switchMode('login')} className="text-[13px] font-bold text-accent">
                  Влез
                </button>
              </div>
            </form>
          )}
        </Bezel>
      </div>
    </div>
  )
}
