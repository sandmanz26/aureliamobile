// Personas (U096): 300 synthetic people, generated from a fixed seed, as
// candidates for AI-run research (role-play interviews, concept tests, copy
// and pricing checks) before real users are asked. None of them is real.
// They are generated, not written one by one, so the mix can be described,
// tested and reproduced exactly; the rules below keep each one coherent
// (age fits life stage, work and household; goal fits struggle, triggers and
// the user-journey moments they would hit).

export type GoalId = 'sleep' | 'calm' | 'clarity' | 'focus' | 'regulate' | 'energy'
export type Gender = 'woman' | 'man' | 'non-binary'
export type WorkPattern = 'office' | 'hybrid' | 'remote' | 'shift' | 'self-employed' | 'student' | 'caregiver' | 'between jobs' | 'retired'
export type Experience = 'never' | 'tried and stopped' | 'occasional' | 'daily'
export type AiAttitude = 'enthusiastic' | 'curious' | 'skeptical' | 'distrustful'

export interface Persona {
  id: string
  name: string
  age: number
  ageBand: string
  gender: Gender
  country: string
  city: string
  region: string
  /** First language; every persona can read English unless flagged. */
  language: string
  workPattern: WorkPattern
  occupation: string
  household: string
  income: 'low' | 'middle' | 'high'
  goal: GoalId
  struggle: string
  triggers: string[]
  /** User journey moment ids (admin → User journey) this person would hit. */
  moments: string[]
  experience: Experience
  apps: string[]
  wearable: string
  length: 5 | 10 | 20
  voice: 'female' | 'male' | 'none'
  sound: 'nature' | 'music' | 'frequencies' | 'silence'
  spiritual: 'welcome' | 'neutral' | 'avoid'
  techComfort: 'low' | 'medium' | 'high'
  aiAttitude: AiAttitude
  willingnessToPay: string
  privacy: 'relaxed' | 'careful' | 'very protective'
  barriers: string[]
  /** Circumstances worth testing for: accessibility, health, life events. */
  flags: string[]
  quote: string
}

export const SEED = 2026
export const PERSONA_COUNT = 300

export const GOAL_LABEL: Record<GoalId, string> = {
  sleep: 'Sleep better',
  calm: 'Feel calmer',
  clarity: 'Clear my mind',
  focus: 'Focus',
  regulate: 'Regulate my body',
  energy: 'More energy',
}

/** mulberry32: small, fast, and the same sequence on every machine. */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Rand = () => number
const pick = <T,>(r: Rand, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)]
function weighted<T>(r: Rand, xs: readonly (readonly [T, number])[]): T {
  const total = xs.reduce((n, [, w]) => n + w, 0)
  let x = r() * total
  for (const [v, w] of xs) {
    x -= w
    if (x < 0) return v
  }
  return xs[xs.length - 1][0]
}
function some<T>(r: Rand, xs: readonly T[], min: number, max: number): T[] {
  const n = min + Math.floor(r() * (max - min + 1))
  const pool = [...xs]
  const out: T[] = []
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0])
  return out
}

interface Place {
  country: string
  region: string
  language: string
  weight: number
  cities: string[]
  women: string[]
  men: string[]
  neutral: string[]
  last: string[]
}

const PLACES: Place[] = [
  { country: 'United States', region: 'North America', language: 'English', weight: 16, cities: ['Austin', 'Chicago', 'Denver', 'Portland', 'Atlanta', 'New York', 'San Diego', 'Columbus'], women: ['Emily', 'Jasmine', 'Megan', 'Rachel', 'Tanya', 'Lauren', 'Destiny'], men: ['Jason', 'Marcus', 'Tyler', 'Andre', 'Kevin', 'Ryan', 'Luis'], neutral: ['Jordan', 'Riley', 'Casey'], last: ['Miller', 'Johnson', 'Nguyen', 'Garcia', 'Brooks', 'Patel', 'Walker', 'Kim'] },
  { country: 'United Kingdom', region: 'Europe', language: 'English', weight: 9, cities: ['London', 'Manchester', 'Bristol', 'Leeds', 'Glasgow', 'Brighton'], women: ['Sophie', 'Amira', 'Hannah', 'Chloe', 'Priya'], men: ['Oliver', 'Callum', 'Tom', 'Jamal', 'Harry'], neutral: ['Alex', 'Robin'], last: ['Smith', 'Hughes', 'Ali', 'Taylor', 'Evans', 'Shah', 'Murphy'] },
  { country: 'Spain', region: 'Europe', language: 'Spanish', weight: 7, cities: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga', 'Bilbao'], women: ['Lucía', 'María', 'Carmen', 'Paula', 'Elena'], men: ['Javier', 'Pablo', 'Sergio', 'Diego', 'Álvaro'], neutral: ['Ari'], last: ['García', 'Martínez', 'López', 'Sánchez', 'Romero', 'Navarro'] },
  { country: 'Indonesia', region: 'Asia', language: 'Indonesian', weight: 10, cities: ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Denpasar', 'Medan'], women: ['Ayu', 'Dewi', 'Putri', 'Rina', 'Sari', 'Nadia'], men: ['Budi', 'Rizky', 'Andi', 'Fajar', 'Dimas', 'Reza'], neutral: ['Kai'], last: ['Santoso', 'Wijaya', 'Pratama', 'Hidayat', 'Saputra', 'Lestari'] },
  { country: 'Australia', region: 'Oceania', language: 'English', weight: 6, cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'], women: ['Chloe', 'Mia', 'Grace', 'Leila'], men: ['Jack', 'Liam', 'Noah', 'Tariq'], neutral: ['Sam'], last: ['Wilson', 'Thompson', 'Nguyen', 'Brown', 'Singh'] },
  { country: 'Germany', region: 'Europe', language: 'German', weight: 6, cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Leipzig'], women: ['Lena', 'Anna', 'Sarah', 'Elif'], men: ['Lukas', 'Jonas', 'Felix', 'Can'], neutral: ['Kim'], last: ['Müller', 'Schmidt', 'Weber', 'Yılmaz', 'Wagner'] },
  { country: 'Netherlands', region: 'Europe', language: 'Dutch', weight: 4, cities: ['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven'], women: ['Sanne', 'Fleur', 'Noor'], men: ['Daan', 'Bram', 'Youssef'], neutral: ['Sem'], last: ['de Vries', 'Jansen', 'Bakker', 'El Amrani'] },
  { country: 'India', region: 'Asia', language: 'Hindi', weight: 8, cities: ['Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'], women: ['Ananya', 'Priya', 'Kavya', 'Meera', 'Sneha'], men: ['Arjun', 'Rohan', 'Vikram', 'Aditya', 'Karan'], neutral: ['Ari'], last: ['Sharma', 'Iyer', 'Reddy', 'Kapoor', 'Menon', 'Das'] },
  { country: 'Singapore', region: 'Asia', language: 'English', weight: 3, cities: ['Singapore'], women: ['Wei Ling', 'Shalini', 'Nur'], men: ['Jun Jie', 'Arun', 'Hafiz'], neutral: ['Ash'], last: ['Tan', 'Lim', 'Wong', 'Rahman', 'Pillai'] },
  { country: 'Brazil', region: 'South America', language: 'Portuguese', weight: 5, cities: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Recife'], women: ['Ana', 'Beatriz', 'Juliana', 'Camila'], men: ['Lucas', 'Gabriel', 'Rafael', 'Thiago'], neutral: ['Dani'], last: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa'] },
  { country: 'Mexico', region: 'North America', language: 'Spanish', weight: 4, cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla'], women: ['Valeria', 'Fernanda', 'Ximena'], men: ['Santiago', 'Emiliano', 'Jorge'], neutral: ['Alex'], last: ['Hernández', 'Ramírez', 'Torres', 'Flores'] },
  { country: 'Canada', region: 'North America', language: 'English', weight: 5, cities: ['Toronto', 'Vancouver', 'Montréal', 'Calgary', 'Ottawa'], women: ['Olivia', 'Émilie', 'Harleen', 'Zoe'], men: ['Ethan', 'Mathieu', 'Gurpreet', 'Owen'], neutral: ['Quinn'], last: ['Tremblay', 'Chen', 'MacDonald', 'Gill', 'Roy'] },
  { country: 'Japan', region: 'Asia', language: 'Japanese', weight: 3, cities: ['Tokyo', 'Osaka', 'Fukuoka', 'Sapporo'], women: ['Yui', 'Haruka', 'Aoi'], men: ['Haruto', 'Ren', 'Kenji'], neutral: ['Hikaru'], last: ['Sato', 'Suzuki', 'Takahashi', 'Ito'] },
  { country: 'Nigeria', region: 'Africa', language: 'English', weight: 3, cities: ['Lagos', 'Abuja', 'Ibadan'], women: ['Chiamaka', 'Aisha', 'Funmi'], men: ['Tunde', 'Emeka', 'Ibrahim'], neutral: ['Tobi'], last: ['Okafor', 'Adeyemi', 'Bello', 'Eze'] },
  { country: 'South Africa', region: 'Africa', language: 'English', weight: 3, cities: ['Cape Town', 'Johannesburg', 'Durban'], women: ['Thandiwe', 'Lerato', 'Megan'], men: ['Sipho', 'Pieter', 'Kagiso'], neutral: ['Jesse'], last: ['Nkosi', 'van der Merwe', 'Dlamini', 'Naidoo'] },
  { country: 'Philippines', region: 'Asia', language: 'Filipino', weight: 3, cities: ['Manila', 'Cebu', 'Davao'], women: ['Andrea', 'Kristine', 'Bea'], men: ['Paolo', 'Miguel', 'Carlo'], neutral: ['Jay'], last: ['Reyes', 'Santos', 'Cruz', 'Bautista'] },
  { country: 'France', region: 'Europe', language: 'French', weight: 3, cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse'], women: ['Camille', 'Inès', 'Manon'], men: ['Hugo', 'Karim', 'Léo'], neutral: ['Charlie'], last: ['Martin', 'Bernard', 'Benali', 'Durand'] },
]

const OCCUPATIONS: Record<WorkPattern, string[]> = {
  office: ['Accountant', 'Marketing manager', 'HR business partner', 'Bank analyst', 'Project manager', 'Lawyer', 'Sales lead', 'Civil servant'],
  hybrid: ['Software engineer', 'Product designer', 'Consultant', 'Data analyst', 'Architect', 'Account manager', 'Researcher'],
  remote: ['Customer support agent', 'Copywriter', 'Developer', 'Virtual assistant', 'Translator', 'UX researcher'],
  shift: ['Nurse', 'Paramedic', 'Warehouse supervisor', 'Chef', 'Retail manager', 'Hotel night manager', 'Factory technician', 'Airline cabin crew'],
  'self-employed': ['Freelance photographer', 'Café owner', 'Yoga teacher', 'Ride-hailing driver', 'Personal trainer', 'Online shop owner', 'Hairdresser'],
  student: ['University student', 'Medical student', 'Graduate student', 'Design student'],
  caregiver: ['Full-time parent', 'Carer for a parent', 'Parent on leave'],
  'between jobs': ['Looking for work', 'Career break', 'Recently laid off'],
  retired: ['Retired teacher', 'Retired engineer', 'Retired nurse', 'Retired shop owner'],
}

const STRUGGLES: Record<GoalId, string[]> = {
  sleep: ['lies awake replaying the day', 'wakes at 3am and cannot get back to sleep', 'scrolls the phone in bed for an hour', 'shift work has broken their sleep rhythm', 'sleeps lightly since the baby arrived', 'falls asleep fine but wakes up tired'],
  calm: ['feels a constant low hum of anxiety', 'gets tense before meetings and calls', 'snaps at family after long days', 'worries about money most evenings', 'feels overwhelmed by news and notifications', 'has had panic attacks in crowded places'],
  clarity: ['has too many thoughts competing at once', 'cannot decide on a big life change', 'feels foggy after weeks of overwork', 'journals but goes round in circles', 'struggles to switch off from work', 'feels stuck and unsure what they want'],
  focus: ['jumps between tabs and never finishes', 'cannot study for more than ten minutes', 'gets pulled into the phone every few minutes', 'loses the afternoon to low concentration', 'finds it hard to start difficult tasks', 'is easily distracted in an open-plan office'],
  regulate: ['feels wired and tense in the body', 'heart races after stressful moments', 'carries tension in the jaw and shoulders', 'goes from calm to overwhelmed very fast', 'is recovering from burnout', 'gets headaches when stressed'],
  energy: ['feels flat and tired by mid-afternoon', 'struggles to get going in the morning', 'is drained after caring for others all day', 'has low motivation since a hard year', 'relies on coffee to get through the day', 'feels heavy and unmotivated in winter'],
}

const TRIGGERS: Record<GoalId, string[]> = {
  sleep: ['lying in bed awake', 'after a late screen session', 'the night before something big', 'waking up in the night'],
  calm: ['before a difficult conversation', 'a crowded commute', 'an email from the boss', 'a busy morning with kids'],
  clarity: ['a big decision', 'Sunday evening', 'after a long meeting day', 'a messy to-do list'],
  focus: ['the start of a work block', 'exam season', 'after lunch', 'a deadline tomorrow'],
  regulate: ['right after a tense event', 'a racing heart', 'end of a long shift', 'feeling overwhelmed suddenly'],
  energy: ['the 3pm slump', 'a slow morning', 'after a poor night', 'grey winter days'],
}

/** User journey moment ids (src/admin/data/userJourney.ts). */
const GOAL_MOMENTS: Record<GoalId, string[]> = {
  sleep: ['e5', 'r1'],
  calm: ['r2', 'e2'],
  clarity: ['c1', 'c2'],
  focus: ['c2', 'e1'],
  regulate: ['r2', 'e3'],
  energy: ['e1', 'r1'],
}

const BARRIERS = [
  'forgets to open the app',
  'does not trust AI with feelings',
  'finds most meditation voices irritating',
  'cannot find ten quiet minutes',
  'thinks wellness apps are too expensive',
  'gave up on apps that nag with notifications',
  'dislikes spiritual language',
  'worries about data privacy',
  'feels guilty when a streak breaks',
  'too much choice in other apps',
  'prefers to talk to a real person',
  'not sure it would work for them',
]

const FLAGS = [
  'low vision, uses large text',
  'hard of hearing',
  'ADHD',
  'autistic, sensitive to sound',
  'chronic pain',
  'pregnant',
  'recent bereavement',
  'recovering from burnout',
  'sees a therapist',
  'reads English as a second language',
  'night shift worker',
  'new parent',
  'menopause symptoms',
  'long COVID fatigue',
]

const QUOTES: Record<GoalId, string[]> = {
  sleep: ['I just want my brain to stop talking when the lights go off.', 'I have tried every sleep app. I need one that knows my nights are not normal.', 'If it can get me back to sleep at 3am, I will pay for it.'],
  calm: ['I do not need to be zen. I need to get through Tuesday.', 'Give me something for the five minutes before a hard call.', 'I want to feel less on edge without making it a whole project.'],
  clarity: ['My head is a browser with forty tabs open.', 'I want to hear myself think again.', 'Help me sort out what actually matters this week.'],
  focus: ['I sit down to work and somehow it is an hour later.', 'Something short that gets me started is all I need.', 'I want to finish one thing before I start the next.'],
  regulate: ['My body is still in fight mode long after the stress is gone.', 'I need my shoulders to come down from my ears.', 'When it hits, I need something that works in two minutes.'],
  energy: ['By three o’clock I am running on fumes.', 'I want to wake up and actually feel awake.', 'I give energy to everyone else all day. I want some back.'],
}

function ageBand(age: number) {
  return age < 25 ? '18–24' : age < 35 ? '25–34' : age < 45 ? '35–44' : age < 55 ? '45–54' : age < 65 ? '55–64' : '65+'
}

function makePersona(r: Rand, n: number): Persona {
  const place = weighted(r, PLACES.map((p) => [p, p.weight] as const))
  const gender = weighted<Gender>(r, [['woman', 52], ['man', 44], ['non-binary', 4]])
  const first = pick(r, gender === 'woman' ? place.women : gender === 'man' ? place.men : place.neutral)
  const age = Math.round(weighted(r, [[21, 12], [29, 24], [38, 24], [48, 17], [58, 13], [70, 10]] as const) + (r() - 0.5) * 8)
  const clamped = Math.min(82, Math.max(18, age))

  const workPattern: WorkPattern =
    clamped < 23
      ? weighted(r, [['student', 70], ['shift', 15], ['remote', 15]])
      : clamped >= 66
        ? weighted(r, [['retired', 80], ['caregiver', 10], ['self-employed', 10]])
        : weighted(r, [['office', 20], ['hybrid', 22], ['remote', 12], ['shift', 14], ['self-employed', 12], ['student', clamped < 30 ? 8 : clamped < 40 ? 1 : 0], ['caregiver', 7], ['between jobs', 5], ['retired', clamped > 58 ? 10 : 0]])
  const household =
    clamped < 26
      ? pick(r, ['lives with parents', 'flatmates', 'lives alone', 'with a partner'])
      : clamped >= 66
        ? pick(r, ['with a partner', 'lives alone', 'lives with adult children'])
        : workPattern === 'caregiver'
          ? pick(r, ['partner and young kids', 'single parent', 'cares for a parent at home'])
          : pick(r, ['lives alone', 'with a partner', 'partner and young kids', 'partner and teenagers', 'single parent', 'flatmates', 'cares for a parent at home'])
  const income = workPattern === 'student' || workPattern === 'between jobs' ? weighted(r, [['low', 80], ['middle', 20]] as const) : weighted(r, [['low', 25], ['middle', 50], ['high', 25]] as const)

  const goal = weighted<GoalId>(r, [['sleep', 25], ['calm', 22], ['focus', 15], ['clarity', 12], ['regulate', 14], ['energy', 12]])
  const struggle = workPattern === 'shift' && goal === 'sleep' ? 'shift work has broken their sleep rhythm' : pick(r, STRUGGLES[goal])
  const triggers = some(r, TRIGGERS[goal], 1, 2)

  const moments = new Set(GOAL_MOMENTS[goal])
  if (['office', 'hybrid', 'student'].includes(workPattern) && r() < 0.6) moments.add(r() < 0.5 ? 'c1' : 'e4')
  if (triggers.some((t) => t.includes('before'))) moments.add('e2')

  const experience = weighted<Experience>(r, [['never', 30], ['tried and stopped', 35], ['occasional', 23], ['daily', 12]])
  const appPool = ['Calm', 'Headspace', 'Insight Timer', 'Balance', 'YouTube videos', 'Spotify sleep playlists', 'BetterSleep']
  const apps = experience === 'never' ? [] : some(r, appPool, 1, experience === 'daily' ? 3 : 2)
  const aiAttitude = weighted<AiAttitude>(r, clamped >= 60 ? [['enthusiastic', 8], ['curious', 32], ['skeptical', 40], ['distrustful', 20]] : [['enthusiastic', 22], ['curious', 40], ['skeptical', 28], ['distrustful', 10]])
  if (experience === 'daily' && aiAttitude === 'enthusiastic' && r() < 0.7) moments.add('h1')

  const techComfort = clamped >= 65 ? weighted(r, [['low', 45], ['medium', 45], ['high', 10]] as const) : weighted(r, [['low', 10], ['medium', 45], ['high', 45]] as const)
  const wearable = income === 'high' ? pick(r, ['Apple Watch', 'Oura', 'Whoop', 'Garmin', 'none']) : weighted(r, [['none', 60], ['Apple Watch', 15], ['Fitbit', 15], ['Garmin', 10]] as const)

  const flags: string[] = []
  if (r() < 0.32) flags.push(pick(r, FLAGS))
  if (workPattern === 'shift' && r() < 0.5 && !flags.includes('night shift worker')) flags.push('night shift worker')
  if (place.language !== 'English' && r() < 0.35 && !flags.includes('reads English as a second language')) flags.push('reads English as a second language')

  const barriers = some(r, BARRIERS, 1, 2)
  if (aiAttitude === 'distrustful' && !barriers.includes('does not trust AI with feelings')) barriers[0] = 'does not trust AI with feelings'

  return {
    id: `P${String(n).padStart(3, '0')}`,
    name: `${first} ${pick(r, place.last)}`,
    age: clamped,
    ageBand: ageBand(clamped),
    gender,
    country: place.country,
    city: pick(r, place.cities),
    region: place.region,
    language: place.language,
    workPattern,
    occupation: pick(r, OCCUPATIONS[workPattern]),
    household,
    income,
    goal,
    struggle,
    triggers,
    moments: [...moments],
    experience,
    apps,
    wearable,
    length: goal === 'sleep' ? weighted(r, [[10, 40], [20, 60]] as const) : weighted(r, [[5, 45], [10, 40], [20, 15]] as const),
    voice: weighted(r, [['female', 55], ['male', 30], ['none', 15]] as const),
    sound: goal === 'sleep' ? weighted(r, [['nature', 45], ['music', 25], ['frequencies', 15], ['silence', 15]] as const) : weighted(r, [['nature', 35], ['music', 30], ['frequencies', 10], ['silence', 25]] as const),
    spiritual: barriers.includes('dislikes spiritual language') ? 'avoid' : weighted(r, [['welcome', 25], ['neutral', 55], ['avoid', 20]] as const),
    techComfort,
    aiAttitude,
    willingnessToPay:
      income === 'low' ? weighted(r, [['free only', 70], ['up to $5 a month', 30]] as const) : weighted(r, [['free only', 25], ['up to $5 a month', 30], ['up to $10 a month', 30], ['more if it clearly works', 15]] as const),
    privacy: weighted(r, [['relaxed', 30], ['careful', 50], ['very protective', 20]] as const),
    barriers,
    flags,
    quote: pick(r, QUOTES[goal]),
  }
}

/** The 300 personas, identical on every machine and every build. */
export function generatePersonas(count = PERSONA_COUNT, seed = SEED): Persona[] {
  const r = rng(seed)
  return Array.from({ length: count }, (_, i) => makePersona(r, i + 1))
}

/**
 * A system prompt that lets a model answer as this person in an interview or
 * a concept test. It says plainly that the person is synthetic, so a run's
 * transcript can never be mistaken for a real user's words.
 */
export function personaPrompt(p: Persona): string {
  const lines = [
    `You are role-playing a synthetic research persona (${p.id}) for Aurelia, an app that turns one sentence about how you feel into a personal guided wellness session. You are not a real person, and your answers are hypotheses, not evidence.`,
    '',
    `Who you are: ${p.name}, ${p.age}, ${p.gender}, living in ${p.city}, ${p.country}. First language: ${p.language}. ${p.occupation} (${p.workPattern}); ${p.household}; ${p.income} income.`,
    `What you want: ${GOAL_LABEL[p.goal].toLowerCase()}. What is going on: ${p.name.split(' ')[0]} ${p.struggle}. It tends to hit: ${p.triggers.join('; ')}.`,
    `Experience: meditation ${p.experience}${p.apps.length ? `; you have used ${p.apps.join(', ')}` : '; no wellness apps so far'}. Wearable: ${p.wearable}.`,
    `Preferences: ${p.length}-minute sessions, ${p.voice === 'none' ? 'no voice' : `a ${p.voice} voice`}, ${p.sound}; spiritual language: ${p.spiritual}.`,
    `Attitudes: tech comfort ${p.techComfort}; towards AI you are ${p.aiAttitude}; privacy ${p.privacy}; you would pay ${p.willingnessToPay}.`,
    `What gets in your way: ${p.barriers.join('; ')}.${p.flags.length ? ` Also: ${p.flags.join('; ')}.` : ''}`,
    `In your own words: "${p.quote}"`,
    '',
    'Answer in the first person, briefly and concretely, as this person would. Be honest about doubts and say when something would not fit your life. Do not invent facts about Aurelia that you have not been shown.',
  ]
  return lines.join('\n')
}

/**
 * A research panel of `size` personas, balanced across goals (round-robin),
 * drawn reproducibly from `seed`, from the given pool (e.g. a filtered list).
 */
export function drawPanel(pool: Persona[], size: number, seed = 1): Persona[] {
  const r = rng(seed)
  const byGoal = new Map<GoalId, Persona[]>()
  for (const p of pool) byGoal.set(p.goal, [...(byGoal.get(p.goal) ?? []), p])
  for (const list of byGoal.values()) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1))
      ;[list[i], list[j]] = [list[j], list[i]]
    }
  }
  const queues = [...byGoal.values()]
  const out: Persona[] = []
  while (out.length < Math.min(size, pool.length)) {
    for (const q of queues) {
      const next = q.shift()
      if (next && out.length < size) out.push(next)
    }
  }
  return out
}

/** Counts of a field across personas, largest first. */
export function distribution<K extends keyof Persona>(ps: Persona[], key: K): [string, number][] {
  const m = new Map<string, number>()
  for (const p of ps) {
    const v = p[key]
    for (const x of Array.isArray(v) ? v : [v]) m.set(String(x), (m.get(String(x)) ?? 0) + 1)
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}
