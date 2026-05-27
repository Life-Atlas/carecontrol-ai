import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Schedule, GREETINGS } from '@/lib/types'
import { Clock, User, HelpCircle, Check } from 'lucide-react'

export default function TodayView() {
  const { profile } = useAuth()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [acknowledged, setAcknowledged] = useState(false)

  const brukareId = profile?.role === 'brukare' ? profile.id : profile?.linked_brukare_id
  const brukareProfile = profile?.role === 'brukare' ? profile : null
  const lang = brukareProfile?.primary_language || profile?.primary_language || 'sv'
  const greeting = GREETINGS[lang] || GREETINGS.sv
  const name = brukareProfile?.name || profile?.name || ''

  useEffect(() => {
    if (!brukareId) return

    const today = new Date().toISOString().split('T')[0]

    const fetchSchedules = async () => {
      const { data } = await supabase
        .from('schedules')
        .select('*')
        .eq('brukare_id', brukareId)
        .eq('date', today)
        .order('time_start', { ascending: true })

      setSchedules((data || []) as Schedule[])
      setLoading(false)
    }

    fetchSchedules()

    // Realtime subscription — updates when Dena changes schedule
    const channel = supabase
      .channel('today-schedules')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'schedules',
        filter: `brukare_id=eq.${brukareId}`,
      }, () => { fetchSchedules() })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [brukareId])

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  // Find next upcoming visit
  const upcoming = schedules.filter(s => s.time_start >= currentTime && s.status !== 'completed' && s.status !== 'cancelled')
  const completed = schedules.filter(s => s.status === 'completed' || s.time_start < currentTime)
  const nextVisit = upcoming[0]
  const laterVisits = upcoming.slice(1)

  if (loading) {
    return (
      <div className="min-h-screen bg-cc-bg flex items-center justify-center brukare-mode">
        <div className="text-cc-accent text-brukare-body animate-pulse">Laddar...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cc-bg p-6 brukare-mode flex flex-col">
      {/* Greeting */}
      <div className="text-center mb-8 fade-in">
        <p className="text-brukare-greeting text-cc-text" dir={lang === 'fa' || lang === 'ar' ? 'rtl' : 'ltr'}>
          {greeting}, {name} 👋
        </p>
        <p className="text-brukare-body text-cc-muted mt-2">
          {new Date().toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en', {
            weekday: 'long', day: 'numeric', month: 'long'
          })}
        </p>
      </div>

      {/* Next Visit — THE main card */}
      {nextVisit ? (
        <div className="flex-1 flex flex-col">
          <div className={`flex-1 rounded-3xl p-8 mb-6 fade-in ${
            nextVisit.status === 'active'
              ? 'bg-cc-accent/10 border-2 border-cc-accent pulse-active'
              : 'bg-cc-surface border border-cc-border'
          }`}>
            {/* Status */}
            <div className="text-center mb-6">
              <span className={`inline-block px-4 py-2 rounded-full text-brukare-body font-medium ${
                nextVisit.status === 'active' ? 'bg-cc-accent/20 text-cc-accent' :
                nextVisit.status === 'delayed' ? 'bg-cc-warn/20 text-cc-warn' :
                'bg-cc-surface2 text-cc-muted'
              }`}>
                {nextVisit.status === 'active' ? '🟢 Här nu' :
                 nextVisit.status === 'delayed' ? '🟡 Försenad' :
                 '⏳ Planerat'}
              </span>
            </div>

            {/* Time */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3">
                <Clock className="w-10 h-10 text-cc-accent" />
                <span className="text-brukare-time text-cc-text">
                  {nextVisit.time_start.slice(0, 5)}
                </span>
              </div>
              {nextVisit.time_end && (
                <p className="text-brukare-body text-cc-muted mt-1">
                  → {nextVisit.time_end.slice(0, 5)}
                </p>
              )}
            </div>

            {/* Staff */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-cc-accent/10 flex items-center justify-center mx-auto mb-3">
                <User className="w-10 h-10 text-cc-accent" />
              </div>
              <p className="text-brukare-name text-cc-text">
                {nextVisit.staff_name || 'Personal'}
              </p>
            </div>

            {/* Tasks */}
            {nextVisit.tasks.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3">
                {nextVisit.tasks.map(task => (
                  <span key={task} className="px-5 py-3 rounded-2xl bg-cc-accent/10 text-cc-accent text-brukare-body font-medium">
                    {task}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Later visits */}
          {laterVisits.length > 0 && (
            <div className="mb-6 space-y-3">
              <p className="text-cc-muted text-lg font-medium px-2">Senare idag</p>
              {laterVisits.map(v => (
                <div key={v.id} className="flex items-center gap-4 p-4 rounded-2xl bg-cc-surface border border-cc-border">
                  <span className="text-2xl font-bold text-cc-muted w-16">{v.time_start.slice(0, 5)}</span>
                  <div className="flex-1">
                    <p className="text-lg font-medium">{v.staff_name || 'Personal'}</p>
                    <div className="flex gap-2 mt-1">
                      {v.tasks.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded bg-cc-surface2 text-cc-muted text-sm">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl mb-4 block">☀️</span>
            <p className="text-brukare-name text-cc-muted">
              {schedules.length === 0 ? 'Inget schema inlagt än' : 'Alla besök klara idag'}
            </p>
          </div>
        </div>
      )}

      {/* Bottom buttons — HUGE touch targets */}
      <div className="flex gap-4 mt-auto">
        <button
          onClick={() => setAcknowledged(true)}
          className={`flex-1 py-6 rounded-2xl text-brukare-body font-semibold flex items-center justify-center gap-3 transition-all touch-target ${
            acknowledged
              ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
              : 'bg-green-600 text-white hover:bg-green-500'
          }`}
        >
          <Check className="w-8 h-8" />
          {acknowledged ? 'OK ✓' : 'OK'}
        </button>

        <button className="flex-1 py-6 rounded-2xl bg-cc-accent2 text-white text-brukare-body font-semibold flex items-center justify-center gap-3 hover:opacity-90 touch-target">
          <HelpCircle className="w-8 h-8" />
          Hjälp
        </button>
      </div>
    </div>
  )
}
