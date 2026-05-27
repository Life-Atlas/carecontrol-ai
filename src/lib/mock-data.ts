import type { Profile, Schedule, Visit } from './types'

const today = new Date().toISOString().split('T')[0]
const nowH = new Date().getHours()
const soon = `${String(nowH + 1).padStart(2, '0')}:00`
const soonEnd = `${String(nowH + 1).padStart(2, '0')}:45`
const later = `${String(Math.min(nowH + 3, 23)).padStart(2, '0')}:00`
const laterEnd = `${String(Math.min(nowH + 3, 23)).padStart(2, '0')}:30`

export const MOCK_BRUKARE: Profile = {
  id: 'mock-brukare-1',
  user_id: 'mock-user-1',
  name: 'Fatimah',
  date_of_birth: '1948-03-15',
  birthplace: 'Teheran',
  languages: ['fa', 'sv'],
  primary_language: 'fa',
  photo_url: null,
  life_story: 'Född i Teheran. Flyttade till Sverige 1985. Älskar att laga ghormeh sabzi och titta på persiska filmer. Tycker om promenader i parken.',
  medications: ['Metformin 500mg (morgon)', 'Enalapril 10mg (kväll)', 'Kalcidon (morgon)'],
  allergies: ['Penicillin', 'Nötter'],
  preferences: 'Vill bli tilltalad på persiska. Föredrar kvinnlig personal. Dricker te, inte kaffe.',
  role: 'brukare',
  linked_brukare_id: null,
  access_code: '4829',
  created_at: '2026-05-27T10:00:00Z',
  updated_at: '2026-05-27T10:00:00Z',
}

export const MOCK_ANHORIG: Profile = {
  id: 'mock-anhorig-1',
  user_id: 'mock-user-1',
  name: 'Dena',
  date_of_birth: '1982-06-10',
  birthplace: 'Göteborg',
  languages: ['sv', 'fa', 'en'],
  primary_language: 'sv',
  photo_url: null,
  life_story: null,
  medications: [],
  allergies: [],
  preferences: '',
  role: 'anhorig',
  linked_brukare_id: 'mock-brukare-1',
  access_code: '0000',
  created_at: '2026-05-27T10:00:00Z',
  updated_at: '2026-05-27T10:00:00Z',
}

export const MOCK_SCHEDULES: Schedule[] = [
  {
    id: 'mock-sched-1',
    brukare_id: 'mock-brukare-1',
    date: today,
    time_start: '08:00',
    time_end: '08:45',
    staff_name: 'Anna L.',
    tasks: ['Frukost', 'Medicin'],
    status: 'completed' as const,
    notes: null,
    created_by: null,
    created_at: '2026-05-27T06:00:00Z',
  },
  {
    id: 'mock-sched-2',
    brukare_id: 'mock-brukare-1',
    date: today,
    time_start: soon,
    time_end: soonEnd,
    staff_name: 'Maria K.',
    tasks: ['Medicin', 'Promenad'],
    status: 'scheduled' as const,
    notes: null,
    created_by: null,
    created_at: '2026-05-27T06:00:00Z',
  },
  {
    id: 'mock-sched-3',
    brukare_id: 'mock-brukare-1',
    date: today,
    time_start: later,
    time_end: laterEnd,
    staff_name: 'Erik S.',
    tasks: ['Kvällsbesök', 'Medicin'],
    status: 'scheduled' as const,
    notes: 'Hjälp med kvällsmat',
    created_by: null,
    created_at: '2026-05-27T06:00:00Z',
  },
]

export const MOCK_VISITS: Visit[] = [
  {
    id: 'mock-visit-1',
    schedule_id: 'mock-sched-1',
    brukare_id: 'mock-brukare-1',
    staff_name: 'Anna L.',
    checkin_at: `${today}T07:58:00Z`,
    checkout_at: `${today}T08:42:00Z`,
    tasks_completed: ['Frukost', 'Medicin'],
    staff_notes: 'Fatimah var glad idag. Åt bra frukost.',
    ai_summary: null,
    mood_emoji: 'happy',
    created_at: `${today}T07:58:00Z`,
  },
]
