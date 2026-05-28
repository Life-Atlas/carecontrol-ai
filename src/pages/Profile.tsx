import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Profile as ProfileType, LANGUAGE_OPTIONS } from '@/lib/types'
import { MOCK_BRUKARE } from '@/lib/mock-data'
import {
  ChevronLeft, Edit2, Save, X, MapPin, Heart, Pill,
  AlertTriangle, Plus, Check, Globe
} from 'lucide-react'

const INPUT_CLS =
  'w-full bg-cc-surface border border-cc-border rounded-xl px-4 py-3 text-cc-text focus:border-cc-accent focus:outline-none text-sm'

const TEXTAREA_CLS =
  'w-full bg-cc-surface border border-cc-border rounded-xl px-4 py-3 text-cc-text focus:border-cc-accent focus:outline-none resize-none text-sm'

export default function Profile() {
  const { profile: myProfile, demoMode } = useAuth()
  const [brukare, setBrukare] = useState<ProfileType | null>(null)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<ProfileType | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(false)

  const brukareId = myProfile?.role === 'brukare' ? myProfile.id : myProfile?.linked_brukare_id

  useEffect(() => {
    if (demoMode) {
      setBrukare(MOCK_BRUKARE)
      return
    }
    if (!brukareId) return
    supabase.from('profiles').select('*').eq('id', brukareId).single()
      .then(({ data }) => {
        if (data) setBrukare(data as ProfileType)
      })
  }, [brukareId, demoMode])

  const startEdit = () => {
    if (!brukare) return
    setEditData({ ...brukare })
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditData(null)
    setEditing(false)
  }

  const handleSave = async () => {
    if (!editData) return
    setSaving(true)
    if (!demoMode && brukareId) {
      await supabase.from('profiles').update({
        name: editData.name,
        birthplace: editData.birthplace,
        life_story: editData.life_story,
        preferences: editData.preferences,
        medications: editData.medications,
        allergies: editData.allergies,
        languages: editData.languages,
        primary_language: editData.primary_language,
      }).eq('id', brukareId)
    }
    setBrukare({ ...editData })
    setEditing(false)
    setEditData(null)
    setSaving(false)
    setToast(true)
    setTimeout(() => setToast(false), 2000)
  }

  // --- list helpers ---
  const addItem = (field: 'medications' | 'allergies') => {
    if (!editData) return
    setEditData({ ...editData, [field]: [...editData[field], ''] })
  }
  const updateItem = (field: 'medications' | 'allergies', idx: number, val: string) => {
    if (!editData) return
    const arr = [...editData[field]]
    arr[idx] = val
    setEditData({ ...editData, [field]: arr })
  }
  const removeItem = (field: 'medications' | 'allergies', idx: number) => {
    if (!editData) return
    setEditData({ ...editData, [field]: editData[field].filter((_, i) => i !== idx) })
  }

  const toggleLanguage = (code: string) => {
    if (!editData) return
    const has = editData.languages.includes(code)
    const next = has ? editData.languages.filter(l => l !== code) : [...editData.languages, code]
    // if we removed the primary, reset it
    const primary = next.includes(editData.primary_language) ? editData.primary_language : (next[0] ?? '')
    setEditData({ ...editData, languages: next, primary_language: primary })
  }

  if (!brukare) {
    return (
      <div className="min-h-screen bg-cc-bg flex items-center justify-center">
        <p className="text-cc-muted">Laddar profil...</p>
      </div>
    )
  }

  const data = editing ? editData! : brukare
  const primaryLang = LANGUAGE_OPTIONS.find(l => l.code === data.primary_language)

  return (
    <div className="min-h-screen bg-cc-bg pb-28">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-cc-accent text-cc-bg font-semibold shadow-lg text-sm">
          <Check className="w-4 h-4" /> Sparat!
        </div>
      )}

      <div className="px-6 pt-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="text-cc-muted hover:text-cc-text">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-display text-xl font-bold">Vårdpass</h1>
          {editing ? (
            <button onClick={cancelEdit} className="w-10 h-10 rounded-xl bg-cc-surface flex items-center justify-center">
              <X className="w-5 h-5 text-cc-muted" />
            </button>
          ) : (
            <button onClick={startEdit} className="w-10 h-10 rounded-xl bg-cc-surface flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-cc-muted" />
            </button>
          )}
        </div>

        {/* ===== EMERGENCY CARD ===== */}
        <div className="border-2 border-red-500/30 bg-red-500/5 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="font-bold text-red-400 tracking-wide text-sm uppercase">Nödinfo</span>
            <span className="text-xs text-cc-muted ml-1">— visa för ambulanspersonal</span>
          </div>

          {/* Allergies */}
          <div className="mb-3">
            <p className="text-xs text-cc-muted mb-1 font-medium">Allergier</p>
            {data.allergies.length === 0 ? (
              <span className="text-xs text-cc-muted italic">Inga kända allergier</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.allergies.map((a, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-sm font-semibold border border-red-500/30">
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Medications */}
          <div className="mb-3">
            <p className="text-xs text-cc-muted mb-1 font-medium">Mediciner</p>
            {data.medications.length === 0 ? (
              <span className="text-xs text-cc-muted italic">Inga mediciner</span>
            ) : (
              <ul className="space-y-1">
                {data.medications.map((m, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-cc-text">
                    <span className="w-1.5 h-1.5 rounded-full bg-cc-accent flex-shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Primary language */}
          {primaryLang && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cc-muted flex-shrink-0" />
              <span className="text-sm text-cc-text">
                Talar <span className="font-semibold">{primaryLang.flag} {primaryLang.label}</span>
              </span>
            </div>
          )}
        </div>

        {/* ===== HEADER CARD ===== */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cc-accent to-cc-accent2 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-bold text-cc-bg">{data.name.charAt(0)}</span>
          </div>

          {editing ? (
            <input
              value={editData!.name}
              onChange={e => setEditData({ ...editData!, name: e.target.value })}
              className="text-2xl font-bold text-center bg-transparent border-b border-cc-accent text-cc-text w-full focus:outline-none mb-2"
              placeholder="Namn"
            />
          ) : (
            <h2 className="text-2xl font-bold mb-1">{data.name}</h2>
          )}

          {editing ? (
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-cc-muted flex-shrink-0" />
              <input
                value={editData!.birthplace ?? ''}
                onChange={e => setEditData({ ...editData!, birthplace: e.target.value })}
                className={INPUT_CLS}
                placeholder="Födelseort"
              />
            </div>
          ) : (
            data.birthplace && (
              <p className="text-cc-muted flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-4 h-4" /> {data.birthplace}
              </p>
            )
          )}

          {/* Language chips (read mode) */}
          {!editing && (
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {data.languages.map(code => {
                const l = LANGUAGE_OPTIONS.find(lo => lo.code === code)
                return l ? (
                  <span key={code} className={`px-3 py-1 rounded-full text-sm ${code === data.primary_language ? 'bg-cc-accent/20 text-cc-accent font-semibold' : 'bg-cc-surface text-cc-muted'}`}>
                    {l.flag} {l.label}
                  </span>
                ) : null
              })}
            </div>
          )}
        </div>

        {/* ===== LANGUAGES (edit mode only) ===== */}
        {editing && (
          <div className="mb-6">
            <h3 className="text-cc-accent font-semibold mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Språk
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {LANGUAGE_OPTIONS.map(l => {
                const selected = editData!.languages.includes(l.code)
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => toggleLanguage(l.code)}
                    className={`px-3 py-1.5 rounded-xl text-sm border transition-colors ${
                      selected
                        ? 'bg-cc-accent/20 border-cc-accent text-cc-accent'
                        : 'bg-cc-surface border-cc-border text-cc-muted'
                    }`}
                  >
                    {l.flag} {l.label}
                    {selected && <Check className="inline w-3 h-3 ml-1" />}
                  </button>
                )
              })}
            </div>
            {editData!.languages.length > 0 && (
              <div>
                <label className="text-xs text-cc-muted mb-1 block">Primärspråk</label>
                <select
                  value={editData!.primary_language}
                  onChange={e => setEditData({ ...editData!, primary_language: e.target.value })}
                  className={INPUT_CLS}
                >
                  {editData!.languages.map(code => {
                    const l = LANGUAGE_OPTIONS.find(lo => lo.code === code)
                    return l ? <option key={code} value={code}>{l.flag} {l.label}</option> : null
                  })}
                </select>
              </div>
            )}
          </div>
        )}

        {/* ===== LIFE STORY ===== */}
        <div className="mb-6">
          <h3 className="text-cc-accent font-semibold mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4" /> Om mig
          </h3>
          {editing ? (
            <textarea
              value={editData!.life_story ?? ''}
              onChange={e => setEditData({ ...editData!, life_story: e.target.value })}
              rows={3}
              placeholder="Berätta om Fatimah — var hon kommer ifrån, vad hon älskar, hennes historia."
              className={TEXTAREA_CLS}
            />
          ) : (
            <p className="text-cc-text/80 leading-relaxed p-4 rounded-xl bg-cc-surface border border-cc-border text-sm">
              {data.life_story || 'Ingen livsberättelse tillagd ännu. Tryck på pennan för att lägga till.'}
            </p>
          )}
        </div>

        {/* ===== PREFERENCES ===== */}
        <div className="mb-6">
          <h3 className="text-cc-accent2 font-semibold mb-2">Preferenser</h3>
          {editing ? (
            <textarea
              value={editData!.preferences ?? ''}
              onChange={e => setEditData({ ...editData!, preferences: e.target.value })}
              rows={2}
              placeholder="T.ex. 'Vill bli tilltalad vid namn. Ta av skorna. Tycker om te på morgonen.'"
              className={TEXTAREA_CLS}
            />
          ) : (
            <p className="text-cc-text/80 p-4 rounded-xl bg-cc-surface border border-cc-border text-sm leading-relaxed">
              {data.preferences || 'Inga preferenser tillagda'}
            </p>
          )}
        </div>

        {/* ===== MEDICATIONS ===== */}
        <div className="mb-6">
          <h3 className="text-cc-accent font-semibold mb-2 flex items-center gap-2">
            <Pill className="w-4 h-4" /> Mediciner
          </h3>
          {editing ? (
            <div className="space-y-2">
              {editData!.medications.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={m}
                    onChange={e => updateItem('medications', i, e.target.value)}
                    placeholder="T.ex. Metformin 500mg (morgon)"
                    className={INPUT_CLS}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem('medications', i)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-cc-surface border border-cc-border text-cc-muted hover:text-cc-danger flex-shrink-0"
                    aria-label="Ta bort medicin"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('medications')}
                className="flex items-center gap-2 text-sm text-cc-accent hover:text-cc-accent/80 mt-1"
              >
                <Plus className="w-4 h-4" /> Lägg till medicin
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-cc-surface border border-cc-border">
              {data.medications.length === 0 ? (
                <p className="text-cc-muted text-sm">Inga mediciner tillagda</p>
              ) : (
                <ul className="space-y-2">
                  {data.medications.map((m, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-cc-accent flex-shrink-0" />
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* ===== ALLERGIES ===== */}
        <div className="mb-6">
          <h3 className="text-cc-danger font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Allergier
          </h3>
          {editing ? (
            <div className="space-y-2">
              {editData!.allergies.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={a}
                    onChange={e => updateItem('allergies', i, e.target.value)}
                    placeholder="T.ex. Penicillin"
                    className={INPUT_CLS}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem('allergies', i)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-cc-surface border border-cc-border text-cc-muted hover:text-cc-danger flex-shrink-0"
                    aria-label="Ta bort allergi"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('allergies')}
                className="flex items-center gap-2 text-sm text-cc-danger hover:text-cc-danger/80 mt-1"
              >
                <Plus className="w-4 h-4" /> Lägg till allergi
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.allergies.length === 0 ? (
                <span className="text-cc-muted text-sm">Inga allergier</span>
              ) : (
                data.allergies.map((a, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-cc-danger/10 text-cc-danger text-sm font-medium">
                    {a}
                  </span>
                ))
              )}
            </div>
          )}
        </div>

        {/* ===== ACCESS CODE ===== */}
        <div className="p-4 rounded-xl bg-cc-surface2 border border-cc-border text-center mb-6">
          <p className="text-xs text-cc-muted mb-1">Personalkod</p>
          <p className="text-4xl font-mono font-bold tracking-[0.4em] text-cc-accent">{data.access_code}</p>
          <p className="text-xs text-cc-muted mt-2">Visa denna kod för personal vid dörren</p>
        </div>

        {/* ===== SAVE / CANCEL (edit mode) ===== */}
        {editing && (
          <div className="flex gap-3 pb-4">
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 py-3 rounded-2xl bg-cc-surface border border-cc-border text-cc-muted font-semibold text-sm"
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <><Save className="w-4 h-4" /> Spara</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
