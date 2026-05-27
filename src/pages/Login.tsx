import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Heart } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { demoMode, signInDemo, setDemoRole } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })

    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  const handleDemo = (role: 'anhorig' | 'brukare') => {
    setDemoRole(role)
    signInDemo()
    navigate(role === 'anhorig' ? '/dashboard' : '/today')
  }

  return (
    <div className="min-h-screen bg-cc-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10 fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cc-accent to-cc-accent2 mb-4">
            <Heart className="w-8 h-8 text-cc-bg" />
          </div>
          <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-cc-accent to-cc-accent2 bg-clip-text text-transparent">
            CareControl
          </h1>
          <p className="text-cc-muted mt-2">
            Ge din mamma kontrollen tillbaka
          </p>
        </div>

        {demoMode ? (
          <div className="space-y-4 fade-in">
            <div className="text-center mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
                Demo-läge — ingen databas ansluten
              </span>
            </div>

            <button
              onClick={() => handleDemo('anhorig')}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cc-accent to-cc-accent2
                text-cc-bg font-semibold text-base hover:opacity-90 transition-opacity touch-target"
            >
              Logga in som Dena (anhörig)
            </button>

            <button
              onClick={() => handleDemo('brukare')}
              className="w-full py-4 rounded-xl border border-cc-accent/30
                text-cc-accent font-semibold text-base hover:bg-cc-accent/5 transition-colors touch-target"
            >
              Visa Fatimah-läge (brukare)
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cc-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-cc-bg px-3 text-cc-muted">eller</span>
              </div>
            </div>

            <a
              href="/staff"
              className="block w-full py-3.5 rounded-xl border border-cc-border text-center
                text-cc-muted hover:border-cc-accent hover:text-cc-accent transition-colors touch-target"
            >
              Jag är personal → Ange kod
            </a>
          </div>
        ) : sent ? (
          <div className="text-center fade-in">
            <div className="w-16 h-16 rounded-full bg-cc-accent/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✉️</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Kolla din mail</h2>
            <p className="text-cc-muted">
              Vi har skickat en inloggningslänk till<br />
              <span className="text-cc-text font-medium">{email}</span>
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="mt-6 text-cc-accent text-sm hover:underline"
            >
              Använd en annan e-post
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 fade-in">
            <div>
              <label className="block text-sm text-cc-muted mb-1.5">E-postadress</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="dena@example.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-cc-surface border border-cc-border
                  text-cc-text placeholder:text-cc-muted/50 focus:outline-none focus:border-cc-accent
                  transition-colors text-base"
              />
            </div>

            {error && (
              <p className="text-cc-danger text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cc-accent to-cc-accent2
                text-cc-bg font-semibold text-base hover:opacity-90 transition-opacity
                disabled:opacity-50 touch-target"
            >
              {loading ? 'Skickar...' : 'Logga in med e-post'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cc-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-cc-bg px-3 text-cc-muted">eller</span>
              </div>
            </div>

            <a
              href="/staff"
              className="block w-full py-3.5 rounded-xl border border-cc-border text-center
                text-cc-muted hover:border-cc-accent hover:text-cc-accent transition-colors touch-target"
            >
              Jag är personal → Ange kod
            </a>
          </form>
        )}

        <p className="text-center text-xs text-cc-muted/50 mt-10">
          Powered by Life Atlas · CareControl AI
        </p>
      </div>
    </div>
  )
}
