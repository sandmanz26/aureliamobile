// Personas (U096): 300 synthetic people, generated from a fixed seed, as
// candidates for AI-run research (role-play interviews, concept tests, copy
// and pricing checks) before real users are asked. None of them is real.
// They are generated, not written one by one, so the mix can be described,
// tested and reproduced exactly; the rules below keep each one coherent
// (age fits life stage, work and household; goal fits struggle, triggers and
// the user-journey moments they would hit).

import { incoherenceV4, type PersonaV4 } from './personasV4'

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
  /** The profile (U099): who this person is beyond the research fields. */
  profile: Profile
}

export type Level = 'low' | 'medium' | 'high'

export interface Profile {
  pronouns: string
  /** Three or four sentences, in the third person. */
  bio: string
  personality: { openness: Level; conscientiousness: Level; extraversion: Level; agreeableness: Level; neuroticism: Level }
  traits: string[]
  values: string[]
  /** A weekday, hour by hour. */
  day: { time: string; what: string }[]
  sleep: { bedtime: string; wake: string; hours: number; quality: 1 | 2 | 3 | 4 | 5 }
  stressors: string[]
  coping: string[]
  phone: string
  screenTimeHours: number
  topApps: string[]
  /** What happened with wellness apps before. */
  appHistory: string
  decides: string
  wouldHearAbout: string
  dealBreakers: string[]
  success: string
  quotes: string[]
  /** For buyer tests and QA (U100). */
  testing: Testing
}

export interface Scenario {
  id: string
  title: string
  /** The situation: when and where. */
  when: string
  /** What the person does in Aurelia. */
  does: string
  /** What Aurelia should do; the pass condition. */
  expect: string
}

export interface Testing {
  /** "When …, I want …, so I can …" */
  jobs: string[]
  /** How much it hurts today, 1–10. */
  pain: number
  /** What they would type into Aurelia's first box, in their words. */
  firstSentence: string
  spendNow: string
  alternatives: string[]
  buyTriggers: string[]
  /** Objections in the words they would use. */
  objections: string[]
  accessibility: string[]
  connectivity: string
  scenarios: Scenario[]
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

const TRAITS = ['practical', 'warm', 'guarded', 'funny', 'restless', 'thoughtful', 'organised', 'impatient', 'curious', 'private', 'driven', 'gentle', 'sceptical', 'sociable', 'quiet', 'perfectionist', 'easy-going', 'anxious', 'loyal', 'blunt']
const VALUES = ['family', 'independence', 'faith', 'achievement', 'health', 'security', 'creativity', 'community', 'fairness', 'freedom', 'learning', 'calm']
const STRESSORS = ['money and rising costs', 'workload and long hours', 'a strained relationship', 'caring for someone', 'health worries', 'exams and grades', 'job insecurity', 'loneliness', 'a long commute', 'news and social media', 'a noisy home', 'being the one everyone relies on']
const COPING = ['scrolling the phone', 'a glass of wine in the evening', 'running', 'prayer', 'calling a friend', 'nothing in particular', 'music on headphones', 'video games', 'journaling now and then', 'seeing a therapist', 'long walks', 'binge-watching series', 'cleaning the house', 'smoking', 'the gym']
const CHANNELS = ['a friend’s recommendation', 'a TikTok or Reels video', 'their therapist', 'their employer’s wellbeing programme', 'a podcast ad', 'searching the App Store at night', 'a newsletter they read', 'their partner']
const DECIDES = ['tries the free version first and decides within a day', 'reads every review before installing anything', 'asks one trusted friend', 'follows what a creator they like uses', 'compares three options in a spreadsheet', 'installs on impulse and deletes just as fast']
const DEAL_BREAKERS = ['being asked to pay before trying', 'a voice that sounds fake or salesy', 'notifications every day', 'having to create an account first', 'anything that feels like therapy talk', 'ads', 'sessions that run longer than promised', 'sharing data with third parties', 'religious or spiritual framing', 'a cluttered home screen']
const SUCCESS: Record<GoalId, string[]> = {
  sleep: ['asleep within twenty minutes most nights', 'not dreading bedtime any more', 'waking up without the 3am spiral'],
  calm: ['getting through a hard meeting without the racing chest', 'not snapping at the kids by Friday', 'a week where the worry stays in the background'],
  clarity: ['knowing what to do first on a Monday', 'making the decision and sleeping on it calmly', 'a head that feels quieter by the evening'],
  focus: ['two real hours of work before lunch', 'finishing one thing before starting the next', 'getting through a chapter without reaching for the phone'],
  regulate: ['coming down from a stressful moment in minutes, not hours', 'shoulders that are not up by the ears at night', 'fewer headaches in a month'],
  energy: ['no 3pm crash on most days', 'waking up and getting going without three coffees', 'having something left for the evening'],
}
const EXTRA_QUOTES = {
  ai: {
    enthusiastic: ['If it actually learns what works for me, I am all in.'],
    curious: ['I would try it. I just want to know it is not making things up.'],
    skeptical: ['An app that writes my meditation? Show me it works first.'],
    distrustful: ['I am not telling a machine how I feel. Who reads that?'],
  },
  money: {
    low: ['Every subscription is a choice between this and groceries.'],
    middle: ['I pay for things that earn their place. Most apps do not.'],
    high: ['Price is not the problem. Wasting my time is.'],
  },
} as const
const PHONES = { low: ['an older Android phone', 'a budget Android phone', 'a hand-me-down iPhone'], middle: ['a mid-range Android phone', 'an iPhone a few years old', 'a recent Samsung'], high: ['the latest iPhone', 'a new Pixel', 'a recent iPhone and an iPad'] } as const
const SOCIAL = ['WhatsApp', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'X', 'Reddit', 'LinkedIn', 'Spotify', 'Netflix', 'Telegram', 'Line']

const hhmm = (h: number, m = 0) => `${String(((h % 24) + 24) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`

function makeDay(r: Rand, work: WorkPattern, household: string, goal: GoalId, bed: number, wake: number, coping: string[], gen: Generator = 1): { time: string; what: string }[] {
  const kids = /kids|teenagers|single parent/.test(household)
  const start: Record<WorkPattern, string> = {
    office: 'commutes to the office',
    hybrid: 'office or home, depending on the day',
    remote: 'opens the laptop at the kitchen table',
    shift: 'starts a shift that changes every week',
    'self-employed': 'opens up and deals with whatever comes in',
    student: 'lectures, library, part-time job',
    caregiver: gen >= 2 && !kids ? 'appointments, meals and medication' : 'appointments, meals, the school run',
    'between jobs': 'applications and a lot of waiting',
    retired: 'a slow start, errands, a walk',
  }
  const lows: Record<GoalId, string> = {
    sleep: 'tired and running on caffeine',
    calm: 'a tense meeting or call, chest tight',
    clarity: 'ten things open at once, none finished',
    focus: 'the afternoon slips away into the phone',
    regulate: 'a stressful moment that stays in the body for hours',
    energy: 'the 3pm crash',
  }
  return [
    { time: hhmm(wake, pick(r, [0, 15, 30, 45])), what: kids ? 'up before everyone else, then breakfast and getting the kids out' : pick(r, ['phone first, then coffee', 'snoozes twice, then rushes', 'up slowly, tea and the news']) },
    { time: hhmm(wake + 2), what: start[work] },
    { time: work === 'shift' ? 'mid-shift' : '15:00', what: lows[goal] },
    { time: hhmm(bed - 3, 30), what: kids ? 'dinner, homework, bedtime routines' : `winds down with ${coping[0]}` },
    { time: hhmm(bed), what: goal === 'sleep' ? 'in bed, awake longer than they want to be' : 'in bed, phone in hand for a while' },
  ]
}

const FIRST_SENTENCE: Record<GoalId, string[]> = {
  sleep: ['cant sleep again, my mind wont stop', 'woke up at 3 and I am wide awake', 'I need to fall asleep, work at 7', 'too wired to sleep after my shift', 'help me switch off, I am in bed'],
  calm: ['big meeting in 20 min and my chest is tight', 'I feel anxious and I dont know why', 'everything is too loud today', 'I need to calm down before I call my mum', 'stressed about money again'],
  clarity: ['too many thoughts, I cannot think straight', 'I have to decide something big and I am stuck', 'my head is a mess after today', 'help me figure out what matters this week'],
  focus: ['I need to focus for the next hour', 'cant concentrate, exam tomorrow', 'I keep picking up my phone, help', 'need to start this report and I am procrastinating'],
  regulate: ['my heart is racing after that argument', 'I am shaking a bit, need to come down', 'my shoulders are up to my ears', 'still wound up hours after work'],
  energy: ['so tired, 3pm and I have hours left', 'no energy to get out of bed', 'I feel flat and heavy today', 'need a lift before the kids get home'],
}
const BUY_TRIGGERS = ['a free week that visibly helps', 'their therapist suggesting it', 'a price under $5 a month', 'a friend swearing by it', 'trying it without an account', 'an annual plan with a real discount', 'their employer paying for it', 'seeing their own sleep or mood improve in the app']
const OBJECTION_PHRASES: Record<string, string> = {
  'forgets to open the app': '"I will forget it exists by Thursday."',
  'does not trust AI with feelings': '"Who reads what I type into this?"',
  'finds most meditation voices irritating': '"If the voice is breathy and fake, I am out."',
  'cannot find ten quiet minutes': '"Ten minutes? I do not get ten minutes."',
  'thinks wellness apps are too expensive': '"Paying monthly to be told to breathe? No."',
  'gave up on apps that nag with notifications': '"One push too many and I delete it."',
  'dislikes spiritual language': '"Please, no chakras and no universe."',
  'worries about data privacy': '"Where does my data go?"',
  'feels guilty when a streak breaks': '"I do not need another thing to fail at."',
  'too much choice in other apps': '"I do not want to scroll a library, just tell me what to do."',
  'prefers to talk to a real person': '"A recording is not the same as a person."',
  'not sure it would work for them': '"This stuff never works for people like me."',
}

interface TestingInput {
  goal: GoalId; struggle: string; triggers: string[]; workPattern: WorkPattern; income: 'low' | 'middle' | 'high'; experience: Experience; apps: string[]; aiAttitude: AiAttitude
  flags: string[]; barriers: string[]; privacy: string; language: string; age: number; length: number; voice: string; spiritual: string; moments: string[]; coping: string[]
  success: string; neuroticism: Level; quality: number; country: string
}

const MOMENT_SITUATION: Record<string, string> = {
  r1: 'just woken up, still in bed',
  r2: 'mid-afternoon, a feeling has just spiked',
  c1: 'on the bus or train home',
  c2: 'a five-minute break between tasks',
  e1: 'first thing in the morning',
  e2: 'ten minutes before a meeting or a hard call',
  e3: 'right after a tense conversation',
  e4: 'commuting with headphones in',
  e5: 'in bed with the lights off',
  h1: 'on a good day, a few weeks in',
}

/** Turns a trigger into the opening of a job statement that reads naturally. */
export function whenPhrase(t: string): string {
  if (/^(before|after)\b/.test(t)) return `Right ${t}`
  if (/^right after\b/.test(t)) return t.charAt(0).toUpperCase() + t.slice(1)
  if (/^\w+ing\b/.test(t)) return `When I am ${t}`
  if (/^end of\b/.test(t)) return `At the ${t}`
  if (/season$/.test(t)) return `During ${t}`
  if (/days$|evening$/.test(t)) return `On ${t}`
  if (/^the night\b/.test(t)) return `On ${t}`
  if (/^the start\b/.test(t)) return `At ${t}`
  return `When I face ${t}`
}

function makeTesting(r: Rand, x: TestingInput): Testing {
  const esl = x.flags.includes('reads English as a second language') || (x.language !== 'English' && r() < 0.3)
  let first = pick(r, FIRST_SENTENCE[x.goal])
  if (x.age >= 60) first = first.charAt(0).toUpperCase() + first.slice(1).replace(/\bcant\b/, 'cannot').replace(/\bdont\b/, 'do not').replace(/\bwont\b/, 'will not') + '.'
  if (esl) first = first.replace('I am', 'I').replace('cannot', 'can not')
  const pain = Math.min(10, Math.max(2, Math.round((x.neuroticism === 'high' ? 7 : x.neuroticism === 'medium' ? 5.5 : 4) + (x.goal === 'sleep' ? 3 - x.quality * 0.6 : 0) + (r() - 0.5) * 2)))
  const spendNow =
    x.experience === 'daily' && x.income !== 'low' ? pick(r, ['about $10 a month on a meditation app', 'an annual Calm plan, about $70 a year', '$15 a month across two apps'])
      : x.coping.includes('seeing a therapist') ? 'pays for a therapist every two weeks; nothing on apps'
        : x.income === 'high' ? pick(r, ['nothing on apps, a gym membership', 'nothing yet, would spend on something that works'])
          : 'nothing'
  const alternatives = [...new Set([...(x.apps.length ? [x.apps[0]] : []), x.coping[0], pick(r, ['doing nothing and pushing through', 'a YouTube video found on the spot', 'a podcast', 'a long shower'])])]
  const objections = x.barriers.map((b) => OBJECTION_PHRASES[b] ?? `"${b}"`)
  if (x.income === 'low' && !objections.some((o) => o.includes('Paying'))) objections.push('"If it costs more than a coffee a month, forget it."')
  const accessibility = [
    ...x.flags.filter((f) => /vision|hearing|ADHD|autistic|second language/.test(f)).map((f) =>
      f.startsWith('low vision') ? 'large text, high contrast' : f.startsWith('hard of hearing') ? 'captions or a visual guide' : f === 'ADHD' ? 'very short sessions, no long intros' : f.startsWith('autistic') ? 'no sudden sounds, predictable structure' : 'plain English, short sentences'),
    ...(x.age >= 70 ? ['bigger tap targets'] : []),
  ]
  const connectivity = /Indonesia|India|Philippines|Nigeria|South Africa|Brazil|Mexico/.test(x.country) && r() < 0.6 ? 'patchy mobile data, often on a limited plan' : x.workPattern === 'shift' || x.moments.includes('c1') || x.moments.includes('e4') ? 'drops in and out on the commute' : 'reliable wifi at home'
  const soICan: Record<GoalId, string> = { sleep: 'wake up rested', calm: 'get through the day without snapping', clarity: 'know what to do next', focus: 'finish what I started', regulate: 'stop carrying the stress in my body', energy: 'have something left for the evening' }
  const saysGoal: Record<GoalId, string> = { sleep: 'fall asleep and stay asleep', calm: 'feel calmer quickly', clarity: 'clear my head', focus: 'focus on one thing', regulate: 'get my body to settle', energy: 'get some energy back' }
  const jobs = [
    `${whenPhrase(x.triggers[0])}, I want to ${saysGoal[x.goal]}, so I can ${soICan[x.goal]}.`,
    `When I open an app at that moment, I want it to work without setting anything up, so I do not give up before it starts.`,
  ]
  const top = x.moments[0]
  const scenarios: Scenario[] = [
    {
      id: 'first-open',
      title: 'First open, straight from the problem',
      when: MOMENT_SITUATION[top] ?? 'the moment it hits',
      does: `opens Aurelia for the first time and types "${first}"`,
      expect: 'A session starts within two taps, with no account and no paywall before the first play, and it fits the goal and their stated preferences.',
    },
    {
      id: 'moment',
      title: `The ${x.goal} moment, a week in`,
      when: MOMENT_SITUATION[x.moments[1] ?? top] ?? 'a usual day',
      does: 'comes back and taps the last session or asks for "the same as last time"',
      expect: '"Same as last time" works in one tap; the next chapter is offered after the session, not before.',
    },
  ]
  if (x.flags.includes('recent bereavement')) scenarios.push({ id: 'grief', title: 'Writes about a loss', when: 'late evening', does: 'types that they lost someone close recently', expect: 'A gentle, non-upbeat reply, no gamified prompts, and a "Need help now?" link visible.' })
  else if (x.aiAttitude === 'distrustful' || x.privacy === 'very protective') scenarios.push({ id: 'privacy', title: 'Asks who reads it', when: 'before typing anything personal', does: 'asks "who can read what I write?"', expect: 'A plain answer about what is stored and who sees it, before any personal data is kept; they can use it without an account.' })
  else if (accessibility.length) scenarios.push({ id: 'access', title: 'Uses it with their access needs', when: 'a normal day', does: `uses the app with: ${accessibility.join('; ')}`, expect: 'Everything is readable and operable; nothing important depends on sound alone or on fine taps.' })
  else if (x.barriers.includes('feels guilty when a streak breaks') || x.barriers.includes('forgets to open the app')) scenarios.push({ id: 'lapse', title: 'Misses four days', when: 'a busy week', does: 'opens the app again after four days away', expect: 'No guilt, no reset message; consistency is shown kindly and the next chapter is ready.' })
  else if (x.income === 'low') scenarios.push({ id: 'paywall', title: 'Hits the free limit', when: 'after the first build', does: 'reaches the end of what is free', expect: 'What is free and what is paid is clear; rewinding, resuming and replaying their own sessions stay free.' })
  else scenarios.push({ id: 'low-checkin', title: 'A bad check-in', when: 'after a session', does: 'answers the check-in with the lowest mood', expect: 'Care rather than a push to continue; a "Need help now?" link; the next chapter goes gentler.' })
  return { jobs, pain, firstSentence: first, spendNow, alternatives, buyTriggers: some(r, BUY_TRIGGERS, 2, 2), objections, accessibility, connectivity, scenarios }
}

/**
 * Generator versions (U103). 1 is the original; buyer agent runs v1 and v2
 * were played on it and stay pinned to it. 2 fixes what those runs found:
 * stressors, struggles and triggers that do not fit the person's life,
 * occupations that do not fit the age or household, income that does not
 * fit the job, and spending that contradicts willingness to pay.
 */
export type Generator = 1 | 2
export const CURRENT_GENERATOR: Generator = 2

const WORKING: WorkPattern[] = ['office', 'hybrid', 'remote', 'shift', 'self-employed']
const HIGH_PAY = ['HR business partner', 'Lawyer', 'Software engineer', 'Consultant', 'Architect', 'Bank analyst', 'Project manager', 'Product designer', 'Data analyst', 'Marketing manager']
const LOW_PAY = ['Customer support agent', 'Virtual assistant', 'Hairdresser', 'Ride-hailing driver', 'Airline cabin crew', 'Warehouse supervisor', 'Factory technician', 'Retail manager', 'Carer for a parent', 'Carer for a partner']

function fitsStruggle(s: string, work: WorkPattern, household: string, age: number) {
  const kids = /young kids|single parent/.test(household)
  if (s === 'sleeps lightly since the baby arrived') return kids && age >= 20 && age <= 45
  if (s === 'shift work has broken their sleep rhythm') return work === 'shift'
  if (s === 'cannot study for more than ten minutes') return work === 'student'
  if (s === 'is easily distracted in an open-plan office' || s === 'gets tense before meetings and calls') return work === 'office' || work === 'hybrid'
  if (s === 'feels foggy after weeks of overwork' || s === 'struggles to switch off from work') return WORKING.includes(work)
  if (s === 'snaps at family after long days') return !/alone|flatmates/.test(household)
  if (s === 'is drained after caring for others all day') return work === 'caregiver' || work === 'shift' || /kids|cares for|single parent/.test(household)
  return true
}

function fitsTrigger(t: string, work: WorkPattern, household: string) {
  if (t === 'an email from the boss' || t === 'after a long meeting day' || t === 'the start of a work block') return WORKING.includes(work) || work === 'student'
  if (t === 'a busy morning with kids') return /kids|single parent|teenagers/.test(household)
  if (t === 'end of a long shift') return work === 'shift'
  if (t === 'a crowded commute') return ['office', 'hybrid', 'shift', 'student'].includes(work)
  return true
}

function fitsStressor(x: string, work: WorkPattern) {
  if (x === 'workload and long hours') return work !== 'retired' && work !== 'between jobs'
  if (x === 'job insecurity') return WORKING.includes(work) || work === 'between jobs'
  if (x === 'a long commute') return ['office', 'hybrid', 'shift', 'student'].includes(work)
  return true
}

function ageBand(age: number) {
  return age < 25 ? '18–24' : age < 35 ? '25–34' : age < 45 ? '35–44' : age < 55 ? '45–54' : age < 65 ? '55–64' : '65+'
}

function makePersona(r: Rand, n: number, gen: Generator = 1): Persona {
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
    gen >= 2 && workPattern === 'student'
      ? pick(r, ['lives with parents', 'flatmates', 'lives alone', 'with a partner'])
      : clamped < 26
      ? pick(r, ['lives with parents', 'flatmates', 'lives alone', 'with a partner'])
      : clamped >= 66
        ? pick(r, ['with a partner', 'lives alone', 'lives with adult children'])
        : workPattern === 'caregiver'
          ? pick(r, ['partner and young kids', 'single parent', 'cares for a parent at home'])
          : weighted(r, [['lives alone', 20], ['with a partner', 22], ['partner and young kids', 22], ['partner and teenagers', 12], ['single parent', 9], ['flatmates', 10], ['cares for a parent at home', 5]] as const)
  let income = workPattern === 'student' || workPattern === 'between jobs' ? weighted(r, [['low', 80], ['middle', 20]] as const) : weighted(r, [['low', 25], ['middle', 50], ['high', 25]] as const)

  const goal = weighted<GoalId>(r, [['sleep', 25], ['calm', 22], ['focus', 15], ['clarity', 12], ['regulate', 14], ['energy', 12]])
  const strugglePool = gen >= 2 ? STRUGGLES[goal].filter((x) => fitsStruggle(x, workPattern, household, clamped)) : STRUGGLES[goal]
  const struggle = workPattern === 'shift' && goal === 'sleep' ? 'shift work has broken their sleep rhythm' : pick(r, strugglePool.length ? strugglePool : STRUGGLES[goal])
  const triggers = some(r, TRIGGERS[goal].filter((t) => (workPattern === 'student' || t !== 'exam season') && (gen < 2 || fitsTrigger(t, workPattern, household))), 1, 2)

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
  if (r() < 0.32) {
    const flagPool = gen >= 2 ? FLAGS.filter((f) => (f !== 'pregnant' || (gender === 'woman' && clamped <= 45)) && (f !== 'new parent' || (clamped <= 50 && household !== 'lives alone')) && (f !== 'menopause symptoms' || (gender === 'woman' && clamped >= 42 && clamped <= 60)) && (f !== 'night shift worker' || workPattern === 'shift')) : FLAGS
    flags.push(pick(r, flagPool))
  }
  if (workPattern === 'shift' && r() < 0.5 && !flags.includes('night shift worker')) flags.push('night shift worker')
  if (place.language !== 'English' && r() < 0.35 && !flags.includes('reads English as a second language')) flags.push('reads English as a second language')

  const barriers = some(r, BARRIERS, 1, 2)
  if (aiAttitude === 'distrustful' && !barriers.includes('does not trust AI with feelings')) barriers[0] = 'does not trust AI with feelings'

  const privacy = weighted(r, [['relaxed', 30], ['careful', 50], ['very protective', 20]] as const)
  const traits = some(r, TRAITS, 2, 3)
  const neuroticism: Level = ['calm', 'regulate', 'sleep'].includes(goal) ? weighted(r, [['medium', 45], ['high', 45], ['low', 10]] as const) : weighted(r, [['low', 30], ['medium', 50], ['high', 20]] as const)
  const personality = {
    openness: aiAttitude === 'enthusiastic' ? 'high' : aiAttitude === 'distrustful' ? 'low' : pick(r, ['low', 'medium', 'high'] as const),
    conscientiousness: pick(r, ['low', 'medium', 'high'] as const),
    extraversion: pick(r, ['low', 'medium', 'high'] as const),
    agreeableness: pick(r, ['medium', 'high', 'low'] as const),
    neuroticism,
  } as const
  const coping = some(r, COPING, 1, 2)
  const shift = workPattern === 'shift' || flags.includes('night shift worker')
  const bedHour = shift ? pick(r, [1, 2, 8]) : clamped >= 65 ? pick(r, [22, 23]) : pick(r, [22, 23, 0, 1])
  const wakeHour = shift && bedHour === 8 ? 15 : clamped >= 65 ? 6 : pick(r, [6, 6, 7, 7, 8])
  const hoursRaw = ((wakeHour - bedHour + 24) % 24) - (goal === 'sleep' ? 1.5 + r() : r() * 0.8)
  const hours = Math.max(4, Math.round(hoursRaw * 2) / 2)
  const quality = (goal === 'sleep' ? weighted(r, [[1, 30], [2, 50], [3, 20]] as const) : weighted(r, [[2, 20], [3, 50], [4, 25], [5, 5]] as const)) as 1 | 2 | 3 | 4 | 5
  const stressors = some(r, STRESSORS.filter((x) => (workPattern === 'student' || x !== 'exams and grades') && (gen < 2 || fitsStressor(x, workPattern))), 2, 3)
  if (workPattern === 'student' && !stressors.includes('exams and grades')) stressors[0] = 'exams and grades'
  if (household.includes('cares for') && !stressors.includes('caring for someone')) stressors[0] = 'caring for someone'
  const firstName = first
  const HOME: Record<string, string> = {
    'lives with parents': 'still lives with their parents',
    flatmates: 'shares a flat with two others',
    'lives alone': 'lives alone',
    'with a partner': 'lives with a partner',
    'partner and young kids': 'lives with a partner and two young children',
    'partner and teenagers': 'lives with a partner and two teenagers',
    'single parent': 'is raising a child alone',
    'cares for a parent at home': 'looks after an ageing parent at home',
    'lives with adult children': 'lives with a grown-up son and his family',
  }
  const home = (HOME[household] ?? household).replace('their parents', gender === 'woman' ? 'her parents' : gender === 'man' ? 'his parents' : 'their parents')
  const APP_PHRASE: Record<string, string> = { 'YouTube videos': 'meditation videos on YouTube', 'Spotify sleep playlists': 'sleep playlists on Spotify' }
  const appName = (x?: string) => (x ? APP_PHRASE[x] ?? x : 'an app')
  const pronouns = gender === 'woman' ? 'she/her' : gender === 'man' ? 'he/him' : 'they/them'
  const they = gender === 'woman' ? 'She' : gender === 'man' ? 'He' : 'They'
  const theyVerb = (v: string, plural: string) => (gender === 'non-binary' ? plural : v)
  const occupationText = OCCUPATIONS[workPattern]
  let occupationPick = pick(r, occupationText)
  if (gen >= 2 && workPattern === 'caregiver')
    occupationPick = household === 'cares for a parent at home' ? 'Carer for a parent' : clamped >= 60 ? 'Carer for a partner' : /kids|single parent/.test(household) ? (clamped < 45 ? occupationPick.replace('Carer for a parent', 'Full-time parent') : 'Full-time parent') : 'Carer for a partner'
  if (gen >= 2 && income === 'low' && clamped >= 28 && HIGH_PAY.includes(occupationPick)) income = 'middle'
  if (gen >= 2 && income === 'high' && LOW_PAY.includes(occupationPick)) income = 'middle'
  const appHistory =
    experience === 'never'
      ? 'Has never used a wellness app.'
      : experience === 'tried and stopped'
        ? `Tried ${appName(apps[0])} for ${pick(r, ['a week', 'about three weeks', 'two months'])} and stopped ${pick(r, ['when the free trial ended', 'after the reminders got annoying', 'because it all started to sound the same', 'when life got busy', 'after one session that felt too spiritual'])}.`
        : experience === 'occasional'
          ? `Turns to ${appName(apps[0])} ${pick(r, ['when things get bad', 'a couple of times a week', 'mostly at night'])}, with no routine.`
          : `Uses ${apps.map(appName).join(' and ')} almost every day, ${pick(r, ['for years', 'since a hard year', 'mainly for sleep'])}.`
  const occLower = /^[A-Z]{2}/.test(occupationPick) ? occupationPick : occupationPick.charAt(0).toLowerCase() + occupationPick.slice(1)
  const occLine = ['student', 'caregiver', 'between jobs', 'retired'].includes(workPattern)
    ? { student: `a ${occLower.replace(/ student$/, '')} student`.replace('a university university', 'a university'), caregiver: occLower.startsWith('carer') ? `a ${occLower}` : `a ${occLower}`, 'between jobs': occLower.toLowerCase().startsWith('looking') ? 'looking for work' : occLower.startsWith('recently') ? 'recently laid off' : 'on a career break', retired: occLower.replace(/^retired /, 'a retired ') }[workPattern as 'student']
    : `${/^(hr|[aeiou])/i.test(occLower) ? 'an' : 'a'} ${occLower}`
  const profile: Profile = {
    pronouns,
    bio: [
      `${firstName} is ${clamped}, ${occLine} in ${'%CITY%'}, ${place.country}, and ${theyVerb(home, home.replace(/^(\w+)s /, '$1 ').replace(/^is /, 'are '))}.`,
      `${they} ${theyVerb('describes', 'describe')} ${gender === 'woman' ? 'herself' : gender === 'man' ? 'himself' : 'themselves'} as ${traits.join(', ').replace(/, ([^,]*)$/, ' and $1')}, and ${theyVerb('cares', 'care')} most about ${some(r, VALUES, 2, 2).join(' and ')}.`,
      `Right now ${firstName} ${struggle}, mostly because of ${stressors[0]}.`,
      `${appHistory}`,
    ].join(' '),
    personality,
    traits,
    values: [],
    day: makeDay(r, workPattern, household, goal, bedHour, wakeHour, coping, gen),
    sleep: { bedtime: hhmm(bedHour), wake: hhmm(wakeHour), hours, quality },
    stressors,
    coping,
    phone: pick(r, PHONES[income]),
    screenTimeHours: Math.round((clamped < 30 ? 5 + r() * 4 : clamped < 55 ? 3 + r() * 3 : 1.5 + r() * 2.5) * 2) / 2,
    topApps: some(r, SOCIAL, 3, 4),
    appHistory,
    decides: pick(r, DECIDES),
    wouldHearAbout: pick(r, CHANNELS),
    dealBreakers: some(r, DEAL_BREAKERS, 1, 2),
    success: pick(r, SUCCESS[goal]),
    quotes: [],
    testing: undefined as unknown as Testing,
  }
  profile.values = (profile.bio.match(/most about (.+?) and (.+?)\./) ?? []).slice(1, 3)
  if (barriers.includes('dislikes spiritual language') && !profile.dealBreakers.includes('religious or spiritual framing')) profile.dealBreakers.push('religious or spiritual framing')
  const city = pick(r, place.cities)
  profile.bio = profile.bio.replace('%CITY%', city)
  profile.quotes = [pick(r, QUOTES[goal]), EXTRA_QUOTES.ai[aiAttitude][0], EXTRA_QUOTES.money[income][0]]
  profile.testing = makeTesting(r, {
    goal, struggle, triggers, workPattern, income, experience, apps, aiAttitude, flags, barriers, privacy, language: place.language, age: clamped,
    length: 0, voice: '', spiritual: '', moments: [...moments], coping, success: profile.success, neuroticism, quality, country: place.country,
  })

  const t = profile.testing
  const spendsMonthly = /\$1[05] a month|about \$10 a month/.test(t.spendNow)
  if (gen >= 2 && spendsMonthly && t.buyTriggers.includes('a price under $5 a month'))
    t.buyTriggers = t.buyTriggers.map((b) => (b === 'a price under $5 a month' ? (t.buyTriggers.includes('an annual plan with a real discount') ? 'a free week that visibly helps' : 'an annual plan with a real discount') : b))
  // Drawn in the same place as generator 1, so its random sequence is unchanged; only corrected after.
  const fixWtp = (w: string) =>
    gen >= 2 && spendsMonthly && (w === 'free only' || w === 'up to $5 a month') ? 'up to $10 a month' : gen >= 2 && /Calm plan/.test(t.spendNow) && w === 'free only' ? 'up to $5 a month' : w

  return {
    id: `P${String(n).padStart(3, '0')}`,
    name: `${first} ${pick(r, place.last)}`,
    age: clamped,
    ageBand: ageBand(clamped),
    gender,
    country: place.country,
    city,
    region: place.region,
    language: place.language,
    workPattern,
    occupation: occupationPick,
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
    willingnessToPay: fixWtp(
      income === 'low' ? weighted(r, [['free only', 70], ['up to $5 a month', 30]] as const) : weighted(r, [['free only', 25], ['up to $5 a month', 30], ['up to $10 a month', 30], ['more if it clearly works', 15]] as const),
    ),
    privacy,
    barriers,
    flags,
    quote: profile.quotes[0],
    profile,
  }
}

/** The 300 personas, identical on every machine and every build. */
export function generatePersonas(count = PERSONA_COUNT, seed = SEED, gen: Generator = CURRENT_GENERATOR): Persona[] {
  const r = rng(seed)
  return Array.from({ length: count }, (_, i) => makePersona(r, i + 1, gen))
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
    '',
    `Your story: ${p.profile.bio}`,
    `Personality: ${p.profile.traits.join(', ')}; openness ${p.profile.personality.openness}, conscientiousness ${p.profile.personality.conscientiousness}, extraversion ${p.profile.personality.extraversion}, agreeableness ${p.profile.personality.agreeableness}, neuroticism ${p.profile.personality.neuroticism}. You value ${p.profile.values.join(' and ')}.`,
    `A normal weekday: ${p.profile.day.map((d) => `${d.time} ${d.what}`).join('; ')}.`,
    `Sleep: bed around ${p.profile.sleep.bedtime}, up at ${p.profile.sleep.wake}, about ${p.profile.sleep.hours} hours, quality ${p.profile.sleep.quality} out of 5.`,
    `What weighs on you: ${p.profile.stressors.join('; ')}. How you cope now: ${p.profile.coping.join('; ')}.`,
    `Your phone: ${p.profile.phone}, about ${p.profile.screenTimeHours} hours a day, mostly ${p.profile.topApps.join(', ')}. ${p.profile.appHistory}`,
    `How you pick an app: you ${p.profile.decides}; you would most likely hear about Aurelia through ${p.profile.wouldHearAbout}. Deal breakers: ${p.profile.dealBreakers.join('; ')}.`,
    `Success for you looks like: ${p.profile.success}.`,
    `Things you might say: ${p.profile.quotes.map((q) => `"${q}"`).join(' ')}`,
    `If you opened Aurelia right now, you would type something like: "${p.profile.testing.firstSentence}". Pain today: ${p.profile.testing.pain} out of 10. You spend ${p.profile.testing.spendNow} on this now and otherwise rely on ${p.profile.testing.alternatives.join(', ')}. You would buy if: ${p.profile.testing.buyTriggers.join('; ')}. Your objections: ${p.profile.testing.objections.join(' ')}`,
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

/**
 * What makes a persona not hold together (U103): the rules the buyer agent
 * runs found broken. Generator 2 must return none of these; generator 1 is
 * kept as it was for the runs pinned to it.
 */
export function incoherence(p: Persona | PersonaV4): string[] {
  // Set v4 (U134) adds its own rules: age vs life stage and situation,
  // menopause by age and sex, income by country, shift work vs sleep timing,
  // severe scores vs daily functioning, and the safety routing.
  if ('set' in p) return incoherenceV4(p)
  const out: string[] = []
  const f = p.profile
  const t = f.testing
  const working = WORKING.includes(p.workPattern)
  if (!fitsStruggle(p.struggle, p.workPattern, p.household, p.age)) out.push(`struggle “${p.struggle}” does not fit ${p.occupation.toLowerCase()}, ${p.household}`)
  for (const x of f.stressors) if (!fitsStressor(x, p.workPattern)) out.push(`stressor “${x}” for someone ${p.workPattern}`)
  for (const x of p.triggers) if (!fitsTrigger(x, p.workPattern, p.household)) out.push(`trigger “${x}” for ${p.workPattern}, ${p.household}`)
  if (p.occupation === 'Carer for a parent' && p.household !== 'cares for a parent at home') out.push(`carer for a parent who ${p.household}`)
  if (p.occupation === 'Parent on leave' && p.age >= 45) out.push(`parent on leave at ${p.age}`)
  if (p.workPattern === 'student' && /teenagers/.test(p.household)) out.push(`student living with teenagers`)
  if (p.income === 'low' && p.age >= 28 && HIGH_PAY.includes(p.occupation)) out.push(`${p.occupation.toLowerCase()} on a low income`)
  if (p.income === 'high' && LOW_PAY.includes(p.occupation)) out.push(`${p.occupation.toLowerCase()} on a high income`)
  if (/\$1[05] a month|about \$10 a month/.test(t.spendNow) && /free only|up to \$5/.test(p.willingnessToPay)) out.push(`spends ${t.spendNow} but would pay ${p.willingnessToPay}`)
  if (/\$1[05] a month|about \$10 a month/.test(t.spendNow) && t.buyTriggers.includes('a price under $5 a month')) out.push('spends $10+ a month but needs a price under $5')
  if (p.flags.includes('pregnant') && (p.gender !== 'woman' || p.age > 45)) out.push(`pregnant at ${p.age}`)
  if (p.flags.includes('night shift worker') && p.workPattern !== 'shift' && !working) out.push(`night shift worker who is ${p.workPattern}`)
  return out
}

/*
 * Persona set v4 (generator 3, U134): 1,000 people from cited distributions,
 * with a life situation and a wellness condition each. It lives in
 * personasV4.ts so generators 1 and 2 above stay byte-identical; exported
 * here for future buyer-agent runs.
 */
export { PERSONA_COUNT_V4, SEED_V4, SOURCES as PERSONA_SOURCES_V4, buyerVarsV4, generatePersonasV4, incoherenceV4 } from './personasV4'
export type { PersonaV4 } from './personasV4'
