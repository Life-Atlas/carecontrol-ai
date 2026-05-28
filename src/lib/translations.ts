type Translations = Record<string, Record<string, string>>

export const t: Translations = {
  // Greetings (time-aware)
  'greeting.morning': { sv: 'God morgon', fa: 'صبح بخیر', ar: 'صباح الخير', en: 'Good morning' },
  'greeting.afternoon': { sv: 'God eftermiddag', fa: 'عصر بخیر', ar: 'مساء الخير', en: 'Good afternoon' },
  'greeting.evening': { sv: 'God kväll', fa: 'عصر بخیر', ar: 'مساء الخير', en: 'Good evening' },

  // TodayView
  'today.nextVisit': { sv: 'Nästa besök', fa: 'ملاقات بعدی', ar: 'الزيارة القادمة', en: 'Next visit' },
  'today.laterToday': { sv: 'Senare idag', fa: 'بعداً امروز', ar: 'لاحقاً اليوم', en: 'Later today' },
  'today.allDone': { sv: 'Alla besök klara idag', fa: 'همه ملاقات‌های امروز تمام شد', ar: 'جميع الزيارات مكتملة اليوم', en: 'All visits done today' },
  'today.noSchedule': { sv: 'Inget schema inlagt än', fa: 'هنوز برنامه‌ای ثبت نشده', ar: 'لا يوجد جدول بعد', en: 'No schedule yet' },
  'today.ok': { sv: 'OK', fa: 'خوب', ar: 'حسناً', en: 'OK' },
  'today.help': { sv: 'Hjälp', fa: 'کمک', ar: 'مساعدة', en: 'Help' },
  'today.helpSent': { sv: 'Meddelande skickat!', fa: 'پیام ارسال شد!', ar: 'تم إرسال الرسالة!', en: 'Message sent!' },
  'today.listen': { sv: 'Lyssna', fa: 'گوش دادن', ar: 'استمع', en: 'Listen' },
  'today.wishes': { sv: 'Idag vill jag...', fa: '...امروز می‌خواهم', ar: '...اليوم أريد', en: 'Today I want to...' },

  // Status
  'status.here': { sv: 'Här nu', fa: 'الان اینجاست', ar: 'هنا الآن', en: 'Here now' },
  'status.delayed': { sv: 'Försenad', fa: 'تأخیر', ar: 'متأخر', en: 'Delayed' },
  'status.delayMsg': { sv: '{name} är på väg. Ungefär {min} minuter.', fa: '{name} در راه است. حدود {min} دقیقه.', ar: '{name} في الطريق. حوالي {min} دقيقة.', en: '{name} is on the way. About {min} minutes.' },
  'status.planned': { sv: 'Planerat', fa: 'برنامه‌ریزی شده', ar: 'مخطط', en: 'Planned' },
  'status.completed': { sv: 'Klar', fa: 'انجام شد', ar: 'مكتمل', en: 'Completed' },
  'status.cancelled': { sv: 'Inställd', fa: 'لغو شد', ar: 'ملغى', en: 'Cancelled' },

  // Tasks
  'task.Frukost': { sv: 'Frukost', fa: 'صبحانه', ar: 'فطور', en: 'Breakfast' },
  'task.Dusch': { sv: 'Dusch', fa: 'دوش', ar: 'استحمام', en: 'Shower' },
  'task.Medicin': { sv: 'Medicin', fa: 'دارو', ar: 'دواء', en: 'Medicine' },
  'task.Städning': { sv: 'Städning', fa: 'نظافت', ar: 'تنظيف', en: 'Cleaning' },
  'task.Promenad': { sv: 'Promenad', fa: 'پیاده‌روی', ar: 'نزهة', en: 'Walk' },
  'task.Kvällsbesök': { sv: 'Kvällsbesök', fa: 'ملاقات شب', ar: 'زيارة مسائية', en: 'Evening visit' },
  'task.Tvätt': { sv: 'Tvätt', fa: 'لباسشویی', ar: 'غسيل', en: 'Laundry' },
  'task.Annat': { sv: 'Annat', fa: 'دیگر', ar: 'أخرى', en: 'Other' },

  // Wishes
  'wish.shower': { sv: 'Duscha', fa: 'دوش گرفتن', ar: 'استحمام', en: 'Shower' },
  'wish.walk': { sv: 'Gå ut', fa: 'بیرون رفتن', ar: 'الخروج', en: 'Go out' },
  'wish.call': { sv: 'Ringa', fa: 'زنگ زدن', ar: 'اتصال', en: 'Call' },
  'wish.rest': { sv: 'Vila', fa: 'استراحت', ar: 'راحة', en: 'Rest' },

  // Dashboard (Dena)
  'dash.visits': { sv: 'Besök idag', fa: 'ملاقات‌های امروز', en: 'Visits today' },
  'dash.done': { sv: 'Klara', fa: 'انجام شده', en: 'Done' },
  'dash.remaining': { sv: 'Kvar', fa: 'باقی‌مانده', en: 'Remaining' },
  'dash.today': { sv: 'Idag', fa: 'امروز', en: 'Today' },
  'dash.recent': { sv: 'Senaste besök', fa: 'آخرین ملاقات‌ها', en: 'Recent visits' },
  'dash.continuity': { sv: 'Personal denna vecka', fa: 'پرسنل این هفته', en: 'Staff this week' },
  'dash.mood': { sv: 'Humör', fa: 'حال', en: 'Mood' },
  'dash.tomorrow': { sv: 'Imorgon', fa: 'فردا', en: 'Tomorrow' },

  // Nav
  'nav.home': { sv: 'Hem', fa: 'خانه', ar: 'الرئيسية', en: 'Home' },
  'nav.week': { sv: 'Veckan', fa: 'هفته', ar: 'الأسبوع', en: 'Week' },
  'nav.profile': { sv: 'Profil', fa: 'پروفایل', ar: 'الملف', en: 'Profile' },
  'nav.mamma': { sv: 'Mammas vy', fa: 'نمای مامان', ar: 'عرض ماما', en: "Mamma's view" },
}

export function tr(key: string, lang: string, vars?: Record<string, string>): string {
  const entry = t[key]
  if (!entry) return key
  let text = entry[lang] || entry['sv'] || key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v)
    }
  }
  return text
}

export function trTask(task: string, lang: string): string {
  return tr(`task.${task}`, lang) || task
}

export function getGreeting(lang: string): string {
  const h = new Date().getHours()
  if (h < 12) return tr('greeting.morning', lang)
  if (h < 17) return tr('greeting.afternoon', lang)
  return tr('greeting.evening', lang)
}

export function speakText(text: string, lang: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  const langMap: Record<string, string> = { sv: 'sv-SE', fa: 'fa-IR', ar: 'ar-SA', en: 'en-GB', so: 'so-SO', pl: 'pl-PL', es: 'es-ES' }
  utter.lang = langMap[lang] || 'sv-SE'
  utter.rate = 0.85
  utter.pitch = 1.0
  window.speechSynthesis.speak(utter)
}

export const STAFF_COLORS: Record<string, string> = {
  'Anna L.': '#00d4aa',
  'Maria K.': '#00b4d8',
  'Erik S.': '#f59e0b',
  'Sara B.': '#c084fc',
  'Johan M.': '#f87171',
  'Parisa': '#10b981',
}

export function getStaffColor(name: string): string {
  return STAFF_COLORS[name] || '#6b7394'
}

export function getStaffInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
