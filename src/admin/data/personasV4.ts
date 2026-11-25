// Persona set v4 (generator 3, U134): 1,000 synthetic people whose ages,
// sexes, countries, phones and wellness mix are drawn from cited figures, each
// with a current life situation (what is happening to them now) and a
// starting wellness condition for the bad-to-good model. None of them is
// real. Generators 1 and 2 (personas.ts) are untouched so earlier runs stay
// reproducible; this file has its own copy of the PRNG for the same reason.
//
// Every figure the generator aims for sits in SOURCES below with its URL and
// year, labelled either a measured statistic (someone counted it) or our
// assumption (a choice we made, often informed by a measured figure). The
// wellness measures are screening-style bands for research role-play only:
// never a diagnosis.

import type { VarKey } from './buyerPlay'

export const SEED_V4 = 20264
export const PERSONA_COUNT_V4 = 1000

/* --------------------------------------------------------------- Sources */

export type SourceKind = 'measured' | 'assumption'

export interface Source {
  id: string
  what: string
  figure: string
  kind: SourceKind
  cite: string
  url: string
  year: number
}

export const SOURCES: Source[] = [
  { id: 'wpp', what: 'Age of adults by country', figure: 'Adult age shares per country group, rounded to whole percent (e.g. Indonesia: 16% are 18–24, 10% are 65+; Japan: 31% are 65+)', kind: 'measured', cite: 'UN DESA, World Population Prospects 2024 (2025 estimates)', url: 'https://population.un.org/wpp/', year: 2024 },
  { id: 'wpp-sex', what: 'Sex by age', figure: 'About 50% women up to 54, 51% at 55–64, 55% at 65+', kind: 'measured', cite: 'UN DESA, World Population Prospects 2024', url: 'https://population.un.org/wpp/', year: 2024 },
  { id: 'markets', what: 'Country mix', figure: 'Indonesia 20%, United States 14%, India 9%, United Kingdom 7%, then 11 more markets at 4–6% each', kind: 'assumption', cite: 'Aurelia target markets (Indonesia first, then English-speaking and large mobile markets)', url: 'https://population.un.org/wpp/', year: 2026 },
  { id: 'statcounter', what: 'iPhone vs Android by country', figure: 'iPhone share of phones: US 57%, Japan 66%, UK 50%, Germany 37%, Indonesia 12%, India 5%, Nigeria 12%', kind: 'measured', cite: 'StatCounter Global Stats, mobile operating system market share by country (rounded)', url: 'https://gs.statcounter.com/os-market-share/mobile/', year: 2025 },
  { id: 'ohayon', what: 'Sleep problems', figure: 'About 30% of adults have insomnia symptoms; about 10% meet the bar for an insomnia disorder', kind: 'measured', cite: 'Ohayon, Epidemiology of insomnia, Sleep Medicine Reviews 6(2)', url: 'https://doi.org/10.1053/smrv.2002.0186', year: 2002 },
  { id: 'gallup', what: 'Daily stress', figure: '37% of adults worldwide felt stress during a lot of the previous day', kind: 'measured', cite: 'Gallup, Global Emotions report (2023 fieldwork)', url: 'https://www.gallup.com/analytics/349280/state-of-the-world-emotional-health.aspx', year: 2024 },
  { id: 'nhis-dep', what: 'Low mood symptoms', figure: '18.5% of adults had depression symptoms in the last two weeks: 11.5% mild, 4.2% moderate, 2.8% severe; more in women (21.8%) than men (15.0%)', kind: 'measured', cite: 'Villarroel & Terlizzi, NCHS Data Brief 379 (US, PHQ-8)', url: 'https://www.cdc.gov/nchs/products/databriefs/db379.htm', year: 2020 },
  { id: 'nhis-anx', what: 'Anxiety symptoms', figure: '15.6% of adults had anxiety symptoms: 9.5% mild, 3.4% moderate, 2.7% severe; highest at 18–29, lowest at 65+; more in women', kind: 'measured', cite: 'Terlizzi & Villarroel, NCHS Data Brief 378 (US, GAD-7)', url: 'https://www.cdc.gov/nchs/products/databriefs/db378.htm', year: 2020 },
  { id: 'who-dep', what: 'Depression worldwide', figure: 'About 5% of adults live with depression; it is about 50% more common in women', kind: 'measured', cite: 'WHO, Depressive disorder fact sheet', url: 'https://www.who.int/news-room/fact-sheets/detail/depression', year: 2023 },
  { id: 'nsduh', what: 'Thoughts of suicide', figure: '5.2% of US adults seriously thought about suicide in the past year', kind: 'measured', cite: 'SAMHSA, National Survey on Drug Use and Health 2022', url: 'https://www.samhsa.gov/data/report/2022-nsduh-annual-national-report', year: 2023 },
  { id: 'risk', what: 'Risk flag share', figure: '2.5% carry a risk flag right now (a point in time, so below the 5.2% past-year figure)', kind: 'assumption', cite: 'Our assumption, set below the NSDUH past-year figure', url: 'https://www.samhsa.gov/data/report/2022-nsduh-annual-national-report', year: 2026 },
  { id: 'eurofound', what: 'Shift work', figure: '21% of workers do shift work', kind: 'measured', cite: 'Eurofound, Sixth European Working Conditions Survey', url: 'https://www.eurofound.europa.eu/en/publications/2016/sixth-european-working-conditions-survey-overview-report', year: 2016 },
  { id: 'aarp', what: 'Caregiving', figure: '21% of adults give unpaid care to an adult or a child with special needs', kind: 'measured', cite: 'AARP and National Alliance for Caregiving, Caregiving in the U.S. 2020', url: 'https://www.aarp.org/ppi/info-2020/caregiving-in-the-united-states.html', year: 2020 },
  { id: 'cdc-pain', what: 'Chronic pain', figure: '20.9% of adults had chronic pain; it rises with age', kind: 'measured', cite: 'Rikard et al., CDC MMWR 72(15), 2021 data', url: 'https://www.cdc.gov/mmwr/volumes/72/wr/mm7215a1.htm', year: 2023 },
  { id: 'pew', what: 'Wearables', figure: '21% of US adults regularly wear a smartwatch or fitness tracker', kind: 'measured', cite: 'Pew Research Center', url: 'https://www.pewresearch.org/short-reads/2020/01/09/about-one-in-five-americans-use-a-smart-watch-or-fitness-tracker/', year: 2020 },
  { id: 'wear-income', what: 'Wearables by income', figure: 'Owned by 35% of higher-income, 20% of middle-income and 8% of lower-income people in our set', kind: 'assumption', cite: 'Our assumption, scaled around the Pew figure', url: 'https://www.pewresearch.org/short-reads/2020/01/09/about-one-in-five-americans-use-a-smart-watch-or-fitness-tracker/', year: 2026 },
  { id: 'nhis-med', what: 'Meditation', figure: '14.2% of US adults meditated in the past year (up from 4.1% in 2012)', kind: 'measured', cite: 'Clarke et al., NCHS Data Brief 325', url: 'https://www.cdc.gov/nchs/products/databriefs/db325.htm', year: 2018 },
  { id: 'baumel', what: 'Wellness app churn', figure: 'Median 15-day retention of mental-health apps was 3.9%; 30-day 3.3%', kind: 'measured', cite: 'Baumel et al., JMIR 21(9):e14567 (also in docs/research)', url: 'https://www.jmir.org/2019/9/e14567/', year: 2019 },
  { id: 'prior-app', what: 'Meditation app before', figure: '22% have used a meditation or sleep app; 85% of those stopped', kind: 'assumption', cite: 'Our assumption, informed by NCHS meditation use and Baumel retention', url: 'https://www.jmir.org/2019/9/e14567/', year: 2026 },
  { id: 'who-pa', what: 'Physical activity', figure: '31% of adults do less than 150 minutes of moderate activity a week', kind: 'measured', cite: 'WHO, Physical activity fact sheet (2022 data)', url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity', year: 2024 },
  { id: 'who-meno', what: 'Menopause', figure: 'Usually happens between 45 and 55', kind: 'measured', cite: 'WHO, Menopause fact sheet', url: 'https://www.who.int/news-room/fact-sheets/detail/menopause', year: 2024 },
  { id: 'income', what: 'Income by country', figure: 'Monthly household income bands per country, around a typical local figure (e.g. Indonesia ~$450, US ~$6,000)', kind: 'assumption', cite: 'Our assumption, informed by World Bank GNI per capita', url: 'https://data.worldbank.org/indicator/NY.GNP.PCAP.CD', year: 2026 },
  { id: 'situations', what: 'Life situations and habits', figure: 'How often each life situation, caffeine, alcohol and screen habit occurs', kind: 'assumption', cite: 'Our assumption, kept consistent with the measured figures above', url: 'https://population.un.org/wpp/', year: 2026 },
]

/** The targets the generator aims for; tests hold the set to them. */
export const TARGETS = {
  insomniaSymptoms: 0.3,
  insomniaDisorder: 0.1,
  stressedYesterday: 0.37,
  lowMoodAny: 0.185,
  lowMoodModerateOrWorse: 0.07,
  anxietyAny: 0.156,
  riskFlag: 0.025,
  shiftOfWorkers: 0.21,
  caregiving: 0.21,
  chronicPain: 0.209,
  insufficientActivity: 0.31,
  priorApp: 0.22,
} as const

/* ----------------------------------------------------------------- Types */

export type SexV4 = 'woman' | 'man' | 'non-binary'
export type WorkV4 = 'employed' | 'self-employed' | 'student' | 'between jobs' | 'home and family' | 'retired'
export type IncomeTier = 'low' | 'middle' | 'high'
export type Band3 = 'mild' | 'moderate' | 'severe'
export type ScreenBand = 'none' | 'mild' | 'moderate' | 'severe'
export type SleepBand = 'good' | 'poor' | 'very poor'
export type StressBand = 'low' | 'moderate' | 'high'
export type AgeBandV4 = '18–24' | '25–34' | '35–44' | '45–54' | '55–64' | '65+'

export type ScenarioId =
  | 'exams'
  | 'new-parent'
  | 'job-loss'
  | 'burnout'
  | 'grief'
  | 'shift-rota'
  | 'pain-flare'
  | 'relationship'
  | 'menopause'
  | 'retirement-lonely'
  | 'money'
  | 'post-illness'
  | 'caring'
  | 'moved'
  | 'busy-life'

export interface ScenarioInfo {
  label: string
  /** One sentence, after the person's first name. */
  story: string
  triggers: string[]
  strain: number
}

export const SCENARIOS: Record<ScenarioId, ScenarioInfo> = {
  exams: { label: 'Exam season', story: 'is in the middle of exams and revises late most nights', triggers: ['the night before an exam', 'checking grades online', 'caffeine after 4pm'], strain: 0.5 },
  'new-parent': { label: 'New parent', story: 'had a baby a few months ago and has not slept a full night since', triggers: ['night feeds', 'lying awake listening for the baby', 'being too tired to fall asleep'], strain: 0.6 },
  'job-loss': { label: 'Job loss', story: 'lost their job and is applying for new ones', triggers: ['a rejection email', 'checking the bank balance at night', 'having no reason to get up'], strain: 0.65 },
  burnout: { label: 'Burnout at work', story: 'has been running on empty at work for months', triggers: ['emails after 10pm', 'Sunday evenings', 'replaying meetings in bed'], strain: 0.7 },
  grief: { label: 'Grief', story: 'lost someone close this year', triggers: ['anniversaries', 'quiet evenings at home', 'waking at the hour it happened'], strain: 0.7 },
  'shift-rota': { label: 'Shift work', story: 'works rotating shifts and sleeps at different times every week', triggers: ['switching from nights to days', 'daylight in the bedroom', 'noise while sleeping by day'], strain: 0.55 },
  'pain-flare': { label: 'Chronic pain flare', story: 'is going through a flare of a long-term pain condition', triggers: ['pain when turning over', 'cold weather', 'a day on their feet'], strain: 0.65 },
  relationship: { label: 'Relationship conflict', story: 'is in a hard stretch with their partner, or just after a break-up', triggers: ['an argument before bed', 'their phone lighting up', 'an empty side of the bed'], strain: 0.55 },
  menopause: { label: 'Menopause', story: 'is going through menopause, with night sweats and broken sleep', triggers: ['night sweats', 'a warm bedroom', 'waking at 3am and not dropping off again'], strain: 0.5 },
  'retirement-lonely': { label: 'Lonely after retiring', story: 'retired recently and misses the people and the structure of work', triggers: ['long empty afternoons', 'napping in the day', 'going to bed early with nothing to do'], strain: 0.5 },
  money: { label: 'Money worries', story: 'is worried about money, with bills rising faster than income', triggers: ['bills arriving', 'end of the month', 'doing sums in bed'], strain: 0.55 },
  'post-illness': { label: 'Recovering after illness', story: 'is recovering from a serious illness and still gets tired easily', triggers: ['a day that was too busy', 'worrying it will come back', 'medicines that disturb sleep'], strain: 0.5 },
  caring: { label: 'Caring for family', story: 'looks after a parent or partner who needs daily care', triggers: ['being called in the night', 'a hospital appointment', 'no time for themselves'], strain: 0.6 },
  moved: { label: 'New city', story: 'moved to a new city and does not know many people yet', triggers: ['a strange bedroom', 'weekends alone', 'street noise'], strain: 0.4 },
  'busy-life': { label: 'Ordinary busy life', story: 'has no single big event, just a busy life that leaves little time to rest', triggers: ['scrolling in bed', 'a late coffee', 'a long day'], strain: 0.25 },
}

export const SCENARIO_IDS = Object.keys(SCENARIOS) as ScenarioId[]

export interface WellnessV4 {
  sleep: { hours: number; latencyMin: number; wakeUps: number; band: SleepBand; bedtime: string; wake: string }
  stress: { band: StressBand; stressedYesterday: boolean }
  /** PHQ-2-like low-mood screening band. Screening only, never a diagnosis. */
  mood: ScreenBand
  /** GAD-2-like worry screening band. Screening only, never a diagnosis. */
  anxiety: ScreenBand
  energy: 1 | 2 | 3 | 4 | 5
  activeMinutesWeek: number
  caffeineCups: number
  alcoholDrinksWeek: number
  screenInBedMin: number
  /** 0–100, higher is better: where the person starts on the bad-to-good scale. */
  score: number
  band: Band3
  functioning: string
}

export interface PersonaV4 {
  id: string
  set: 'v4'
  name: string
  age: number
  ageBand: AgeBandV4
  sex: SexV4
  country: string
  region: string
  city: string
  language: string
  readsEnglish: boolean
  device: 'iPhone' | 'Android'
  deviceAge: 'new' | 'a few years old'
  work: WorkV4
  occupation: string
  shiftWork: boolean
  nightShift: boolean
  household: string
  lifeStage: string
  income: IncomeTier
  incomeUsdMonth: number
  caregiving: boolean
  chronicPain: boolean
  wearable: string
  priorApp: string
  priorAppOutcome: 'never used one' | 'still uses it' | 'stopped'
  aiAttitude: 'enthusiastic' | 'curious' | 'skeptical' | 'distrustful'
  scenario: ScenarioId
  onsetWeeksAgo: number
  duration: string
  badNightTriggers: string[]
  wellness: WellnessV4
  riskFlag: boolean
  /** Where the AI sends this person first. Risk-flagged people get the help screen, never a sale. */
  routing: 'Need help now?' | 'normal'
  marketable: boolean
  story: string[]
  mightTry: string
  mightNot: string
}

/* ------------------------------------------------------------------ PRNG */

/** mulberry32, a copy of the one in personas.ts so that file stays untouched. */
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
const between = (r: Rand, lo: number, hi: number) => lo + r() * (hi - lo)
const roundTo = (x: number, step: number) => Math.round(x / step) * step

/* ---------------------------------------------------------------- Places */

type AgeProfile = readonly [number, number, number, number, number, number]
/** Adult age shares (18–24 … 65+), rounded from UN WPP 2024. */
export const AGE_PROFILES: Record<string, AgeProfile> = {
  'West Africa': [25, 27, 19, 13, 9, 7],
  'South and Southeast Asia': [16, 22, 21, 18, 13, 10],
  'Latin America': [14, 20, 20, 17, 14, 15],
  'English-speaking West': [11, 17, 17, 15, 16, 24],
  Singapore: [9, 16, 18, 18, 17, 22],
  'Japan and Western Europe': [8, 14, 14, 15, 18, 31],
}
export const AGE_BANDS: AgeBandV4[] = ['18–24', '25–34', '35–44', '45–54', '55–64', '65+']

interface PlaceV4 {
  country: string
  weight: number
  ageGroup: keyof typeof AGE_PROFILES
  region: string
  iosShare: number
  language: string
  englishShare: number
  medianUsd: number
  cities: string[]
  women: string[]
  men: string[]
  surnames: string[]
  muslimMajority?: boolean
}

export const PLACES_V4: PlaceV4[] = [
  { country: 'Indonesia', weight: 20, ageGroup: 'South and Southeast Asia', region: 'Southeast Asia', iosShare: 0.12, language: 'Indonesian', englishShare: 0.35, medianUsd: 450, cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Yogyakarta', 'Denpasar', 'Makassar', 'Semarang'], women: ['Siti', 'Dewi', 'Putri', 'Ayu', 'Rina', 'Nur', 'Intan', 'Wulan'], men: ['Budi', 'Agus', 'Rizky', 'Dimas', 'Andi', 'Fajar', 'Hendra', 'Yusuf'], surnames: ['S.', 'W.', 'P.', 'H.', 'R.', 'K.'], muslimMajority: true },
  { country: 'United States', weight: 14, ageGroup: 'English-speaking West', region: 'North America', iosShare: 0.57, language: 'English', englishShare: 1, medianUsd: 6000, cities: ['Austin', 'Chicago', 'Atlanta', 'Denver', 'Phoenix', 'Columbus', 'Seattle', 'Tampa'], women: ['Jessica', 'Ashley', 'Maria', 'Emily', 'Keisha', 'Linda'], men: ['Michael', 'Chris', 'Jose', 'Tyler', 'Darnell', 'Robert'], surnames: ['Miller', 'Johnson', 'Garcia', 'Brown', 'Lee', 'Davis'] },
  { country: 'India', weight: 9, ageGroup: 'South and Southeast Asia', region: 'South Asia', iosShare: 0.05, language: 'Hindi', englishShare: 0.45, medianUsd: 300, cities: ['Bengaluru', 'Pune', 'Delhi', 'Mumbai', 'Hyderabad', 'Jaipur'], women: ['Priya', 'Anjali', 'Kavya', 'Sunita', 'Neha', 'Meera'], men: ['Rahul', 'Arjun', 'Vikram', 'Rohan', 'Amit', 'Suresh'], surnames: ['Sharma', 'Iyer', 'Patel', 'Reddy', 'Gupta', 'Nair'] },
  { country: 'United Kingdom', weight: 7, ageGroup: 'English-speaking West', region: 'Europe', iosShare: 0.5, language: 'English', englishShare: 1, medianUsd: 4500, cities: ['Manchester', 'Leeds', 'Bristol', 'Glasgow', 'Birmingham', 'London'], women: ['Sophie', 'Emma', 'Aisha', 'Claire', 'Megan', 'Joanne'], men: ['James', 'Tom', 'Callum', 'Imran', 'Gareth', 'David'], surnames: ['Smith', 'Taylor', 'Khan', 'Wilson', 'Evans', 'Murphy'] },
  { country: 'Philippines', weight: 6, ageGroup: 'South and Southeast Asia', region: 'Southeast Asia', iosShare: 0.15, language: 'Filipino', englishShare: 0.75, medianUsd: 450, cities: ['Quezon City', 'Cebu City', 'Davao', 'Manila', 'Iloilo'], women: ['Maria', 'Angelica', 'Kristine', 'Joy', 'Rowena'], men: ['Juan', 'Mark', 'Paolo', 'Rodel', 'Jerome'], surnames: ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia'] },
  { country: 'Malaysia', weight: 5, ageGroup: 'South and Southeast Asia', region: 'Southeast Asia', iosShare: 0.22, language: 'Malay', englishShare: 0.7, medianUsd: 1300, cities: ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Ipoh', 'Kuching'], women: ['Nurul', 'Mei Ling', 'Aishah', 'Priya', 'Farah'], men: ['Ahmad', 'Wei Jie', 'Hafiz', 'Ravi', 'Amir'], surnames: ['A.', 'Tan', 'Lim', 'R.', 'H.'], muslimMajority: true },
  { country: 'Australia', weight: 5, ageGroup: 'English-speaking West', region: 'Oceania', iosShare: 0.55, language: 'English', englishShare: 1, medianUsd: 5500, cities: ['Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Sydney'], women: ['Chloe', 'Olivia', 'Mia', 'Sarah', 'Kylie'], men: ['Jack', 'Liam', 'Nathan', 'Ben', 'Lachlan'], surnames: ['Wilson', 'Nguyen', 'Smith', 'Jones', 'Kelly'] },
  { country: 'Germany', weight: 5, ageGroup: 'Japan and Western Europe', region: 'Europe', iosShare: 0.37, language: 'German', englishShare: 0.6, medianUsd: 4500, cities: ['Berlin', 'Hamburg', 'Cologne', 'Leipzig', 'Munich'], women: ['Anna', 'Lena', 'Katrin', 'Sabine', 'Elif'], men: ['Jonas', 'Lukas', 'Thomas', 'Mehmet', 'Stefan'], surnames: ['Müller', 'Schmidt', 'Weber', 'Yilmaz', 'Fischer'] },
  { country: 'Brazil', weight: 5, ageGroup: 'Latin America', region: 'Latin America', iosShare: 0.18, language: 'Portuguese', englishShare: 0.15, medianUsd: 900, cities: ['São Paulo', 'Recife', 'Belo Horizonte', 'Curitiba', 'Salvador'], women: ['Ana', 'Juliana', 'Fernanda', 'Camila', 'Luciana'], men: ['João', 'Lucas', 'Rafael', 'Thiago', 'Marcos'], surnames: ['Silva', 'Souza', 'Oliveira', 'Costa', 'Lima'] },
  { country: 'Mexico', weight: 4, ageGroup: 'Latin America', region: 'Latin America', iosShare: 0.22, language: 'Spanish', englishShare: 0.2, medianUsd: 900, cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Mérida'], women: ['Guadalupe', 'Sofía', 'Daniela', 'Mariana', 'Rosa'], men: ['José', 'Luis', 'Diego', 'Alejandro', 'Miguel'], surnames: ['Hernández', 'López', 'Martínez', 'Ramírez', 'Flores'] },
  { country: 'Canada', weight: 4, ageGroup: 'English-speaking West', region: 'North America', iosShare: 0.58, language: 'English', englishShare: 0.95, medianUsd: 5000, cities: ['Toronto', 'Calgary', 'Ottawa', 'Vancouver', 'Halifax'], women: ['Emily', 'Amélie', 'Harpreet', 'Jennifer', 'Grace'], men: ['Ryan', 'Étienne', 'Gurpreet', 'Kevin', 'Matthew'], surnames: ['Tremblay', 'Singh', 'Wong', 'Martin', 'Roy'] },
  { country: 'Singapore', weight: 4, ageGroup: 'Singapore', region: 'Southeast Asia', iosShare: 0.4, language: 'English', englishShare: 0.95, medianUsd: 6500, cities: ['Singapore'], women: ['Hui Min', 'Siew Ling', 'Nur Aisyah', 'Kavitha', 'Rachel'], men: ['Jun Wei', 'Marcus', 'Hafiz', 'Arun', 'Daniel'], surnames: ['Tan', 'Lim', 'Ng', 'Rahman', 'Pillai'] },
  { country: 'Nigeria', weight: 4, ageGroup: 'West Africa', region: 'Africa', iosShare: 0.12, language: 'English', englishShare: 0.85, medianUsd: 200, cities: ['Lagos', 'Abuja', 'Ibadan', 'Port Harcourt', 'Kano'], women: ['Chiamaka', 'Funke', 'Aisha', 'Ngozi', 'Blessing'], men: ['Chinedu', 'Tunde', 'Ibrahim', 'Emeka', 'Segun'], surnames: ['Okafor', 'Adeyemi', 'Bello', 'Eze', 'Balogun'] },
  { country: 'Japan', weight: 4, ageGroup: 'Japan and Western Europe', region: 'East Asia', iosShare: 0.66, language: 'Japanese', englishShare: 0.15, medianUsd: 3800, cities: ['Tokyo', 'Osaka', 'Fukuoka', 'Sapporo', 'Nagoya'], women: ['Yuki', 'Haruka', 'Aiko', 'Keiko', 'Mai'], men: ['Hiroshi', 'Takumi', 'Kenji', 'Daiki', 'Satoshi'], surnames: ['Sato', 'Suzuki', 'Tanaka', 'Watanabe', 'Ito'] },
  { country: 'Netherlands', weight: 4, ageGroup: 'Japan and Western Europe', region: 'Europe', iosShare: 0.45, language: 'Dutch', englishShare: 0.9, medianUsd: 4800, cities: ['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven', 'Groningen'], women: ['Sanne', 'Fleur', 'Fatima', 'Lotte', 'Ingrid'], men: ['Daan', 'Bram', 'Youssef', 'Joost', 'Pieter'], surnames: ['de Vries', 'Jansen', 'Bakker', 'El Amrani', 'Visser'] },
]

/** Share of women by age band (UN WPP 2024, rounded). */
const WOMEN_SHARE: Record<AgeBandV4, number> = { '18–24': 0.49, '25–34': 0.49, '35–44': 0.5, '45–54': 0.5, '55–64': 0.51, '65+': 0.55 }
/** Chronic pain by age, shaped like CDC 2021 and centred on its 20.9%. */
const PAIN_BY_AGE: Record<AgeBandV4, number> = { '18–24': 0.08, '25–34': 0.13, '35–44': 0.19, '45–54': 0.25, '55–64': 0.3, '65+': 0.3 }
const CARE_BY_AGE: Record<AgeBandV4, number> = { '18–24': 0.12, '25–34': 0.17, '35–44': 0.22, '45–54': 0.28, '55–64': 0.28, '65+': 0.19 }
/** Income tiers: monthly household income as a multiple of the local typical figure. */
export const INCOME_RANGE: Record<IncomeTier, [number, number]> = { low: [0.3, 0.7], middle: [0.7, 1.6], high: [1.6, 4] }

const JOBS = {
  low: ['Warehouse picker', 'Shop assistant', 'Ride-hailing driver', 'Cleaner', 'Call-centre agent', 'Kitchen hand', 'Security guard', 'Factory worker'],
  middle: ['Teacher', 'Nurse', 'Bank clerk', 'Office administrator', 'Electrician', 'Sales rep', 'Bus driver', 'Pharmacist assistant', 'Junior accountant'],
  high: ['Software engineer', 'Doctor', 'Lawyer', 'Product manager', 'Finance manager', 'Consultant', 'Architect'],
} as const
const SHIFT_JOBS = ['Nurse', 'Hospital porter', 'Factory worker', 'Security guard', 'Call-centre agent', 'Paramedic', 'Hotel night manager', 'Care-home worker']
const SELF_JOBS = ['Online seller', 'Hairdresser', 'Freelance designer', 'Warung owner', 'Tutor', 'Market trader', 'Photographer', 'Plumber']
const APPS = ['Calm', 'Headspace', 'Insight Timer', 'BetterSleep', 'a YouTube sleep channel', 'Balance']

export function ageBandOf(age: number): AgeBandV4 {
  return age < 25 ? '18–24' : age < 35 ? '25–34' : age < 45 ? '35–44' : age < 55 ? '45–54' : age < 65 ? '55–64' : '65+'
}
const hhmm = (h: number) => {
  const x = ((h % 24) + 24) % 24
  const m = Math.round((x % 1) * 4) * 15
  const hh = Math.floor(x) + (m === 60 ? 1 : 0)
  return `${String(hh % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/* ------------------------------------------------------- Draft (pass 1) */

interface Draft extends Omit<PersonaV4, 'wellness' | 'riskFlag' | 'routing' | 'marketable' | 'story' | 'mightTry' | 'mightNot'> {
  latent: { sleep: number; stress: number; mood: number; anxiety: number; hopeless: number; activity: number; energy: number }
  place: PlaceV4
}

function eligible(s: ScenarioId, d: Pick<Draft, 'age' | 'sex' | 'work' | 'shiftWork' | 'caregiving' | 'chronicPain' | 'income'>): number {
  const { age, sex, work } = d
  switch (s) {
    case 'exams':
      return work === 'student' ? 45 : 0
    case 'new-parent':
      return age >= 20 && age <= (sex === 'woman' ? 42 : 47) && work !== 'student' && work !== 'retired' ? 9 : 0
    case 'job-loss':
      return work === 'between jobs' ? 70 : 0
    case 'burnout':
      return work === 'employed' || work === 'self-employed' ? (age < 65 ? 14 : 0) : 0
    case 'grief':
      return age >= 55 ? 9 : 5
    case 'shift-rota':
      return d.shiftWork ? 45 : 0
    case 'pain-flare':
      return d.chronicPain ? 22 : 0
    case 'relationship':
      return age < 65 ? 8 : 3
    case 'menopause':
      return sex === 'woman' && age >= 45 && age <= 55 ? 30 : 0
    case 'retirement-lonely':
      return work === 'retired' && age >= 60 ? 30 : 0
    case 'money':
      return d.income === 'high' ? 0 : d.income === 'low' ? 16 : 7
    case 'post-illness':
      return age >= 30 ? (age >= 55 ? 8 : 4) : 0
    case 'caring':
      return d.caregiving && age >= 25 ? 22 : 0
    case 'moved':
      return age <= 45 && work !== 'retired' ? 5 : 0
    case 'busy-life':
      return 20
  }
}

function draft(r: Rand, n: number): Draft {
  const place = weighted(r, PLACES_V4.map((p) => [p, p.weight] as const))
  const prof = AGE_PROFILES[place.ageGroup]
  const ageBand = weighted(r, AGE_BANDS.map((b, i) => [b, prof[i]] as const))
  const [lo, hi] = { '18–24': [18, 24], '25–34': [25, 34], '35–44': [35, 44], '45–54': [45, 54], '55–64': [55, 64], '65+': [65, 84] }[ageBand]
  const age = Math.floor(between(r, lo, hi + 1))
  const sexDraw = r()
  const sex: SexV4 = sexDraw < 0.01 ? 'non-binary' : sexDraw < 0.01 + WOMEN_SHARE[ageBand] * 0.99 ? 'woman' : 'man'
  const firstPool = sex === 'woman' ? place.women : sex === 'man' ? place.men : r() < 0.5 ? place.women : place.men
  const name = `${pick(r, firstPool)} ${pick(r, place.surnames)}`

  const work: WorkV4 =
    age < 25
      ? weighted(r, [['student', 45], ['employed', 38], ['self-employed', 5], ['between jobs', 9], ['home and family', 3]])
      : age < 35
        ? weighted(r, [['student', 6], ['employed', 62], ['self-employed', 13], ['between jobs', 7], ['home and family', 12]])
        : age < 55
          ? weighted(r, [['employed', 64], ['self-employed', 17], ['between jobs', 6], ['home and family', 13]])
          : age < 65
            ? weighted(r, [['employed', 44], ['self-employed', 14], ['between jobs', 5], ['home and family', 10], ['retired', 27]])
            : weighted(r, [['retired', 84], ['self-employed', 8], ['employed', 5], ['home and family', 3]])
  const shiftWork = work === 'employed' && r() < 0.26
  const nightShift = shiftWork && r() < 0.35

  const income: IncomeTier =
    work === 'student' || work === 'between jobs' ? weighted(r, [['low', 60], ['middle', 40]]) : work === 'retired' ? weighted(r, [['low', 40], ['middle', 45], ['high', 15]]) : weighted(r, [['low', 28], ['middle', 50], ['high', 22]])
  const [mLo, mHi] = INCOME_RANGE[income]
  const incomeUsdMonth = roundTo(place.medianUsd * between(r, mLo + 0.02, mHi - 0.02), place.medianUsd < 1000 ? 10 : 50)
  const occupation =
    work === 'student'
      ? pick(r, ['University student', 'College student', 'Nursing student', 'Postgraduate student'])
      : work === 'retired'
        ? `Retired ${pick(r, JOBS.middle).toLowerCase()}`
        : work === 'between jobs'
          ? `Looking for work (was ${pick(r, income === 'low' ? JOBS.low : JOBS.middle).toLowerCase()})`
          : work === 'home and family'
            ? 'Runs the home and family'
            : work === 'self-employed'
              ? pick(r, SELF_JOBS)
              : shiftWork
                ? pick(r, SHIFT_JOBS)
                : pick(r, JOBS[income])

  const caregiving = r() < CARE_BY_AGE[ageBand] * (work === 'home and family' ? 1.6 : 1)
  const chronicPain = r() < PAIN_BY_AGE[ageBand]
  const wearable = r() < (income === 'high' ? 0.35 : income === 'middle' ? 0.2 : 0.08) ? pick(r, income === 'high' ? ['Apple Watch', 'Oura ring', 'Garmin watch', 'Apple Watch'] : ['Fitbit', 'Xiaomi band', 'Samsung Galaxy Watch', 'Huawei band']) : 'none'

  const base = { age, sex, work, shiftWork, caregiving, chronicPain, income }
  const scenario = weighted(r, SCENARIO_IDS.map((s) => [s, eligible(s, base)] as const))

  const household =
    scenario === 'new-parent'
      ? pick(r, ['with a partner and a new baby', 'with a partner and a new baby', 'single parent of a new baby'])
      : scenario === 'retirement-lonely'
        ? pick(r, ['lives alone', 'with a partner'])
        : work === 'student'
          ? pick(r, ['with parents', 'flatmates', 'student housing'])
          : age < 25
            ? pick(r, ['with parents', 'flatmates', 'with a partner'])
            : age < 45
              ? pick(r, ['lives alone', 'with a partner', 'with a partner and young kids', 'single parent', 'with parents', 'with extended family'])
              : age < 65
                ? pick(r, ['with a partner', 'with a partner and teenagers', 'lives alone', 'with adult children', 'with extended family'])
                : pick(r, ['with a partner', 'lives alone', 'with adult children', 'with extended family'])
  const lifeStage =
    work === 'student' ? 'student' : work === 'retired' ? 'retired' : /baby|young kids/.test(household) ? 'young family' : age < 30 ? 'early adult life' : age < 55 ? 'mid-life' : 'late working life'

  const info = SCENARIOS[scenario]
  const onsetWeeksAgo = scenario === 'busy-life' ? Math.floor(between(r, 26, 156)) : scenario === 'exams' ? Math.floor(between(r, 1, 7)) : scenario === 'menopause' || scenario === 'shift-rota' || scenario === 'caring' ? Math.floor(between(r, 12, 160)) : Math.floor(between(r, 2, 40))
  const duration = scenario === 'exams' ? 'ends with the last exam' : onsetWeeksAgo < 8 ? 'a few weeks so far' : onsetWeeksAgo < 26 ? 'a few months so far' : onsetWeeksAgo < 52 ? 'most of this year' : 'more than a year, and ongoing'

  const youth = age < 30 ? 0.06 : age >= 65 ? -0.05 : 0
  const strain = info.strain
  const n1 = () => r() - 0.5
  const latent = {
    sleep: strain + 0.45 * n1() + (nightShift ? 0.25 : shiftWork ? 0.12 : 0) + (chronicPain ? 0.15 : 0) + (age >= 55 ? 0.05 : 0),
    stress: strain + 0.5 * n1() + (caregiving ? 0.1 : 0) + (income === 'low' ? 0.08 : 0) + (age >= 65 ? -0.1 : 0),
    mood: strain + 0.6 * n1() + (sex === 'woman' ? 0.08 : 0) + (scenario === 'grief' || scenario === 'job-loss' ? 0.1 : 0),
    anxiety: strain + 0.6 * n1() + (sex === 'woman' ? 0.1 : 0) + youth,
    hopeless: r(),
    activity: r() - 0.3 * strain + (chronicPain ? -0.15 : 0) + (age >= 65 ? -0.1 : 0),
    energy: r(),
  }

  const priorDraw = r()
  const priorAppOutcome: PersonaV4['priorAppOutcome'] = priorDraw < TARGETS.priorApp * (income === 'low' ? 0.6 : income === 'high' ? 1.4 : 1) ? (r() < 0.15 ? 'still uses it' : 'stopped') : 'never used one'
  const priorApp = priorAppOutcome === 'never used one' ? 'none' : pick(r, APPS)
  const aiAttitude = weighted(r, [['enthusiastic', age < 35 ? 22 : 12], ['curious', 40], ['skeptical', 30], ['distrustful', age >= 55 ? 18 : 10]] as const)
  const readsEnglish = place.englishShare >= 1 || r() < place.englishShare * (age >= 55 ? 0.6 : 1)

  return {
    id: `P4-${String(n).padStart(4, '0')}`,
    set: 'v4',
    name,
    age,
    ageBand,
    sex,
    country: place.country,
    region: place.region,
    city: pick(r, place.cities),
    language: place.language,
    readsEnglish,
    device: r() < place.iosShare ? 'iPhone' : 'Android',
    deviceAge: r() < (income === 'high' ? 0.6 : income === 'middle' ? 0.35 : 0.15) ? 'new' : 'a few years old',
    work,
    occupation,
    shiftWork,
    nightShift,
    household,
    lifeStage,
    income,
    incomeUsdMonth,
    caregiving: caregiving || scenario === 'caring',
    chronicPain,
    wearable,
    priorApp,
    priorAppOutcome,
    aiAttitude,
    scenario,
    onsetWeeksAgo,
    duration,
    badNightTriggers: info.triggers,
    latent,
    place,
  }
}

/* ------------------------------------------------ Calibration (pass 2) */

/** Ranks a latent score across the set and cuts it at the cited shares, worst first. */
function bandsByRank<T extends string>(ds: Draft[], score: (d: Draft) => number, cuts: readonly (readonly [T, number])[], rest: T): Map<Draft, T> {
  const sorted = [...ds].sort((a, b) => score(b) - score(a))
  const out = new Map<Draft, T>()
  let i = 0
  for (const [band, share] of cuts) {
    const end = i + Math.round(share * ds.length)
    for (; i < end && i < sorted.length; i++) out.set(sorted[i], band)
  }
  for (; i < sorted.length; i++) out.set(sorted[i], rest)
  return out
}

const FUNCTIONING: Record<Band3, string[]> = {
  mild: ['mostly fine day to day, a bad night now and then', 'gets on with the day; sleep could be better'],
  moderate: ['gets through the day but is tired and short-tempered', 'copes at work or study but has little left in the evening'],
  severe: ['struggles to get through the day', 'has cut back on work, study or seeing people because of it'],
}

export const bandOfScore = (score: number): Band3 => (score < 40 ? 'severe' : score < 65 ? 'moderate' : 'mild')

function finish(r: Rand, d: Draft, sleepB: SleepBand, stressB: StressBand, stressed: boolean, mood: ScreenBand, anxiety: ScreenBand, inactive: boolean, risk: boolean): PersonaV4 {
  const hours = Math.round((sleepB === 'good' ? between(r, 6.8, 8.3) : sleepB === 'poor' ? between(r, 5.5, 7) : between(r, 4, 6)) * 4) / 4 - (d.nightShift ? 0.5 : 0)
  const latencyMin = Math.round(sleepB === 'good' ? between(r, 5, 20) : sleepB === 'poor' ? between(r, 20, 45) : between(r, 35, 90))
  const wakeUps = Math.floor(sleepB === 'good' ? between(r, 0, 2) : sleepB === 'poor' ? between(r, 1, 4) : between(r, 2, 6)) + (d.scenario === 'new-parent' ? 2 : 0)
  const bedH = d.nightShift ? between(r, 7.5, 9.5) : d.work === 'student' ? between(r, 23, 26.5) : d.age >= 65 ? between(r, 21, 23.5) : between(r, 22, 25)
  const bedtime = hhmm(bedH)
  const wake = hhmm(bedH + hours + latencyMin / 60 + wakeUps * 0.15)
  const energyScore = 5 - (sleepB === 'very poor' ? 2 : sleepB === 'poor' ? 1 : 0) - (mood === 'moderate' || mood === 'severe' ? 1 : 0) - (d.latent.energy < 0.3 ? 1 : 0)
  const energy = Math.max(1, Math.min(5, energyScore)) as WellnessV4['energy']
  const activeMinutesWeek = roundTo(inactive ? between(r, 0, 140) : between(r, 150, 420), 10)
  const caffeineCups = Math.floor(between(r, 0, d.work === 'student' || d.shiftWork ? 5 : 4))
  const alcoholDrinksWeek = d.place.muslimMajority && r() < 0.85 ? 0 : Math.floor(between(r, 0, d.age < 25 ? 9 : 7))
  const screenInBedMin = roundTo(between(r, d.age < 35 ? 20 : 0, d.age < 35 ? 90 : 50), 5)

  const SCREEN_PEN = { none: 0, mild: 8, moderate: 16, severe: 24 }
  const penalty = { good: 0, poor: 15, 'very poor': 28 }[sleepB] + { low: 0, moderate: 7, high: 15 }[stressB] + (stressed ? 4 : 0) + SCREEN_PEN[mood] + SCREEN_PEN[anxiety] * 0.75 + (5 - energy) * 3 + (d.chronicPain ? 4 : 0)
  const score = Math.max(4, Math.min(96, Math.round(100 - penalty - between(r, 0, 4))))
  const band = bandOfScore(score)
  const routing = risk ? 'Need help now?' : 'normal'
  const first = d.name.split(' ')[0]
  const info = SCENARIOS[d.scenario]
  const they = d.sex === 'woman' ? 'she' : d.sex === 'man' ? 'he' : 'they'
  const They = they[0].toUpperCase() + they.slice(1)
  const is = they === 'they' ? 'are' : 'is'
  const sleepLine =
    sleepB === 'good'
      ? `${They} still ${they === 'they' ? 'sleep' : 'sleeps'} about ${hours} hours most nights, but ${info.triggers[0]} can cost a night.`
      : `${They} ${is} sleeping about ${hours} hours, takes ${latencyMin} minutes to fall asleep and wakes ${wakeUps === 1 ? 'once' : `${wakeUps} times`} a night; ${info.triggers[0]} can set off a bad night.`
  const story = [`${first}, ${d.age}: ${d.occupation.toLowerCase()} in ${d.city}, ${d.country}; ${d.household}.`, `${first} ${info.story} (${d.duration}).`, sleepLine]

  const pull: string[] = []
  if (sleepB !== 'good') pull.push('wants their nights back')
  if (d.priorAppOutcome === 'stopped') pull.push(`liked parts of ${d.priorApp} before dropping it`)
  if (d.aiAttitude === 'enthusiastic' || d.aiAttitude === 'curious') pull.push('is open to something made just for them')
  if (d.wearable !== 'none') pull.push(`could see the change on their ${d.wearable}`)
  if (!pull.length) pull.push('might try it if a friend shares one')
  const push: string[] = []
  if (d.income === 'low') push.push('has a tight budget, so any price is a hurdle')
  if (!d.readsEnglish) push.push(`needs it in ${d.language}`)
  if (d.aiAttitude === 'distrustful' || d.aiAttitude === 'skeptical') push.push('does not trust AI with feelings')
  if (d.priorAppOutcome === 'stopped') push.push('has already quit one app like this')
  if (d.device === 'Android' && d.deviceAge !== 'new') push.push('has an older Android phone with little storage')
  if (band === 'mild' && sleepB === 'good') push.push('may not feel they need it')
  if (!push.length) push.push('is busy enough to forget it after day two')

  const { latent: _l, place: _p, ...rest } = d
  void _l
  void _p
  return {
    ...rest,
    wellness: {
      sleep: { hours, latencyMin, wakeUps, band: sleepB, bedtime, wake },
      stress: { band: stressB, stressedYesterday: stressed },
      mood,
      anxiety,
      energy,
      activeMinutesWeek,
      caffeineCups,
      alcoholDrinksWeek,
      screenInBedMin,
      score,
      band,
      functioning: pick(r, FUNCTIONING[band]),
    },
    riskFlag: risk,
    routing,
    marketable: !risk,
    story,
    mightTry: risk ? 'Not a buyer right now. Aurelia shows Need help now? first and does not sell to them.' : `${first} ${pull.slice(0, 2).join(' and ')}.`,
    mightNot: risk ? 'Needs real help from a person before any wellness app.' : `${first} ${push.slice(0, 2).join(' and ')}.`,
  }
}

let CACHE: PersonaV4[] | undefined

/** The 1,000 people of persona set v4, identical on every machine and every build. */
export function generatePersonasV4(count = PERSONA_COUNT_V4, seed = SEED_V4): PersonaV4[] {
  if (count === PERSONA_COUNT_V4 && seed === SEED_V4 && CACHE) return CACHE
  const r = rng(seed)
  const ds = Array.from({ length: count }, (_, i) => draft(r, i + 1))
  const sleep = bandsByRank<SleepBand>(ds, (d) => d.latent.sleep, [['very poor', TARGETS.insomniaDisorder], ['poor', TARGETS.insomniaSymptoms - TARGETS.insomniaDisorder]], 'good')
  const stressBand = bandsByRank<StressBand>(ds, (d) => d.latent.stress, [['high', 0.12], ['moderate', 0.46]], 'low')
  const mood = bandsByRank<ScreenBand>(ds, (d) => d.latent.mood, [['severe', 0.028], ['moderate', 0.042], ['mild', 0.115]], 'none')
  const anxiety = bandsByRank<ScreenBand>(ds, (d) => d.latent.anxiety, [['severe', 0.027], ['moderate', 0.034], ['mild', 0.095]], 'none')
  const stressedCount = Math.round(TARGETS.stressedYesterday * count)
  const stressedSet = new Set([...ds].sort((a, b) => b.latent.stress - a.latent.stress).slice(0, stressedCount))
  const inactiveSet = new Set([...ds].sort((a, b) => a.latent.activity - b.latent.activity).slice(0, Math.round(TARGETS.insufficientActivity * count)))
  // Risk flag: among people whose low mood screens moderate or severe, the
  // ones with the most hopelessness, up to the assumed share.
  const riskCount = Math.round(TARGETS.riskFlag * count)
  const riskSet = new Set(
    ds
      .filter((d) => mood.get(d) === 'severe' || mood.get(d) === 'moderate')
      .sort((a, b) => b.latent.mood + b.latent.hopeless * 0.6 - (a.latent.mood + a.latent.hopeless * 0.6))
      .slice(0, riskCount),
  )
  const out = ds.map((d) => finish(r, d, sleep.get(d)!, stressBand.get(d)!, stressedSet.has(d), mood.get(d)!, anxiety.get(d)!, inactiveSet.has(d), riskSet.has(d)))
  if (count === PERSONA_COUNT_V4 && seed === SEED_V4) CACHE = out
  return out
}

/* ------------------------------------------------------------ Coherence */

const WORKING_V4: WorkV4[] = ['employed', 'self-employed']
const toHours = (t: string) => Number(t.slice(0, 2)) + Number(t.slice(3)) / 60

/** What makes a v4 persona not hold together. Must be empty for all 1,000. */
export function incoherenceV4(p: PersonaV4): string[] {
  const out: string[] = []
  const w = p.wellness
  if (p.age < 18 || p.age > 90) out.push(`age ${p.age} outside 18–90`)
  if (ageBandOf(p.age) !== p.ageBand) out.push(`age ${p.age} in band ${p.ageBand}`)
  // Age vs life stage and situation
  if (p.work === 'student' && p.age > 34) out.push(`student at ${p.age}`)
  if (p.work === 'retired' && p.age < 55) out.push(`retired at ${p.age}`)
  if (p.lifeStage === 'student' && p.work !== 'student') out.push(`life stage student but ${p.work}`)
  if (p.lifeStage === 'retired' && p.work !== 'retired') out.push(`life stage retired but ${p.work}`)
  if (p.scenario === 'exams' && p.work !== 'student') out.push(`exam season for someone ${p.work}`)
  if (p.scenario === 'new-parent' && (p.age < 18 || p.age > (p.sex === 'woman' ? 45 : 50) || !/baby/.test(p.household))) out.push(`new parent at ${p.age}, ${p.household}`)
  if (p.scenario === 'retirement-lonely' && (p.work !== 'retired' || p.age < 58)) out.push(`lonely after retiring at ${p.age}, ${p.work}`)
  if (p.scenario === 'job-loss' && p.work !== 'between jobs') out.push(`job loss but ${p.work}`)
  if (p.scenario === 'burnout' && !WORKING_V4.includes(p.work)) out.push(`burnout at work but ${p.work}`)
  // Menopause by age and sex
  if (p.scenario === 'menopause' && (p.sex !== 'woman' || p.age < 42 || p.age > 58)) out.push(`menopause for a ${p.age}-year-old ${p.sex}`)
  // Situations that need a matching fact
  if (p.scenario === 'shift-rota' && !p.shiftWork) out.push('shift work situation without shift work')
  if (p.scenario === 'caring' && !p.caregiving) out.push('caring situation without caregiving')
  if (p.scenario === 'pain-flare' && !p.chronicPain) out.push('pain flare without chronic pain')
  if (p.shiftWork && p.work !== 'employed') out.push(`shift work while ${p.work}`)
  if (p.nightShift && !p.shiftWork) out.push('night shift without shift work')
  // Income by country
  const place = PLACES_V4.find((x) => x.country === p.country)
  if (!place) out.push(`unknown country ${p.country}`)
  else {
    const ratio = p.incomeUsdMonth / place.medianUsd
    const [lo, hi] = INCOME_RANGE[p.income]
    if (ratio < lo || ratio > hi) out.push(`${p.income} income of $${p.incomeUsdMonth} a month in ${p.country}`)
    if (!place.cities.includes(p.city)) out.push(`${p.city} is not in ${p.country}`)
  }
  if (p.work === 'student' && p.income === 'high') out.push('student on a high income')
  // Shift work vs sleep timing
  const bed = toHours(w.sleep.bedtime)
  if (p.nightShift && !(bed >= 6 && bed <= 12)) out.push(`night shift worker going to bed at ${w.sleep.bedtime}`)
  if (!p.nightShift && bed > 3.5 && bed < 20) out.push(`goes to bed at ${w.sleep.bedtime} without night shifts`)
  // Sleep numbers vs sleep band
  if (w.sleep.band === 'very poor' && w.sleep.hours > 6.5) out.push(`very poor sleep with ${w.sleep.hours} hours`)
  if (w.sleep.band === 'good' && (w.sleep.latencyMin > 30 || w.sleep.hours < 6)) out.push(`good sleep with ${w.sleep.hours} h and ${w.sleep.latencyMin} min to fall asleep`)
  // Severe scores vs daily functioning
  if (bandOfScore(w.score) !== w.band) out.push(`score ${w.score} in band ${w.band}`)
  if (w.band === 'severe' && FUNCTIONING.mild.includes(w.functioning)) out.push('severe band but fine day to day')
  if (w.band === 'mild' && FUNCTIONING.severe.includes(w.functioning)) out.push('mild band but struggling to get through the day')
  if ((w.mood === 'severe' || w.sleep.band === 'very poor') && w.energy >= 5) out.push('severe low mood or very poor sleep with full energy')
  // Safety
  if (p.riskFlag && !(w.mood === 'severe' || w.mood === 'moderate')) out.push(`risk flag with ${w.mood} low mood`)
  if (p.riskFlag && (p.routing !== 'Need help now?' || p.marketable)) out.push('risk-flagged person is marketed to')
  if (!p.riskFlag && p.routing !== 'normal') out.push('routed to help without a risk flag')
  // Prior app
  if (p.priorAppOutcome === 'never used one' && p.priorApp !== 'none') out.push(`never used an app but lists ${p.priorApp}`)
  return out
}

/* ------------------------------------------------------- For buyer runs */

/** The buyer-run variables (buyerPlay VarKey) for a v4 persona, so a later run can use this set. */
export function buyerVarsV4(p: PersonaV4): Record<VarKey, string> {
  const churn = p.priorAppOutcome === 'never used one' ? 'never used one' : p.priorAppOutcome === 'still uses it' ? 'still uses it' : p.income === 'low' ? 'paywall' : 'lost interest'
  return {
    condition: p.wellness.band,
    wearable: p.wearable,
    device: p.deviceAge === 'new' ? p.device : `older ${p.device}`,
    language: p.language === 'English' ? 'English first' : p.readsEnglish ? 'reads English' : 'needs own language',
    found: 'organic',
    priorApp: p.priorApp,
    churn,
    budget: p.income === 'low' ? 'high' : p.income === 'high' ? 'low' : 'medium',
    lifeStage: p.lifeStage,
    needTime: p.nightShift ? 'irregular hours' : p.wellness.sleep.band === 'good' ? 'evening' : 'at night, in bed',
    aiTrust: { enthusiastic: 'high', curious: 'medium', skeptical: 'low', distrustful: 'none' }[p.aiAttitude],
    privacy: p.aiAttitude === 'distrustful' ? 'very protective' : 'careful',
    culture: p.country,
  }
}

/** Counts of a value across the set, largest first. */
export function countBy<T>(ps: PersonaV4[], f: (p: PersonaV4) => T): [T, number][] {
  const m = new Map<T, number>()
  for (const p of ps) m.set(f(p), (m.get(f(p)) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}
