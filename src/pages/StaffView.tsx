import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile, Schedule, LANGUAGE_OPTIONS } from '@/lib/types'
import { LogIn, CheckCircle, MapPin, Pill, AlertTriangle, Heart, X } from 'lucide-react'

export default function StaffView() {
  const [code, setCode] = useState('')
  const [brukare, setBrukare] = useState<Profile | null>(null)
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([])
  const [activeVisitId, setActiveVisitId] = useState<string | null>(null)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [staffNotes, setStaffNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRatingPrompt, setShowRatingPrompt] = useState(false)
  const [visitDone, setVisitDone] = useState(false)

  const handleCodeEntry = async () => {
    if (code.length !== 4) return
    setLoading(true)
    setError('')

    // Find brukare by access code (no auth required for this lookup)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('access_code', code)
      .eq('role', 'brukare')

    if (!profiles || profiles.length === 0) {
      setError('Felaktig kod. Försök igen.')
      setLoading(false)
      return
    }

    const bp = profiles[0] as Profile
    setBrukare(bp)

    // Get today's schedules
    const today = new Date().toISOString().split('T')[0]
    const { data: scheds } = await supabase
      .from('schedules')
      .select('*')
      .eq('brukare_id', bp.id)
      .eq('date', today)
      .order('time_start')

    setTodaySchedules((scheds || []) as Schedule[])
    setLoading(false)
  }

  const handleCheckin = async () => {
    if (!brukare) return
    // Create visit record
    const currentSchedule = todaySchedules.find(s => s.status === 'scheduled')
    const { data } = await supabase.from('visits').insert({
      schedule_id: currentSchedule?.id || null,
      brukare_id: brukare.id,
      staff_name: 'Personal', // In production, from staff profile
      checkin_at: new Date().toISOString(),
    }).select().single()

    if (data) setActiveVisitId(data.id)
    if (currentSchedule) {
      await supabase.from('schedules').update({ status: 'active' }).eq('id', currentSchedule.id)
    }
  }

  const handleCheckout = async () => {
    if (!activeVisitId) return
    await supabase.from('visits').update({
      checkout_at: new Date().toISOString(),
      tasks_completed: completedTasks,
      staff_notes: staffNotes || null,
    }).eq('id', activeVisitId)

    // Update schedule status
    const currentSchedule = todaySchedules.find(s => s.status === 'active')
    if (currentSchedule) {
      await supabase.from('schedules').update({ status: 'completed' }).eq('id', currentSchedule.id)
    }

    setShowRatingPrompt(true)
  }

  const handleMoodRating = async (mood: 'happy' | 'neutral' | 'sad') => {
    if (!activeVisitId) return
    await supabase.from('visits').update({ mood_emoji: mood }).eq('id', activeVisitId)
    // Could also insert into ratings table
    setShowRatingPrompt(false)
    setVisitDone(true)
  }

  const langFlags = brukare?.languages.map(l => LANGUAGE_OPTIONS.find(lo => lo.code === l)).filter(Boolean) || []

  // Code entry screen
  if (!brukare) {
    return (
      <div className="min-h-screen bg-cc-bg flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xs text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cc-accent to-cc-accent2 flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-cc-bg" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Personal</h1>
          <p className="text-cc-muted mb-8">Ange koden som visas hos brukaren</p>

          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-14 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-mono font-bold transition-all ${
                code[i] ? 'border-cc-accent bg-cc-accent/5 text-cc-accent' : 'border-cc-border bg-cc-surface text-cc-muted'
              }`}>
                {code[i] || '·'}
              </div>
            ))}
          </div>

          <input
            type="tel"
            maxLength={4}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onKeyDown={e => e.key === 'Enter' && handleCodeEntry()}
            autoFocus
            className="sr-only"
            inputMode="numeric"
          />

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1,2,3,4,5,6,7,8,9,null,0,'⌫'].map((num, i) => (
              <button key={i}
                onClick={() => {
                  if (num === '⌫') setCode(code.slice(0, -1))
                  else if (num !== null && code.length < 4) setCode(code + num)
                }}
                disabled={num === null}
                className={`py-4 rounded-xl text-xl font-semibold transition-colors touch-target ${
                  num === null ? 'invisible' :
                  'bg-cc-surface hover:bg-cc-surface2 active:bg-cc-accent/10 text-cc-text'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          {error && <p className="text-cc-danger text-sm mb-4">{error}</p>}

          <button onClick={handleCodeEntry} disabled={code.length !== 4 || loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cc-accent to-cc-accent2 text-cc-bg font-semibold disabled:opacity-50">
            {loading ? 'Söker...' : 'Logga in'}
          </button>
        </div>
      </div>
    )
  }

  // Rating prompt after checkout
  if (showRatingPrompt) {
    return (
      <div className="min-h-screen bg-cc-bg flex flex-col items-center justify-center p-6">
        <h2 className="text-brukare-greeting text-cc-text mb-4">Hur var besöket?</h2>
        <p className="text-brukare-body text-cc-muted mb-10">{brukare.name}</p>
        <div className="flex gap-6">
          {[
            { emoji: '😊', mood: 'happy' as const, label: 'Bra' },
            { emoji: '😐', mood: 'neutral' as const, label: 'Okej' },
            { emoji: '😔', mood: 'sad' as const, label: 'Inte bra' },
          ].map(opt => (
            <button key={opt.mood} onClick={() => handleMoodRating(opt.mood)}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-cc-surface border border-cc-border hover:border-cc-accent transition-all">
              <span className="text-6xl">{opt.emoji}</span>
              <span className="text-lg text-cc-muted">{opt.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => { setShowRatingPrompt(false); setVisitDone(true) }}
          className="mt-8 text-cc-muted text-sm hover:underline">Hoppa över</button>
      </div>
    )
  }

  // Done screen
  if (visitDone) {
    return (
      <div className="min-h-screen bg-cc-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Tack!</h2>
        <p className="text-cc-muted mb-8">Besöket hos {brukare.name} är registrerat.</p>
        <button onClick={() => { setBrukare(null); setCode(''); setActiveVisitId(null); setVisitDone(false); setCompletedTasks([]); setStaffNotes('') }}
          className="px-6 py-3 rounded-xl bg-cc-surface border border-cc-border text-cc-text hover:border-cc-accent">
          Nytt besök
        </button>
      </div>
    )
  }

  // Brukare profile + visit view
  const currentSchedule = todaySchedules.find(s => s.status === 'scheduled' || s.status === 'active')
  const allTasks = currentSchedule?.tasks || []

  return (
    <div className="min-h-screen bg-cc-bg p-6">
      <div className="max-w-lg mx-auto">
        {/* Close */}
        <button onClick={() => { setBrukare(null); setCode('') }} className="mb-4 text-cc-muted hover:text-cc-text">
          <X className="w-6 h-6" />
        </button>

        {/* Brukare identity */}
        <div className="text-center mb-6 fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cc-accent to-cc-accent2 flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl font-bold text-cc-bg">{brukare.name.charAt(0)}</span>
          </div>
          <h1 className="text-2xl font-bold">{brukare.name}</h1>
          {brukare.birthplace && (
            <p className="text-cc-muted flex items-center justify-center gap-1 mt-1">
              <MapPin className="w-4 h-4" /> {brukare.birthplace}
            </p>
          )}
          <div className="flex justify-center gap-2 mt-2">
            {langFlags.map(l => l && (
              <span key={l.code} className="px-3 py-1 rounded-full bg-cc-accent/10 text-cc-accent text-lg">
                {l.flag} Jag talar {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Quick facts */}
        {brukare.allergies.length > 0 && (
          <div className="p-3 rounded-xl bg-cc-danger/10 border border-cc-danger/20 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-cc-danger flex-shrink-0" />
            <span className="text-cc-danger font-medium">Allergier: {brukare.allergies.join(', ')}</span>
          </div>
        )}

        {brukare.medications.length > 0 && (
          <div className="p-4 rounded-xl bg-cc-surface border border-cc-border mb-4">
            <p className="text-sm text-cc-muted mb-2 flex items-center gap-1"><Pill className="w-4 h-4" /> Mediciner</p>
            <ul className="space-y-1">
              {brukare.medications.map((m, i) => (
                <li key={i} className="text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cc-accent" /> {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {brukare.life_story && (
          <div className="p-4 rounded-xl bg-cc-surface border border-cc-border mb-4">
            <p className="text-sm text-cc-muted mb-1 flex items-center gap-1"><Heart className="w-4 h-4" /> Om {brukare.name}</p>
            <p className="text-sm text-cc-text/80 leading-relaxed">{brukare.life_story}</p>
          </div>
        )}

        {brukare.preferences && (
          <div className="p-4 rounded-xl bg-cc-surface border border-cc-border mb-6">
            <p className="text-sm text-cc-muted mb-1">Preferenser</p>
            <p className="text-sm text-cc-text/80">{brukare.preferences}</p>
          </div>
        )}

        {/* Task checklist */}
        {allTasks.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Uppgifter idag</h3>
            <div className="space-y-2">
              {allTasks.map(task => (
                <button key={task}
                  onClick={() => setCompletedTasks(
                    completedTasks.includes(task)
                      ? completedTasks.filter(t => t !== task)
                      : [...completedTasks, task]
                  )}
                  className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all touch-target ${
                    completedTasks.includes(task)
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-cc-surface border-cc-border text-cc-text'
                  }`}>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${
                    completedTasks.includes(task) ? 'border-green-400 bg-green-400' : 'border-cc-border'
                  }`}>
                    {completedTasks.includes(task) && <CheckCircle className="w-4 h-4 text-cc-bg" />}
                  </div>
                  <span className="font-medium">{task}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <textarea value={staffNotes} onChange={e => setStaffNotes(e.target.value)}
          placeholder="Anteckningar (valfritt)..." rows={2}
          className="w-full px-4 py-3 rounded-xl bg-cc-surface border border-cc-border text-cc-text text-sm mb-6 resize-none focus:border-cc-accent focus:outline-none" />

        {/* Check in / Check out button */}
        {!activeVisitId ? (
          <button onClick={handleCheckin}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cc-accent to-cc-accent2 text-cc-bg font-bold text-lg touch-target">
            ✓ Jag är här — Checka in
          </button>
        ) : (
          <button onClick={handleCheckout}
            className="w-full py-4 rounded-xl bg-green-600 text-white font-bold text-lg touch-target hover:bg-green-500">
            ✓ Klar — Checka ut
          </button>
        )}
      </div>
    </div>
  )
}
