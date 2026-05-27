import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Profile as ProfileType, LANGUAGE_OPTIONS } from '@/lib/types'
import { ChevronLeft, Edit2, Save, MapPin, Heart, Pill, AlertTriangle } from 'lucide-react'

export default function Profile() {
  const { profile: myProfile, user, refreshProfile } = useAuth()
  const [brukare, setBrukare] = useState<ProfileType | null>(null)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<ProfileType>>({})
  const [saving, setSaving] = useState(false)

  const brukareId = myProfile?.role === 'brukare' ? myProfile.id : myProfile?.linked_brukare_id

  useEffect(() => {
    if (!brukareId) return
    supabase.from('profiles').select('*').eq('id', brukareId).single()
      .then(({ data }) => {
        if (data) { setBrukare(data as ProfileType); setEditData(data) }
      })
  }, [brukareId])

  const handleSave = async () => {
    if (!brukareId) return
    setSaving(true)
    await supabase.from('profiles').update({
      name: editData.name,
      birthplace: editData.birthplace,
      life_story: editData.life_story,
      preferences: editData.preferences,
    }).eq('id', brukareId)
    setBrukare({ ...brukare!, ...editData })
    setEditing(false)
    setSaving(false)
  }

  if (!brukare) {
    return <div className="min-h-screen bg-cc-bg flex items-center justify-center"><p className="text-cc-muted">Laddar profil...</p></div>
  }

  const langFlags = brukare.languages.map(l => LANGUAGE_OPTIONS.find(lo => lo.code === l)).filter(Boolean)

  return (
    <div className="min-h-screen bg-cc-bg pb-24">
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="text-cc-muted hover:text-cc-text"><ChevronLeft className="w-6 h-6" /></Link>
          <h1 className="font-display text-xl font-bold">Vårdpass</h1>
          <button onClick={() => editing ? handleSave() : setEditing(true)}
            className="w-10 h-10 rounded-xl bg-cc-surface flex items-center justify-center">
            {saving ? <span className="animate-spin">⏳</span> :
             editing ? <Save className="w-5 h-5 text-cc-accent" /> :
             <Edit2 className="w-5 h-5 text-cc-muted" />}
          </button>
        </div>

        {/* Header card */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cc-accent to-cc-accent2 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-bold text-cc-bg">{brukare.name.charAt(0)}</span>
          </div>
          {editing ? (
            <input value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })}
              className="text-2xl font-bold text-center bg-transparent border-b border-cc-accent text-cc-text w-full focus:outline-none" />
          ) : (
            <h2 className="text-2xl font-bold">{brukare.name}</h2>
          )}
          {brukare.birthplace && (
            <p className="text-cc-muted flex items-center justify-center gap-1 mt-1">
              <MapPin className="w-4 h-4" /> {brukare.birthplace}
            </p>
          )}
          <div className="flex justify-center gap-2 mt-3">
            {langFlags.map(l => l && (
              <span key={l.code} className="px-3 py-1 rounded-full bg-cc-accent/10 text-cc-accent text-sm">
                {l.flag} {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Life story */}
        <div className="mb-6">
          <h3 className="text-cc-accent font-semibold mb-2 flex items-center gap-2"><Heart className="w-4 h-4" /> Om mig</h3>
          {editing ? (
            <textarea value={editData.life_story || ''} onChange={e => setEditData({ ...editData, life_story: e.target.value })}
              rows={4} className="w-full px-4 py-3 rounded-xl bg-cc-surface border border-cc-border text-cc-text resize-none focus:border-cc-accent focus:outline-none" />
          ) : (
            <p className="text-cc-text/80 leading-relaxed p-4 rounded-xl bg-cc-surface border border-cc-border">
              {brukare.life_story || 'Ingen livsberättelse tillagd ännu. Tryck på pennan för att lägga till.'}
            </p>
          )}
        </div>

        {/* Medications */}
        <div className="mb-6">
          <h3 className="text-cc-accent font-semibold mb-2 flex items-center gap-2"><Pill className="w-4 h-4" /> Mediciner</h3>
          <div className="p-4 rounded-xl bg-cc-surface border border-cc-border">
            {brukare.medications.length === 0 ? (
              <p className="text-cc-muted text-sm">Inga mediciner tillagda</p>
            ) : (
              <ul className="space-y-2">
                {brukare.medications.map((m, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-cc-accent flex-shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Allergies */}
        <div className="mb-6">
          <h3 className="text-cc-danger font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Allergier</h3>
          <div className="flex flex-wrap gap-2">
            {brukare.allergies.length === 0 ? (
              <span className="text-cc-muted text-sm">Inga allergier</span>
            ) : (
              brukare.allergies.map((a, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-cc-danger/10 text-cc-danger text-sm font-medium">{a}</span>
              ))
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="mb-6">
          <h3 className="text-cc-accent2 font-semibold mb-2">Preferenser</h3>
          {editing ? (
            <textarea value={editData.preferences || ''} onChange={e => setEditData({ ...editData, preferences: e.target.value })}
              rows={3} placeholder="T.ex. 'Vill bli tilltalad vid namn. Ta av skorna. Tycker om te på morgonen.'"
              className="w-full px-4 py-3 rounded-xl bg-cc-surface border border-cc-border text-cc-text resize-none focus:border-cc-accent focus:outline-none" />
          ) : (
            <p className="text-cc-text/80 p-4 rounded-xl bg-cc-surface border border-cc-border text-sm leading-relaxed">
              {brukare.preferences || 'Inga preferenser tillagda'}
            </p>
          )}
        </div>

        {/* Access code */}
        <div className="p-4 rounded-xl bg-cc-surface2 border border-cc-border text-center">
          <p className="text-xs text-cc-muted mb-1">Personalkod</p>
          <p className="text-4xl font-mono font-bold tracking-[0.4em] text-cc-accent">{brukare.access_code}</p>
          <p className="text-xs text-cc-muted mt-2">Visa denna kod för personal vid dörren</p>
        </div>
      </div>
    </div>
  )
}
