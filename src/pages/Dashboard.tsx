import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Schedule, Visit } from '@/lib/types'
import { MOCK_SCHEDULES, MOCK_VISITS, MOCK_BRUKARE } from '@/lib/mock-data'
import { Calendar, User, Star, Settings, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const { profile, signOut, demoMode } = useAuth()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [recentVisits, setRecentVisits] = useState<Visit[]>([])
  const [brukareProfile, setBrukareProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const brukareId = profile?.linked_brukare_id

  useEffect(() => {
    if (demoMode) {
      setSchedules(MOCK_SCHEDULES)
      setRecentVisits(MOCK_VISITS)
      setBrukareProfile(MOCK_BRUKARE)
      setLoading(false)
      return
    }

    if (!brukareId) { setLoading(false); return }

    const load = async () => {
      const today = new Date().toISOString().split('T')[0]

      const [{ data: sched }, { data: visits }, { data: bp }] = await Promise.all([
        supabase.from('schedules').select('*')
          .eq('brukare_id', brukareId).eq('date', today)
          .order('time_start'),
        supabase.from('visits').select('*')
          .eq('brukare_id', brukareId)
          .order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('*')
          .eq('id', brukareId).single(),
      ])

      setSchedules((sched || []) as Schedule[])
      setRecentVisits((visits || []) as Visit[])
      setBrukareProfile(bp)
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel('dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules', filter: `brukare_id=eq.${brukareId}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visits', filter: `brukare_id=eq.${brukareId}` }, () => load())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [brukareId, demoMode])

  if (loading) {
    return <div className="min-h-screen bg-cc-bg flex items-center justify-center"><p className="text-cc-accent animate-pulse">Laddar...</p></div>
  }

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const completedToday = schedules.filter(s => s.status === 'completed').length
  const totalToday = schedules.length

  return (
    <div className="min-h-screen bg-cc-bg pb-24">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-cc-muted text-sm">CareControl AI</p>
            <h1 className="font-display text-xl font-bold text-cc-text">
              {brukareProfile?.name || 'Mamma'}
            </h1>
          </div>
          <button onClick={signOut} className="w-10 h-10 rounded-xl bg-cc-surface flex items-center justify-center">
            <Settings className="w-5 h-5 text-cc-muted" />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-cc-surface border border-cc-border text-center">
            <p className="text-2xl font-bold text-cc-accent">{totalToday}</p>
            <p className="text-xs text-cc-muted">Besök idag</p>
          </div>
          <div className="p-4 rounded-xl bg-cc-surface border border-cc-border text-center">
            <p className="text-2xl font-bold text-green-400">{completedToday}</p>
            <p className="text-xs text-cc-muted">Klara</p>
          </div>
          <div className="p-4 rounded-xl bg-cc-surface border border-cc-border text-center">
            <p className="text-2xl font-bold text-cc-warn">{totalToday - completedToday}</p>
            <p className="text-xs text-cc-muted">Kvar</p>
          </div>
        </div>

        {/* Today's schedule */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-cc-text">Idag</h2>
            <Link to="/schedule" className="text-cc-accent text-sm hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" /> Lägg till
            </Link>
          </div>

          {schedules.length === 0 ? (
            <div className="p-8 rounded-xl bg-cc-surface border border-cc-border text-center">
              <Calendar className="w-10 h-10 text-cc-muted mx-auto mb-3" />
              <p className="text-cc-muted">Inga besök inlagda idag</p>
              <Link to="/schedule" className="inline-block mt-3 px-4 py-2 rounded-lg bg-cc-accent text-cc-bg text-sm font-medium">
                Lägg till schema
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {schedules.map(s => {
                const isPast = s.time_start < currentTime
                const isActive = s.status === 'active'
                const isDone = s.status === 'completed'

                return (
                  <div key={s.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
                    isActive ? 'bg-cc-accent/5 border-cc-accent pulse-active' :
                    isDone ? 'bg-cc-surface border-cc-border opacity-60' :
                    'bg-cc-surface border-cc-border'
                  }`}>
                    <div className="w-14 text-center flex-shrink-0">
                      <span className={`text-lg font-bold ${isActive ? 'text-cc-accent' : isDone ? 'text-cc-muted' : 'text-cc-text'}`}>
                        {s.time_start.slice(0, 5)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{s.staff_name || 'Personal'}</span>
                        {isDone && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
                        {s.status === 'delayed' && <AlertCircle className="w-4 h-4 text-cc-warn flex-shrink-0" />}
                      </div>
                      <div className="flex gap-1.5 mt-1">
                        {s.tasks.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded bg-cc-surface2 text-cc-muted text-xs">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent visits */}
        {recentVisits.length > 0 && (
          <div>
            <h2 className="font-semibold text-cc-text mb-3">Senaste besök</h2>
            <div className="space-y-2">
              {recentVisits.map(v => (
                <div key={v.id} className="p-4 rounded-xl bg-cc-surface border border-cc-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{v.staff_name || 'Personal'}</p>
                      <p className="text-xs text-cc-muted">
                        {v.checkin_at && new Date(v.checkin_at).toLocaleDateString('sv-SE')}
                        {v.checkin_at && v.checkout_at && ` · ${Math.round((new Date(v.checkout_at).getTime() - new Date(v.checkin_at).getTime()) / 60000)} min`}
                      </p>
                    </div>
                    {v.mood_emoji && (
                      <span className="text-2xl">
                        {v.mood_emoji === 'happy' ? '😊' : v.mood_emoji === 'neutral' ? '😐' : '😔'}
                      </span>
                    )}
                  </div>
                  {v.tasks_completed.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                      {v.tasks_completed.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-xs">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Access code for staff */}
        {brukareProfile?.access_code && (
          <div className="p-4 rounded-xl bg-cc-surface2 border border-cc-border">
            <p className="text-xs text-cc-muted mb-1">Kod för personal (visa vid dörren)</p>
            <p className="text-3xl font-mono font-bold tracking-[0.3em] text-cc-accent text-center">
              {brukareProfile.access_code}
            </p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-cc-surface border-t border-cc-border px-6 py-3 flex justify-around">
        <Link to="/dashboard" className="flex flex-col items-center gap-1 text-cc-accent">
          <Clock className="w-5 h-5" /><span className="text-xs">Hem</span>
        </Link>
        <Link to="/week" className="flex flex-col items-center gap-1 text-cc-muted hover:text-cc-text">
          <Calendar className="w-5 h-5" /><span className="text-xs">Veckan</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center gap-1 text-cc-muted hover:text-cc-text">
          <User className="w-5 h-5" /><span className="text-xs">Profil</span>
        </Link>
        <Link to="/today" className="flex flex-col items-center gap-1 text-cc-muted hover:text-cc-text">
          <Star className="w-5 h-5" /><span className="text-xs">Mammas vy</span>
        </Link>
      </nav>
    </div>
  )
}
