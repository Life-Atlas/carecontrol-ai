import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Schedule } from '@/lib/types'
import { MOCK_SCHEDULES, MOCK_BRUKARE } from '@/lib/mock-data'
import { Clock, Volume2, Check, HelpCircle, Heart, ChevronRight } from 'lucide-react'
import {
  tr, trTask, getGreeting, speakText,
  getStaffColor, getStaffInitials,
} from '@/lib/translations'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

const WISHES = [
  { key: 'wish.shower' as const, icon: '🚿' },
  { key: 'wish.walk'   as const, icon: '🚶' },
  { key: 'wish.call'   as const, icon: '📞' },
  { key: 'wish.rest'   as const, icon: '😴' },
] as const

export default function TodayView() {
  const { profile, demoMode } = useAuth()

  const [schedules, setSchedules]         = useState<Schedule[]>([])
  const [loading, setLoading]             = useState(true)
  const [acknowledged, setAcknowledged]   = useState(false)
  const [helpSent, setHelpSent]           = useState(false)
  const [activeWishes, setActiveWishes]   = useState<Set<string>>(new Set())

  const brukareProfile =
    profile?.role === 'brukare' ? profile : (demoMode ? MOCK_BRUKARE : null)
  const lang = brukareProfile?.primary_language || profile?.primary_language || 'sv'
  const name = brukareProfile?.name || profile?.name || ''
  const brukareId = profile?.role === 'brukare' ? profile.id : profile?.linked_brukare_id
  const isRtl = lang === 'fa' || lang === 'ar'
  const dir = isRtl ? 'rtl' : 'ltr'

  // ── Data loading ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (demoMode) {
      const today = todayStr()
      setSchedules(
        MOCK_SCHEDULES
          .filter(s => s.date === today)
          .sort((a, b) => a.time_start.localeCompare(b.time_start))
      )
      setLoading(false)
      return
    }

    if (!brukareId) return

    const today = todayStr()

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
  }, [brukareId, demoMode])

  // ── Computed visit state ──────────────────────────────────────────────────────
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const upcoming = schedules.filter(
    s => s.time_start >= currentTime && s.status !== 'completed' && s.status !== 'cancelled'
  )
  const nextVisit  = upcoming[0]
  const laterVisits = upcoming.slice(1)

  // ── TTS ───────────────────────────────────────────────────────────────────────
  const handleSpeak = useCallback(() => {
    if (!nextVisit) return
    const parts: string[] = []
    const time = nextVisit.time_start.slice(0, 5)
    const staff = nextVisit.staff_name || ''
    const tasks = nextVisit.tasks.map(t => trTask(t, lang)).join(', ')
    parts.push(`${time}, ${staff}. ${tasks}.`)
    laterVisits.forEach(v => {
      const lt = v.time_start.slice(0, 5)
      const ls = v.staff_name || ''
      const lt2 = v.tasks.map(t => trTask(t, lang)).join(', ')
      parts.push(`${lt}, ${ls}. ${lt2}.`)
    })
    speakText(parts.join(' '), lang)
  }, [nextVisit, laterVisits, lang])

  // ── Hjälp button ─────────────────────────────────────────────────────────────
  const handleHelp = () => {
    setHelpSent(true)
    setTimeout(() => setHelpSent(false), 3000)
  }

  // ── Wish toggle ───────────────────────────────────────────────────────────────
  const toggleWish = (key: string) => {
    setActiveWishes(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-cc-bg flex items-center justify-center brukare-mode">
        <div className="text-cc-accent text-brukare-body animate-pulse">
          {lang === 'fa' ? '...بارگذاری' : 'Laddar...'}
        </div>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cc-bg p-5 brukare-mode flex flex-col" dir={dir}>

      {/* ── Help sent banner ─────────────────────────────────────────────────── */}
      {helpSent && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl bg-green-600 text-white text-brukare-body font-semibold shadow-xl fade-in">
          {tr('today.helpSent', lang)}
        </div>
      )}

      {/* ── Header row: greeting + TTS button ────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 fade-in">
        <div className="flex-1">
          <p className="text-brukare-greeting text-cc-text leading-tight">
            {getGreeting(lang)}, {name}
          </p>
          <p className="text-brukare-body text-cc-muted mt-1">
            {now.toLocaleDateString(lang === 'sv' ? 'sv-SE' : lang === 'fa' ? 'fa-IR' : 'en', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </p>
        </div>

        {nextVisit && (
          <button
            onClick={handleSpeak}
            aria-label={tr('today.listen', lang)}
            className="flex-shrink-0 ms-4 w-16 h-16 rounded-full bg-cc-accent/10 border border-cc-accent flex items-center justify-center active:scale-95 transition-transform touch-target"
          >
            <Volume2 className="w-8 h-8 text-cc-accent" />
          </button>
        )}
      </div>

      {/* ── Next Visit card ───────────────────────────────────────────────────── */}
      {nextVisit ? (
        <div className="flex-1 flex flex-col">

          <div className={`rounded-3xl p-7 mb-5 fade-in ${
            nextVisit.status === 'active'
              ? 'bg-cc-accent/10 border-2 border-cc-accent pulse-active'
              : nextVisit.status === 'delayed'
              ? 'bg-amber-500/10 border-2 border-amber-500'
              : 'bg-cc-surface border border-cc-border'
          }`}>

            {/* Status badge */}
            <div className="flex justify-center mb-5">
              <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-brukare-body font-semibold ${
                nextVisit.status === 'active'
                  ? 'bg-cc-accent/20 text-cc-accent'
                  : nextVisit.status === 'delayed'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-cc-surface2 text-cc-muted'
              }`}>
                {nextVisit.status === 'active'  && <span className="w-3 h-3 rounded-full bg-cc-accent inline-block" />}
                {nextVisit.status === 'delayed' && <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />}
                {nextVisit.status === 'scheduled' && <span className="w-3 h-3 rounded-full bg-cc-muted inline-block" />}
                {nextVisit.status === 'active'
                  ? tr('status.here', lang)
                  : nextVisit.status === 'delayed'
                  ? tr('status.delayed', lang)
                  : tr('status.planned', lang)}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <Clock className="w-10 h-10 text-cc-accent" />
              <span className="text-brukare-time text-cc-text font-bold tabular-nums">
                {nextVisit.time_start.slice(0, 5)}
              </span>
              {nextVisit.time_end && (
                <span className="text-brukare-name text-cc-muted flex items-center gap-1">
                  <ChevronRight className="w-6 h-6" />
                  {nextVisit.time_end.slice(0, 5)}
                </span>
              )}
            </div>

            {/* Staff avatar */}
            {nextVisit.staff_name && (
              <div className="flex flex-col items-center mb-5">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-2 text-2xl font-bold text-white shadow-lg"
                  style={{ backgroundColor: getStaffColor(nextVisit.staff_name) }}
                >
                  {getStaffInitials(nextVisit.staff_name)}
                </div>
                <p className="text-brukare-name text-cc-text font-semibold">
                  {nextVisit.staff_name.split(' ')[0]}
                </p>
              </div>
            )}

            {/* Delay reassurance */}
            {nextVisit.status === 'delayed' && nextVisit.staff_name && (
              <div className="text-center mb-5 px-2">
                <p className="text-brukare-body text-amber-300 leading-relaxed">
                  {tr('status.delayMsg', lang, {
                    name: nextVisit.staff_name.split(' ')[0],
                    min: '10',
                  })}
                </p>
              </div>
            )}

            {/* Tasks */}
            {nextVisit.tasks.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3">
                {nextVisit.tasks.map(task => (
                  <span
                    key={task}
                    className="px-5 py-3 rounded-2xl bg-cc-accent/10 text-cc-accent text-brukare-body font-medium"
                  >
                    {trTask(task, lang)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Later visits ─────────────────────────────────────────────────── */}
          {laterVisits.length > 0 && (
            <div className="mb-5 space-y-3">
              <p className="text-cc-muted text-lg font-medium px-1">
                {tr('today.laterToday', lang)}
              </p>
              {laterVisits.map(v => (
                <div
                  key={v.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-cc-surface border border-cc-border"
                >
                  {/* Mini avatar */}
                  {v.staff_name && (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: getStaffColor(v.staff_name) }}
                    >
                      {getStaffInitials(v.staff_name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-bold text-cc-text tabular-nums">
                        {v.time_start.slice(0, 5)}
                      </span>
                      <span className="text-brukare-body text-cc-muted truncate">
                        {v.staff_name?.split(' ')[0] || ''}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {v.tasks.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded bg-cc-surface2 text-cc-muted text-sm">
                          {trTask(t, lang)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : (
        /* ── No upcoming visits ──────────────────────────────────────────────── */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center fade-in">
            <span className="text-6xl mb-4 block">☀️</span>
            <p className="text-brukare-name text-cc-muted">
              {schedules.length === 0
                ? tr('today.noSchedule', lang)
                : tr('today.allDone', lang)}
            </p>
          </div>
        </div>
      )}

      {/* ── Wishes row ───────────────────────────────────────────────────────── */}
      <div className="mt-4 mb-5">
        <p className="text-cc-muted text-lg font-medium mb-3 px-1">
          {tr('today.wishes', lang)}
        </p>
        <div className="grid grid-cols-4 gap-3">
          {WISHES.map(({ key, icon }) => {
            const active = activeWishes.has(key)
            return (
              <button
                key={key}
                onClick={() => toggleWish(key)}
                className={`flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all active:scale-95 touch-target ${
                  active
                    ? 'bg-cc-accent/20 border-cc-accent text-cc-accent'
                    : 'bg-cc-surface border-cc-border text-cc-muted'
                }`}
                aria-pressed={active}
              >
                <span className="text-3xl mb-1">{icon}</span>
                <span className="text-sm font-medium leading-tight text-center">
                  {tr(key, lang)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Bottom action buttons ─────────────────────────────────────────────── */}
      <div className="flex gap-4">
        <button
          onClick={() => setAcknowledged(v => !v)}
          className={`flex-1 py-5 rounded-2xl text-brukare-body font-semibold flex items-center justify-center gap-3 transition-all touch-target ${
            acknowledged
              ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
              : 'bg-green-600 text-white active:bg-green-500'
          }`}
        >
          {acknowledged ? <Heart className="w-7 h-7" /> : <Check className="w-7 h-7" />}
          {acknowledged ? tr('today.ok', lang) + ' ✓' : tr('today.ok', lang)}
        </button>

        <button
          onClick={handleHelp}
          className="flex-1 py-5 rounded-2xl bg-cc-accent2 text-white text-brukare-body font-semibold flex items-center justify-center gap-3 active:opacity-80 transition-opacity touch-target"
        >
          <HelpCircle className="w-7 h-7" />
          {tr('today.help', lang)}
        </button>
      </div>

    </div>
  )
}
