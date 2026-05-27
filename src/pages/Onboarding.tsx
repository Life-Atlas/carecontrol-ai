import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Role, LANGUAGE_OPTIONS, TASK_OPTIONS } from '@/lib/types'
import { Users, Heart, Calendar, ChevronRight, ChevronLeft, Plus, X } from 'lucide-react'

export default function Onboarding() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 1: Role
  const [role, setRole] = useState<Role | null>(null)

  // Step 2: Brukare profile
  const [brukareName, setBrukareName] = useState('')
  const [birthplace, setBirthplace] = useState('')
  const [languages, setLanguages] = useState<string[]>(['sv'])
  const [lifeStory, setLifeStory] = useState('')
  const [medications, setMedications] = useState<string[]>([])
  const [medInput, setMedInput] = useState('')
  const [allergies, setAllergies] = useState<string[]>([])
  const [allergyInput, setAllergyInput] = useState('')

  // Step 3: Schedule
  const [scheduleEntries, setScheduleEntries] = useState<Array<{
    day: string; time: string; staffName: string; tasks: string[]
  }>>([{ day: 'Måndag', time: '08:30', staffName: '', tasks: [] }])

  const addMed = () => {
    if (medInput.trim()) { setMedications([...medications, medInput.trim()]); setMedInput('') }
  }
  const addAllergy = () => {
    if (allergyInput.trim()) { setAllergies([...allergies, allergyInput.trim()]); setAllergyInput('') }
  }

  const handleSave = async () => {
    if (!user || !role) return
    setSaving(true)

    try {
      if (role === 'anhorig') {
        // Create brukare profile first (placeholder user)
        const { data: brukareProfile } = await supabase.from('profiles').insert({
          user_id: user.id, // temporary — will be updated when brukare gets own account
          name: brukareName,
          birthplace,
          languages,
          primary_language: languages[0] || 'sv',
          life_story: lifeStory,
          medications,
          allergies,
          role: 'brukare' as Role,
        }).select().single()

        // Create anhörig profile linked to brukare
        // For now, use same user_id — in production, brukare would have their own account
        await supabase.from('profiles').insert({
          user_id: user.id,
          name: user.email?.split('@')[0] || 'Anhörig',
          role: 'anhorig' as Role,
          linked_brukare_id: brukareProfile?.id,
          languages: ['sv'],
          primary_language: 'sv',
        })

        // Create schedule entries
        if (brukareProfile) {
          const today = new Date()
          const dayMap: Record<string, number> = {
            'Måndag': 1, 'Tisdag': 2, 'Onsdag': 3, 'Torsdag': 4,
            'Fredag': 5, 'Lördag': 6, 'Söndag': 0,
          }

          for (const entry of scheduleEntries) {
            if (!entry.time) continue
            const dayNum = dayMap[entry.day] ?? 1
            // Find next occurrence of this weekday
            const d = new Date(today)
            while (d.getDay() !== dayNum) d.setDate(d.getDate() + 1)

            await supabase.from('schedules').insert({
              brukare_id: brukareProfile.id,
              date: d.toISOString().split('T')[0],
              time_start: entry.time,
              staff_name: entry.staffName || null,
              tasks: entry.tasks,
              created_by: user.id,
            })
          }
        }
      } else {
        // Brukare or staff — create single profile
        await supabase.from('profiles').insert({
          user_id: user.id,
          name: role === 'brukare' ? brukareName : (user.email?.split('@')[0] || 'Personal'),
          role,
          languages: role === 'brukare' ? languages : ['sv'],
          primary_language: role === 'brukare' ? (languages[0] || 'sv') : 'sv',
          life_story: role === 'brukare' ? lifeStory : null,
          medications: role === 'brukare' ? medications : [],
          allergies: role === 'brukare' ? allergies : [],
          birthplace: role === 'brukare' ? birthplace : null,
        })
      }

      await refreshProfile()
      navigate(role === 'brukare' ? '/today' : '/dashboard')
    } catch (err) {
      console.error('Onboarding error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-cc-bg p-6">
      <div className="max-w-lg mx-auto">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-cc-accent' : 'bg-cc-border'
            }`} />
          ))}
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="fade-in">
            <h1 className="font-display text-2xl font-bold mb-2">Vem är du?</h1>
            <p className="text-cc-muted mb-8">Välj din roll för att komma igång</p>

            <div className="space-y-3">
              {([
                { r: 'anhorig' as Role, icon: Users, title: 'Anhörig', desc: 'Jag hjälper en närstående som har hemtjänst' },
                { r: 'brukare' as Role, icon: Heart, title: 'Jag har hemtjänst', desc: 'Jag vill ha kontroll över mitt schema' },
                { r: 'staff' as Role, icon: Calendar, title: 'Personal', desc: 'Jag jobbar inom hemtjänsten' },
              ]).map(opt => (
                <button
                  key={opt.r}
                  onClick={() => { setRole(opt.r); setStep(opt.r === 'staff' ? 3 : 2) }}
                  className={`w-full p-5 rounded-xl border text-left flex items-center gap-4 transition-all touch-target ${
                    role === opt.r
                      ? 'border-cc-accent bg-cc-accent/5'
                      : 'border-cc-border bg-cc-surface hover:border-cc-accent/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-cc-accent/10 flex items-center justify-center flex-shrink-0">
                    <opt.icon className="w-6 h-6 text-cc-accent" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{opt.title}</div>
                    <div className="text-cc-muted text-sm">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Brukare Profile */}
        {step === 2 && (
          <div className="fade-in">
            <h1 className="font-display text-2xl font-bold mb-2">
              {role === 'anhorig' ? 'Berätta om din närstående' : 'Berätta om dig'}
            </h1>
            <p className="text-cc-muted mb-6">Den här informationen hjälper personalen att ge bättre vård</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-cc-muted mb-1">Namn *</label>
                <input value={brukareName} onChange={e => setBrukareName(e.target.value)}
                  placeholder="Fatimah" required
                  className="w-full px-4 py-3 rounded-xl bg-cc-surface border border-cc-border text-cc-text focus:border-cc-accent focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm text-cc-muted mb-1">Födelseort</label>
                <input value={birthplace} onChange={e => setBirthplace(e.target.value)}
                  placeholder="Isfahan, Iran"
                  className="w-full px-4 py-3 rounded-xl bg-cc-surface border border-cc-border text-cc-text focus:border-cc-accent focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm text-cc-muted mb-2">Språk</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map(lang => (
                    <button key={lang.code}
                      onClick={() => setLanguages(
                        languages.includes(lang.code)
                          ? languages.filter(l => l !== lang.code)
                          : [...languages, lang.code]
                      )}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        languages.includes(lang.code)
                          ? 'bg-cc-accent/20 text-cc-accent border border-cc-accent'
                          : 'bg-cc-surface border border-cc-border text-cc-muted hover:border-cc-accent/50'
                      }`}
                    >
                      {lang.flag} {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-cc-muted mb-1">Livsberättelse</label>
                <textarea value={lifeStory} onChange={e => setLifeStory(e.target.value)}
                  placeholder="Berätta lite om personen — var hen växte upp, vad hen tycker om, vad som är viktigt..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-cc-surface border border-cc-border text-cc-text focus:border-cc-accent focus:outline-none resize-none" />
              </div>

              <div>
                <label className="block text-sm text-cc-muted mb-1">Mediciner</label>
                <div className="flex gap-2 mb-2">
                  <input value={medInput} onChange={e => setMedInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMed())}
                    placeholder="T.ex. Metoprolol 50mg"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-cc-surface border border-cc-border text-cc-text focus:border-cc-accent focus:outline-none text-sm" />
                  <button onClick={addMed} className="px-3 py-2.5 rounded-xl bg-cc-accent/10 text-cc-accent hover:bg-cc-accent/20">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {medications.map((m, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-cc-surface2 text-sm flex items-center gap-1.5">
                      {m} <button onClick={() => setMedications(medications.filter((_, j) => j !== i))}><X className="w-3.5 h-3.5 text-cc-muted" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-cc-muted mb-1">Allergier</label>
                <div className="flex gap-2 mb-2">
                  <input value={allergyInput} onChange={e => setAllergyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                    placeholder="T.ex. Penicillin"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-cc-surface border border-cc-border text-cc-text focus:border-cc-accent focus:outline-none text-sm" />
                  <button onClick={addAllergy} className="px-3 py-2.5 rounded-xl bg-cc-danger/10 text-cc-danger hover:bg-cc-danger/20">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((a, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-cc-danger/10 text-cc-danger text-sm flex items-center gap-1.5">
                      {a} <button onClick={() => setAllergies(allergies.filter((_, j) => j !== i))}><X className="w-3.5 h-3.5" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-cc-border text-cc-muted hover:text-cc-text">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setStep(3)} disabled={!brukareName}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cc-accent to-cc-accent2 text-cc-bg font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                Nästa <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div className="fade-in">
            <h1 className="font-display text-2xl font-bold mb-2">Veckans schema</h1>
            <p className="text-cc-muted mb-6">Lägg till besök — du kan ändra senare</p>

            <div className="space-y-4">
              {scheduleEntries.map((entry, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-cc-surface border border-cc-border space-y-3">
                  <div className="flex gap-3">
                    <select value={entry.day}
                      onChange={e => { const n = [...scheduleEntries]; n[idx].day = e.target.value; setScheduleEntries(n) }}
                      className="flex-1 px-3 py-2.5 rounded-lg bg-cc-surface2 border border-cc-border text-cc-text text-sm">
                      {['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <input type="time" value={entry.time}
                      onChange={e => { const n = [...scheduleEntries]; n[idx].time = e.target.value; setScheduleEntries(n) }}
                      className="px-3 py-2.5 rounded-lg bg-cc-surface2 border border-cc-border text-cc-text text-sm" />
                  </div>
                  <input placeholder="Namn på personal (valfritt)"
                    value={entry.staffName}
                    onChange={e => { const n = [...scheduleEntries]; n[idx].staffName = e.target.value; setScheduleEntries(n) }}
                    className="w-full px-3 py-2.5 rounded-lg bg-cc-surface2 border border-cc-border text-cc-text text-sm focus:border-cc-accent focus:outline-none" />
                  <div className="flex flex-wrap gap-2">
                    {TASK_OPTIONS.map(task => (
                      <button key={task}
                        onClick={() => {
                          const n = [...scheduleEntries]
                          n[idx].tasks = n[idx].tasks.includes(task)
                            ? n[idx].tasks.filter(t => t !== task)
                            : [...n[idx].tasks, task]
                          setScheduleEntries(n)
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          entry.tasks.includes(task)
                            ? 'bg-cc-accent/20 text-cc-accent'
                            : 'bg-cc-bg text-cc-muted hover:text-cc-text'
                        }`}
                      >
                        {task}
                      </button>
                    ))}
                  </div>
                  {scheduleEntries.length > 1 && (
                    <button onClick={() => setScheduleEntries(scheduleEntries.filter((_, i) => i !== idx))}
                      className="text-xs text-cc-danger hover:underline">Ta bort</button>
                  )}
                </div>
              ))}

              <button
                onClick={() => setScheduleEntries([...scheduleEntries, { day: 'Måndag', time: '12:00', staffName: '', tasks: [] }])}
                className="w-full py-3 rounded-xl border border-dashed border-cc-border text-cc-muted hover:border-cc-accent hover:text-cc-accent transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Lägg till besök
              </button>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(role === 'staff' ? 1 : 2)} className="px-5 py-3 rounded-xl border border-cc-border text-cc-muted hover:text-cc-text">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cc-accent to-cc-accent2 text-cc-bg font-semibold disabled:opacity-50">
                {saving ? 'Sparar...' : 'Starta CareControl →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
