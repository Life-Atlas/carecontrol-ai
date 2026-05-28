import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Schedule, Visit } from '@/lib/types'
import { MOCK_SCHEDULES, MOCK_VISITS, MOCK_BRUKARE } from '@/lib/mock-data'
import { ChevronLeft, ChevronRight, Clock, User, Calendar, Star, Home } from 'lucide-react'

function dateStr(daysOffset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString().split('T')[0]
}

function formatDay(dateString: string): string {
  const d = new Date(dateString + 'T12:00:00')
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000)

  if (diff === 0) return 'Idag'
  if (diff === -1) return 'Igår'
  if (diff === 1) return 'Imorgon'

  return d.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'short' })
}

function isToday(dateString: string): boolean {
  return dateString === dateStr(0)
}

function isPast(dateString: string): boolean {
  return dateString < dateStr(0)
}

function moodIcon(mood: string | null): string {
  if (mood === 'happy') return '😊'
  if (mood === 'sad') return '😔'
  if (mood === 'neutral') return '😐'
  return ''
}

function statusColor(status: string): string {
  switch (status) {
    case 'completed': return 'bg-green-500/15 text-green-400 border-green-500/30'
    case 'cancelled': return 'bg-red-500/15 text-red-400 border-red-500/30'
    case 'delayed': return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    case 'active': return 'bg-cc-accent/15 text-cc-accent border-cc-accent/30'
    default: return 'bg-cc-surface2 text-cc-muted border-cc-border'
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'completed': return 'Klar'
    case 'cancelled': return 'Inställd'
    case 'delayed': return 'Försenad'
    case 'active': return 'Pågår'
    default: return 'Planerad'
  }
}

export default function WeekView() {
  const { profile, demoMode } = useAuth()
  const [view, setView] = useState<'history' | 'upcoming'>('history')

  const schedules = demoMode ? MOCK_SCHEDULES : []
  const visits = demoMode ? MOCK_VISITS : []
  const brukare = demoMode ? MOCK_BRUKARE : profile

  const historyDates = Array.from({ length: 7 }, (_, i) => dateStr(-(7 - i)))
  const upcomingDates = [dateStr(0), dateStr(1), dateStr(2)]

  const dates = view === 'history' ? historyDates : upcomingDates

  const schedulesByDate = new Map<string, Schedule[]>()
  const visitsByDate = new Map<string, Visit[]>()

  for (const s of schedules) {
    const arr = schedulesByDate.get(s.date) || []
    arr.push(s)
    schedulesByDate.set(s.date, arr)
  }

  for (const v of visits) {
    const vDate = v.created_at.split('T')[0]
    const arr = visitsByDate.get(vDate) || []
    arr.push(v)
    visitsByDate.set(vDate, arr)
  }

  const totalVisitsWeek = visits.length
  const happyCount = visits.filter(v => v.mood_emoji === 'happy').length
  const uniqueStaff = new Set(visits.map(v => v.staff_name)).size

  return (
    <div className="min-h-screen bg-cc-bg pb-28">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-cc-muted text-sm">CareControl AI</p>
        <h1 className="font-display text-2xl font-bold text-cc-text">
          {brukare?.name || 'Mamma'}s vecka
        </h1>
      </div>

      {/* Tab switcher */}
      <div className="px-5 mb-4">
        <div className="flex rounded-2xl bg-cc-surface border border-cc-border overflow-hidden">
          <button
            onClick={() => setView('history')}
            className={`flex-1 py-4 text-lg font-semibold transition-colors ${
              view === 'history'
                ? 'bg-cc-accent text-cc-bg'
                : 'text-cc-muted hover:text-cc-text'
            }`}
          >
            Veckan som gått
          </button>
          <button
            onClick={() => setView('upcoming')}
            className={`flex-1 py-4 text-lg font-semibold transition-colors ${
              view === 'upcoming'
                ? 'bg-cc-accent text-cc-bg'
                : 'text-cc-muted hover:text-cc-text'
            }`}
          >
            Kommande
          </button>
        </div>
      </div>

      {/* Summary stats (history only) */}
      {view === 'history' && (
        <div className="px-5 mb-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-cc-surface border border-cc-border text-center">
              <p className="text-3xl font-bold text-cc-accent">{totalVisitsWeek}</p>
              <p className="text-sm text-cc-muted mt-1">Besök</p>
            </div>
            <div className="p-4 rounded-2xl bg-cc-surface border border-cc-border text-center">
              <p className="text-3xl font-bold text-green-400">{happyCount}</p>
              <p className="text-sm text-cc-muted mt-1">Glad 😊</p>
            </div>
            <div className="p-4 rounded-2xl bg-cc-surface border border-cc-border text-center">
              <p className="text-3xl font-bold text-cc-accent2">{uniqueStaff}</p>
              <p className="text-sm text-cc-muted mt-1">Personal</p>
            </div>
          </div>
        </div>
      )}

      {/* Day-by-day */}
      <div className="px-5 space-y-4">
        {dates.map(date => {
          const daySchedules = (schedulesByDate.get(date) || []).sort((a, b) => a.time_start.localeCompare(b.time_start))
          const dayVisits = visitsByDate.get(date) || []
          const isTodayDate = isToday(date)
          const isPastDate = isPast(date)

          if (daySchedules.length === 0) return null

          return (
            <div key={date} className="fade-in">
              {/* Day header */}
              <div className={`flex items-center gap-3 mb-2 ${isTodayDate ? 'text-cc-accent' : 'text-cc-text'}`}>
                <span className={`text-xl font-bold capitalize ${isTodayDate ? 'text-cc-accent' : ''}`}>
                  {formatDay(date)}
                </span>
                {isTodayDate && (
                  <span className="px-2 py-0.5 rounded-full bg-cc-accent/20 text-cc-accent text-xs font-medium">
                    NU
                  </span>
                )}
                {/* Mood summary for past days */}
                {isPastDate && dayVisits.length > 0 && (
                  <span className="ml-auto text-xl">
                    {dayVisits.map(v => moodIcon(v.mood_emoji)).join(' ')}
                  </span>
                )}
              </div>

              {/* Visits/schedules for this day */}
              <div className="space-y-2">
                {daySchedules.map(s => {
                  const visit = dayVisits.find(v => v.schedule_id === s.id)

                  return (
                    <div
                      key={s.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isTodayDate && s.status === 'scheduled'
                          ? 'bg-cc-accent/5 border-cc-accent/30'
                          : 'bg-cc-surface border-cc-border'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Time */}
                        <div className="flex-shrink-0 w-16 text-center">
                          <span className={`text-xl font-bold ${
                            s.status === 'completed' ? 'text-green-400' :
                            s.status === 'cancelled' ? 'text-red-400 line-through' :
                            isTodayDate ? 'text-cc-accent' : 'text-cc-text'
                          }`}>
                            {s.time_start.slice(0, 5)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-cc-muted flex-shrink-0" />
                            <span className="font-semibold text-lg truncate">{s.staff_name || 'Personal'}</span>
                            {visit && (
                              <span className="text-xl ml-auto flex-shrink-0">{moodIcon(visit.mood_emoji)}</span>
                            )}
                          </div>

                          {/* Tasks */}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {s.tasks.map(t => (
                              <span key={t} className={`px-2.5 py-1 rounded-lg text-sm font-medium ${
                                s.status === 'completed'
                                  ? 'bg-green-500/10 text-green-400'
                                  : 'bg-cc-accent/10 text-cc-accent'
                              }`}>
                                {t}
                              </span>
                            ))}
                          </div>

                          {/* Status badge */}
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColor(s.status)}`}>
                            {statusLabel(s.status)}
                          </span>

                          {/* Visit notes */}
                          {visit?.staff_notes && (
                            <p className="mt-2 text-sm text-cc-text/70 italic leading-relaxed">
                              "{visit.staff_notes}"
                            </p>
                          )}

                          {/* Schedule notes (for cancelled etc) */}
                          {!visit && s.notes && (
                            <p className="mt-2 text-sm text-cc-warn italic">{s.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-cc-surface border-t border-cc-border px-6 py-3 flex justify-around z-50">
        <Link to="/dashboard" className="flex flex-col items-center gap-1 text-cc-muted hover:text-cc-text">
          <Home className="w-5 h-5" /><span className="text-xs">Hem</span>
        </Link>
        <Link to="/week" className="flex flex-col items-center gap-1 text-cc-accent">
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
