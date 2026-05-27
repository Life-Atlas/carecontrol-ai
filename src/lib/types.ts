// Core types — matches Supabase schema

export type Role = 'brukare' | 'anhorig' | 'staff'
export type VisitStatus = 'scheduled' | 'active' | 'completed' | 'cancelled' | 'delayed'
export type MoodEmoji = 'happy' | 'neutral' | 'sad'

export interface Profile {
  id: string
  user_id: string
  name: string
  date_of_birth: string | null
  birthplace: string | null
  languages: string[]
  primary_language: string
  photo_url: string | null
  life_story: string | null
  medications: string[]
  allergies: string[]
  preferences: string
  role: Role
  linked_brukare_id: string | null
  access_code: string
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: string
  brukare_id: string
  date: string
  time_start: string
  time_end: string | null
  staff_name: string | null
  tasks: string[]
  status: VisitStatus
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface Visit {
  id: string
  schedule_id: string | null
  brukare_id: string
  staff_name: string | null
  checkin_at: string | null
  checkout_at: string | null
  tasks_completed: string[]
  staff_notes: string | null
  ai_summary: string | null
  mood_emoji: MoodEmoji | null
  created_at: string
}

export interface Rating {
  id: string
  visit_id: string
  rater_id: string
  rater_role: string
  emoji: MoodEmoji | null
  overall_score: number | null
  comment: string | null
  created_at: string
}

// UI helpers
export const TASK_OPTIONS = [
  'Frukost', 'Dusch', 'Medicin', 'Städning',
  'Promenad', 'Kvällsbesök', 'Tvätt', 'Annat'
] as const

export const LANGUAGE_OPTIONS = [
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'fa', label: 'فارسی (Persian)', flag: '🇮🇷' },
  { code: 'ar', label: 'العربية (Arabic)', flag: '🇸🇦' },
  { code: 'so', label: 'Soomaali (Somali)', flag: '🇸🇴' },
  { code: 'ti', label: 'ትግርኛ (Tigrinya)', flag: '🇪🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pl', label: 'Polski (Polish)', flag: '🇵🇱' },
  { code: 'da', label: 'Dari', flag: '🇦🇫' },
  { code: 'ku', label: 'Kurdî (Kurdish)', flag: '🏳️' },
  { code: 'es', label: 'Español (Spanish)', flag: '🇪🇸' },
] as const

export const GREETINGS: Record<string, string> = {
  sv: 'God morgon',
  fa: 'صبح بخیر',
  ar: 'صباح الخير',
  so: 'Subax wanaagsan',
  ti: 'ከመይ ሓዲርኩም',
  en: 'Good morning',
  pl: 'Dzień dobry',
  da: 'صبح بخیر',
  ku: 'Roj baş',
  es: 'Buenos días',
}
