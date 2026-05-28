import type { Profile, Schedule, Visit } from './types'

function dateStr(daysOffset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString().split('T')[0]
}

function ts(daysOffset: number, time: string): string {
  return `${dateStr(daysOffset)}T${time}:00Z`
}

const nowH = new Date().getHours()
const soon = `${String(Math.min(nowH + 1, 23)).padStart(2, '0')}:00`
const soonEnd = `${String(Math.min(nowH + 1, 23)).padStart(2, '0')}:45`
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
  created_at: '2026-05-20T10:00:00Z',
  updated_at: '2026-05-20T10:00:00Z',
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
  created_at: '2026-05-20T10:00:00Z',
  updated_at: '2026-05-20T10:00:00Z',
}

// --- 7 days of history + today + 2 days upcoming ---

const STAFF = ['Anna L.', 'Maria K.', 'Erik S.', 'Sara B.', 'Johan M.']

export const MOCK_SCHEDULES: Schedule[] = [
  // -7 days
  { id: 's-7a', brukare_id: 'mock-brukare-1', date: dateStr(-7), time_start: '08:00', time_end: '08:45', staff_name: 'Anna L.', tasks: ['Frukost', 'Medicin'], status: 'completed', notes: null, created_by: null, created_at: ts(-7, '06:00') },
  { id: 's-7b', brukare_id: 'mock-brukare-1', date: dateStr(-7), time_start: '12:00', time_end: '12:30', staff_name: 'Maria K.', tasks: ['Medicin', 'Promenad'], status: 'completed', notes: null, created_by: null, created_at: ts(-7, '06:00') },
  { id: 's-7c', brukare_id: 'mock-brukare-1', date: dateStr(-7), time_start: '17:30', time_end: '18:15', staff_name: 'Erik S.', tasks: ['Kvällsbesök', 'Medicin'], status: 'completed', notes: null, created_by: null, created_at: ts(-7, '06:00') },
  // -6 days
  { id: 's-6a', brukare_id: 'mock-brukare-1', date: dateStr(-6), time_start: '08:00', time_end: '08:45', staff_name: 'Sara B.', tasks: ['Frukost', 'Dusch', 'Medicin'], status: 'completed', notes: null, created_by: null, created_at: ts(-6, '06:00') },
  { id: 's-6b', brukare_id: 'mock-brukare-1', date: dateStr(-6), time_start: '17:30', time_end: '18:15', staff_name: 'Anna L.', tasks: ['Kvällsbesök', 'Medicin'], status: 'completed', notes: null, created_by: null, created_at: ts(-6, '06:00') },
  // -5 days
  { id: 's-5a', brukare_id: 'mock-brukare-1', date: dateStr(-5), time_start: '08:00', time_end: '08:45', staff_name: 'Maria K.', tasks: ['Frukost', 'Medicin'], status: 'completed', notes: null, created_by: null, created_at: ts(-5, '06:00') },
  { id: 's-5b', brukare_id: 'mock-brukare-1', date: dateStr(-5), time_start: '12:00', time_end: '12:30', staff_name: 'Johan M.', tasks: ['Städning'], status: 'completed', notes: null, created_by: null, created_at: ts(-5, '06:00') },
  { id: 's-5c', brukare_id: 'mock-brukare-1', date: dateStr(-5), time_start: '17:30', time_end: '18:15', staff_name: 'Erik S.', tasks: ['Kvällsbesök', 'Medicin'], status: 'completed', notes: null, created_by: null, created_at: ts(-5, '06:00') },
  // -4 days
  { id: 's-4a', brukare_id: 'mock-brukare-1', date: dateStr(-4), time_start: '08:00', time_end: '08:45', staff_name: 'Anna L.', tasks: ['Frukost', 'Medicin'], status: 'completed', notes: null, created_by: null, created_at: ts(-4, '06:00') },
  { id: 's-4b', brukare_id: 'mock-brukare-1', date: dateStr(-4), time_start: '17:30', time_end: '18:15', staff_name: 'Sara B.', tasks: ['Kvällsbesök', 'Medicin', 'Tvätt'], status: 'completed', notes: null, created_by: null, created_at: ts(-4, '06:00') },
  // -3 days
  { id: 's-3a', brukare_id: 'mock-brukare-1', date: dateStr(-3), time_start: '08:00', time_end: '08:45', staff_name: 'Erik S.', tasks: ['Frukost', 'Dusch', 'Medicin'], status: 'completed', notes: null, created_by: null, created_at: ts(-3, '06:00') },
  { id: 's-3b', brukare_id: 'mock-brukare-1', date: dateStr(-3), time_start: '12:00', time_end: '12:30', staff_name: 'Maria K.', tasks: ['Medicin', 'Promenad'], status: 'completed', notes: null, created_by: null, created_at: ts(-3, '06:00') },
  { id: 's-3c', brukare_id: 'mock-brukare-1', date: dateStr(-3), time_start: '17:30', time_end: '18:15', staff_name: 'Anna L.', tasks: ['Kvällsbesök', 'Medicin'], status: 'cancelled', notes: 'Personal sjuk', created_by: null, created_at: ts(-3, '06:00') },
  // -2 days
  { id: 's-2a', brukare_id: 'mock-brukare-1', date: dateStr(-2), time_start: '08:00', time_end: '08:45', staff_name: 'Sara B.', tasks: ['Frukost', 'Medicin'], status: 'completed', notes: null, created_by: null, created_at: ts(-2, '06:00') },
  { id: 's-2b', brukare_id: 'mock-brukare-1', date: dateStr(-2), time_start: '12:00', time_end: '12:30', staff_name: 'Johan M.', tasks: ['Medicin', 'Promenad'], status: 'completed', notes: null, created_by: null, created_at: ts(-2, '06:00') },
  { id: 's-2c', brukare_id: 'mock-brukare-1', date: dateStr(-2), time_start: '17:30', time_end: '18:15', staff_name: 'Anna L.', tasks: ['Kvällsbesök', 'Medicin'], status: 'completed', notes: null, created_by: null, created_at: ts(-2, '06:00') },
  // -1 (yesterday)
  { id: 's-1a', brukare_id: 'mock-brukare-1', date: dateStr(-1), time_start: '08:00', time_end: '08:45', staff_name: 'Maria K.', tasks: ['Frukost', 'Medicin'], status: 'completed', notes: null, created_by: null, created_at: ts(-1, '06:00') },
  { id: 's-1b', brukare_id: 'mock-brukare-1', date: dateStr(-1), time_start: '12:00', time_end: '12:30', staff_name: 'Erik S.', tasks: ['Medicin'], status: 'delayed', notes: 'Försenad 20 min', created_by: null, created_at: ts(-1, '06:00') },
  { id: 's-1c', brukare_id: 'mock-brukare-1', date: dateStr(-1), time_start: '17:30', time_end: '18:15', staff_name: 'Sara B.', tasks: ['Kvällsbesök', 'Medicin'], status: 'completed', notes: null, created_by: null, created_at: ts(-1, '06:00') },
  // TODAY
  { id: 's-0a', brukare_id: 'mock-brukare-1', date: dateStr(0), time_start: '08:00', time_end: '08:45', staff_name: 'Anna L.', tasks: ['Frukost', 'Medicin'], status: 'completed', notes: null, created_by: null, created_at: ts(0, '06:00') },
  { id: 's-0b', brukare_id: 'mock-brukare-1', date: dateStr(0), time_start: soon, time_end: soonEnd, staff_name: 'Maria K.', tasks: ['Medicin', 'Promenad'], status: 'scheduled', notes: null, created_by: null, created_at: ts(0, '06:00') },
  { id: 's-0c', brukare_id: 'mock-brukare-1', date: dateStr(0), time_start: later, time_end: laterEnd, staff_name: 'Erik S.', tasks: ['Kvällsbesök', 'Medicin'], status: 'scheduled', notes: 'Hjälp med kvällsmat', created_by: null, created_at: ts(0, '06:00') },
  // +1 (tomorrow)
  { id: 's+1a', brukare_id: 'mock-brukare-1', date: dateStr(1), time_start: '08:00', time_end: '08:45', staff_name: 'Sara B.', tasks: ['Frukost', 'Dusch', 'Medicin'], status: 'scheduled', notes: null, created_by: null, created_at: ts(0, '06:00') },
  { id: 's+1b', brukare_id: 'mock-brukare-1', date: dateStr(1), time_start: '12:00', time_end: '12:30', staff_name: 'Anna L.', tasks: ['Medicin', 'Promenad'], status: 'scheduled', notes: null, created_by: null, created_at: ts(0, '06:00') },
  { id: 's+1c', brukare_id: 'mock-brukare-1', date: dateStr(1), time_start: '17:30', time_end: '18:15', staff_name: 'Maria K.', tasks: ['Kvällsbesök', 'Medicin'], status: 'scheduled', notes: null, created_by: null, created_at: ts(0, '06:00') },
  // +2
  { id: 's+2a', brukare_id: 'mock-brukare-1', date: dateStr(2), time_start: '08:00', time_end: '08:45', staff_name: 'Johan M.', tasks: ['Frukost', 'Medicin'], status: 'scheduled', notes: null, created_by: null, created_at: ts(0, '06:00') },
  { id: 's+2b', brukare_id: 'mock-brukare-1', date: dateStr(2), time_start: '17:30', time_end: '18:15', staff_name: 'Erik S.', tasks: ['Kvällsbesök', 'Medicin'], status: 'scheduled', notes: null, created_by: null, created_at: ts(0, '06:00') },
]

export const MOCK_VISITS: Visit[] = [
  // -7
  { id: 'v-7a', schedule_id: 's-7a', brukare_id: 'mock-brukare-1', staff_name: 'Anna L.', checkin_at: ts(-7, '07:58'), checkout_at: ts(-7, '08:40'), tasks_completed: ['Frukost', 'Medicin'], staff_notes: 'Fatimah mådde bra. Åt ostsmörgås och drack te.', ai_summary: null, mood_emoji: 'happy', created_at: ts(-7, '07:58') },
  { id: 'v-7b', schedule_id: 's-7b', brukare_id: 'mock-brukare-1', staff_name: 'Maria K.', checkin_at: ts(-7, '12:05'), checkout_at: ts(-7, '12:35'), tasks_completed: ['Medicin', 'Promenad'], staff_notes: 'Kort promenad runt kvarteret. Fatimah var pigg.', ai_summary: null, mood_emoji: 'happy', created_at: ts(-7, '12:05') },
  { id: 'v-7c', schedule_id: 's-7c', brukare_id: 'mock-brukare-1', staff_name: 'Erik S.', checkin_at: ts(-7, '17:35'), checkout_at: ts(-7, '18:10'), tasks_completed: ['Kvällsbesök', 'Medicin'], staff_notes: 'Lagade enkel middag. Fatimah ville titta på TV.', ai_summary: null, mood_emoji: 'neutral', created_at: ts(-7, '17:35') },
  // -6
  { id: 'v-6a', schedule_id: 's-6a', brukare_id: 'mock-brukare-1', staff_name: 'Sara B.', checkin_at: ts(-6, '08:02'), checkout_at: ts(-6, '08:50'), tasks_completed: ['Frukost', 'Dusch', 'Medicin'], staff_notes: 'Duschdagen gick bra. Fatimah klarade det mesta själv.', ai_summary: null, mood_emoji: 'happy', created_at: ts(-6, '08:02') },
  { id: 'v-6b', schedule_id: 's-6b', brukare_id: 'mock-brukare-1', staff_name: 'Anna L.', checkin_at: ts(-6, '17:30'), checkout_at: ts(-6, '18:10'), tasks_completed: ['Kvällsbesök', 'Medicin'], staff_notes: 'Lite trött ikväll. Gick och lade sig tidigt.', ai_summary: null, mood_emoji: 'neutral', created_at: ts(-6, '17:30') },
  // -5
  { id: 'v-5a', schedule_id: 's-5a', brukare_id: 'mock-brukare-1', staff_name: 'Maria K.', checkin_at: ts(-5, '08:00'), checkout_at: ts(-5, '08:40'), tasks_completed: ['Frukost', 'Medicin'], staff_notes: 'Bra morgon. Fatimah hade bakat bröd!', ai_summary: null, mood_emoji: 'happy', created_at: ts(-5, '08:00') },
  { id: 'v-5b', schedule_id: 's-5b', brukare_id: 'mock-brukare-1', staff_name: 'Johan M.', checkin_at: ts(-5, '12:00'), checkout_at: ts(-5, '12:45'), tasks_completed: ['Städning'], staff_notes: 'Städade kök och badrum.', ai_summary: null, mood_emoji: 'neutral', created_at: ts(-5, '12:00') },
  { id: 'v-5c', schedule_id: 's-5c', brukare_id: 'mock-brukare-1', staff_name: 'Erik S.', checkin_at: ts(-5, '17:30'), checkout_at: ts(-5, '18:10'), tasks_completed: ['Kvällsbesök', 'Medicin'], staff_notes: null, ai_summary: null, mood_emoji: 'happy', created_at: ts(-5, '17:30') },
  // -4
  { id: 'v-4a', schedule_id: 's-4a', brukare_id: 'mock-brukare-1', staff_name: 'Anna L.', checkin_at: ts(-4, '07:55'), checkout_at: ts(-4, '08:38'), tasks_completed: ['Frukost', 'Medicin'], staff_notes: 'Fatimah saknade sin dotter idag. Lite ledsen.', ai_summary: null, mood_emoji: 'sad', created_at: ts(-4, '07:55') },
  { id: 'v-4b', schedule_id: 's-4b', brukare_id: 'mock-brukare-1', staff_name: 'Sara B.', checkin_at: ts(-4, '17:28'), checkout_at: ts(-4, '18:20'), tasks_completed: ['Kvällsbesök', 'Medicin', 'Tvätt'], staff_notes: 'Hjälpte med tvätt. Fatimah piggnade till efter middag.', ai_summary: null, mood_emoji: 'neutral', created_at: ts(-4, '17:28') },
  // -3
  { id: 'v-3a', schedule_id: 's-3a', brukare_id: 'mock-brukare-1', staff_name: 'Erik S.', checkin_at: ts(-3, '08:05'), checkout_at: ts(-3, '08:55'), tasks_completed: ['Frukost', 'Dusch', 'Medicin'], staff_notes: 'Dusch + frukost. Fatimah var på bra humör, berättade om Teheran.', ai_summary: null, mood_emoji: 'happy', created_at: ts(-3, '08:05') },
  { id: 'v-3b', schedule_id: 's-3b', brukare_id: 'mock-brukare-1', staff_name: 'Maria K.', checkin_at: ts(-3, '12:00'), checkout_at: ts(-3, '12:35'), tasks_completed: ['Medicin', 'Promenad'], staff_notes: 'Fin promenad. Fatimah plockade blommor.', ai_summary: null, mood_emoji: 'happy', created_at: ts(-3, '12:00') },
  // -3 evening was cancelled
  // -2
  { id: 'v-2a', schedule_id: 's-2a', brukare_id: 'mock-brukare-1', staff_name: 'Sara B.', checkin_at: ts(-2, '08:00'), checkout_at: ts(-2, '08:42'), tasks_completed: ['Frukost', 'Medicin'], staff_notes: 'Allt som vanligt. Drack två koppar te.', ai_summary: null, mood_emoji: 'happy', created_at: ts(-2, '08:00') },
  { id: 'v-2b', schedule_id: 's-2b', brukare_id: 'mock-brukare-1', staff_name: 'Johan M.', checkin_at: ts(-2, '12:10'), checkout_at: ts(-2, '12:35'), tasks_completed: ['Medicin', 'Promenad'], staff_notes: 'Kort promenad, det regnade.', ai_summary: null, mood_emoji: 'neutral', created_at: ts(-2, '12:10') },
  { id: 'v-2c', schedule_id: 's-2c', brukare_id: 'mock-brukare-1', staff_name: 'Anna L.', checkin_at: ts(-2, '17:32'), checkout_at: ts(-2, '18:15'), tasks_completed: ['Kvällsbesök', 'Medicin'], staff_notes: 'Fatimah ringde Dena under besöket. Glad efteråt.', ai_summary: null, mood_emoji: 'happy', created_at: ts(-2, '17:32') },
  // -1 (yesterday)
  { id: 'v-1a', schedule_id: 's-1a', brukare_id: 'mock-brukare-1', staff_name: 'Maria K.', checkin_at: ts(-1, '08:00'), checkout_at: ts(-1, '08:40'), tasks_completed: ['Frukost', 'Medicin'], staff_notes: 'Bra morgon. Fatimah ville ha ägg idag.', ai_summary: null, mood_emoji: 'happy', created_at: ts(-1, '08:00') },
  { id: 'v-1b', schedule_id: 's-1b', brukare_id: 'mock-brukare-1', staff_name: 'Erik S.', checkin_at: ts(-1, '12:22'), checkout_at: ts(-1, '12:45'), tasks_completed: ['Medicin'], staff_notes: 'Försenad pga trafik. Fatimah förstod.', ai_summary: null, mood_emoji: 'neutral', created_at: ts(-1, '12:22') },
  { id: 'v-1c', schedule_id: 's-1c', brukare_id: 'mock-brukare-1', staff_name: 'Sara B.', checkin_at: ts(-1, '17:30'), checkout_at: ts(-1, '18:10'), tasks_completed: ['Kvällsbesök', 'Medicin'], staff_notes: 'Fin kväll. Tittade på persisk film tillsammans.', ai_summary: null, mood_emoji: 'happy', created_at: ts(-1, '17:30') },
  // TODAY (morning completed)
  { id: 'v-0a', schedule_id: 's-0a', brukare_id: 'mock-brukare-1', staff_name: 'Anna L.', checkin_at: ts(0, '07:58'), checkout_at: ts(0, '08:42'), tasks_completed: ['Frukost', 'Medicin'], staff_notes: 'Fatimah var glad idag. Åt bra frukost.', ai_summary: null, mood_emoji: 'happy', created_at: ts(0, '07:58') },
]

export function getSchedulesForDate(date: string): Schedule[] {
  return MOCK_SCHEDULES.filter(s => s.date === date)
}

export function getVisitsForDate(date: string): Visit[] {
  return MOCK_VISITS.filter(v => v.created_at.startsWith(date))
}

export function getWeekSchedules(startOffset: number, endOffset: number): Schedule[] {
  const dates = new Set<string>()
  for (let i = startOffset; i <= endOffset; i++) dates.add(dateStr(i))
  return MOCK_SCHEDULES.filter(s => dates.has(s.date))
}

export function getWeekVisits(startOffset: number, endOffset: number): Visit[] {
  const dates = new Set<string>()
  for (let i = startOffset; i <= endOffset; i++) dates.add(dateStr(i))
  return MOCK_VISITS.filter(v => {
    const vDate = v.created_at.split('T')[0]
    return dates.has(vDate)
  })
}
