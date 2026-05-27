import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Schedule, TASK_OPTIONS } from '@/lib/types'
import { Plus, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

export default function SchedulePage() {
  const { profile, user } = useAuth()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); return d
  })
  const [showForm, setShowForm] = useState(false)
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formTime, setFormTime] = useState('08:30')
  const [formStaff, setFormStaff] = useState('')
  const [formTasks, setFormTasks] = useState<string[]>([])
  const [formNotes, setFormNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const brukareId = profile?.role === 'brukare' ? profile.id : profile?.linked_brukare_id

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const fetchSchedules = async () => {
    if (!brukareId) return
    const { data } = await supabase.from('schedules').select('*')
      .eq('brukare_id', brukareId)
      .gte('date', weekStart.toISOString().split('T')[0])
      .lte('date', weekEnd.toISOString().split('T')[0])
      .order('date').order('time_start')
    setSchedules((data || []) as Schedule[])
  }

  useEffect(() => { fetchSchedules() }, [brukareId, weekStart])

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d
  })

  const dayNames = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

  const handleSave = async () => {
    if (!brukareId || !user) return
    setSaving(true)
    await supabase.from('schedules').insert({
      brukare_id: brukareId,
      date: formDate,
      time_start: formTime,
      staff_name: formStaff || null,
      tasks: formTasks,
      notes: formNotes || null,
      created_by: user.id,
    })
    setShowForm(false)
    setFormStaff(''); setFormTasks([]); setFormNotes('')
    await fetchSchedules()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Ta bort besöket?')) return
    await supabase.from('schedules').delete().eq('id', id)
    await fetchSchedules()
  }

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d) }
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d) }

  return (
    <div className="min-h-screen bg-cc-bg pb-24">
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="text-cc-muted hover:text-cc-text"><ChevronLeft className="w-6 h-6" /></Link>
          <h1 className="font-display text-xl font-bold">Schema</h1>
          <button onClick={() => setShowForm(true)} className="w-10 h-10 rounded-xl bg-cc-accent flex items-center justify-center">
            <Plus className="w-5 h-5 text-cc-bg" />
          </button>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevWeek} className="p-2 rounded-lg hover:bg-cc-surface"><ChevronLeft className="w-5 h-5 text-cc-muted" /></button>
          <span className="text-sm text-cc-muted">
            {weekStart.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })} — {weekEnd.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
          </span>
          <button onClick={nextWeek} className="p-2 rounded-lg hover:bg-cc-surface"><ChevronRight className="w-5 h-5 text-cc-muted" /></button>
        </div>

        {/* Week grid */}
        <div className="space-y-4">
          {days.map((day, i) => {
            const dateStr = day.toISOString().split('T')[0]
            const daySchedules = schedules.filter(s => s.date === dateStr)
            const isToday = dateStr === new Date().toISOString().split('T')[0]

            return (
              <div key={dateStr}>
                <div className={`text-sm font-medium mb-2 ${isToday ? 'text-cc-accent' : 'text-cc-muted'}`}>
                  {dayNames[i]} {day.getDate()}/{day.getMonth() + 1}
                  {isToday && <span className="ml-2 px-2 py-0.5 rounded bg-cc-accent/10 text-cc-accent text-xs">Idag</span>}
                </div>

                {daySchedules.length === 0 ? (
                  <div className="px-4 py-3 rounded-lg border border-dashed border-cc-border text-cc-muted text-sm">
                    Inga besök
                  </div>
                ) : (
                  <div className="space-y-2">
                    {daySchedules.map(s => (
                      <div key={s.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cc-surface border border-cc-border">
                        <span className="font-mono font-bold text-cc-accent w-12">{s.time_start.slice(0, 5)}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{s.staff_name || 'Personal'}</p>
                          <div className="flex gap-1 mt-1">
                            {s.tasks.map(t => <span key={t} className="px-1.5 py-0.5 rounded bg-cc-surface2 text-cc-muted text-xs">{t}</span>)}
                          </div>
                        </div>
                        <button onClick={() => handleDelete(s.id)} className="text-cc-muted hover:text-cc-danger">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="w-full bg-cc-surface rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-bold">Nytt besök</h2>
              <button onClick={() => setShowForm(false)}><X className="w-6 h-6 text-cc-muted" /></button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-cc-muted mb-1 block">Datum</label>
                  <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-cc-surface2 border border-cc-border text-cc-text text-sm" />
                </div>
                <div className="w-28">
                  <label className="text-xs text-cc-muted mb-1 block">Tid</label>
                  <input type="time" value={formTime} onChange={e => setFormTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-cc-surface2 border border-cc-border text-cc-text text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs text-cc-muted mb-1 block">Personal</label>
                <input value={formStaff} onChange={e => setFormStaff(e.target.value)} placeholder="Namn (valfritt)"
                  className="w-full px-3 py-2.5 rounded-lg bg-cc-surface2 border border-cc-border text-cc-text text-sm" />
              </div>

              <div>
                <label className="text-xs text-cc-muted mb-1 block">Uppgifter</label>
                <div className="flex flex-wrap gap-2">
                  {TASK_OPTIONS.map(task => (
                    <button key={task}
                      onClick={() => setFormTasks(formTasks.includes(task) ? formTasks.filter(t => t !== task) : [...formTasks, task])}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        formTasks.includes(task) ? 'bg-cc-accent/20 text-cc-accent' : 'bg-cc-bg text-cc-muted'
                      }`}>
                      {task}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-cc-muted mb-1 block">Anteckningar</label>
                <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={2}
                  className="w-full px-3 py-2.5 rounded-lg bg-cc-surface2 border border-cc-border text-cc-text text-sm resize-none" />
              </div>

              <button onClick={handleSave} disabled={saving}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cc-accent to-cc-accent2 text-cc-bg font-semibold">
                {saving ? 'Sparar...' : 'Spara besök'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
