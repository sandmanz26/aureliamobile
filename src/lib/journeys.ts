import gallery1 from '../assets/journeys/gallery-1.jpg'
import gallery2 from '../assets/journeys/gallery-2.jpg'
import gallery3 from '../assets/journeys/gallery-3.jpg'
import lucas from '../assets/journeys/lucas.png'
import olivia from '../assets/journeys/olivia.png'
import pause from '../assets/journeys/pause.jpg'
import phone from '../assets/journeys/phone.jpg'

/**
 * Personal journeys (U066, Figma Changes → Explore 16906:5640 and Session
 * Detail 16906:8333): first-person stories of someone who used a session for
 * a problem of their own, each ending on that session.
 *
 * Sample content, like the rest of the catalogue: Olivia's text and every
 * photo are the Figma frame's; Lucas's story is written to the same pattern.
 * Nothing here is a real person or a real outcome.
 */
export type StoryBlock =
  | { kind: 'p'; text: string }
  | { kind: 'section'; title: string; text: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'session'; lead: string; slug: string }
  | { kind: 'gallery'; photos: string[] }

export interface Story {
  slug: string
  title: string
  author: string
  avatar: string
  /** yyyy-mm-dd */
  date: string
  minutes: number
  photo: string
  /** The floor under the photo while it loads, as everywhere else. */
  gradient: string
  /** The session "Try the Session" opens. */
  session: string
  blocks: StoryBlock[]
}

export const STORIES: Story[] = [
  {
    slug: 'i-needed-a-pause',
    title: "I didn't realise how much I needed a pause.",
    author: 'Olivia Bennett',
    avatar: olivia,
    date: '2026-11-03',
    minutes: 5,
    photo: pause,
    gradient: 'linear-gradient(160deg, #6B4E2E, #C9A27A)',
    session: 'inner-frequency',
    blocks: [
      { kind: 'p', text: 'For the longest time, I thought being productive meant keeping myself busy. Between work, personal commitments, and the constant stream of notifications, I rarely gave myself a moment to just stop. Even when I had free time, my mind was somewhere else.' },
      { kind: 'p', text: "Eventually, I realised I wasn't just physically tired. I was mentally exhausted, too. That's when I decided to try something different." },
      { kind: 'quote', text: "“I used to feel guilty doing nothing. Now, I've learned that taking a moment for myself is part of getting things done.”" },
      { kind: 'session', lead: 'A gentle pause between the words:', slug: 'inner-frequency' },
      {
        kind: 'section',
        title: 'When everything felt like too much',
        text: [
          "My mornings usually started with checking emails before I even got out of bed. I'd think about everything I needed to accomplish that day, mentally preparing for meetings, deadlines, and whatever else might come up.",
          "Even after work, I found it difficult to switch off. I'd replay conversations, think about unfinished tasks, or worry about things that hadn't even happened yet.",
          "I didn't really notice how much energy this was taking from me until I started feeling overwhelmed by even the smallest things.",
        ],
      },
      { kind: 'gallery', photos: [gallery1, gallery2, gallery3] },
      {
        kind: 'section',
        title: 'Learning to slow down',
        text: [
          'A colleague once mentioned that she started using short guided meditation sessions during her lunch breaks. I was curious, so I decided to give it a try.',
          "I started with just five minutes a day. Sometimes I'd do it in the morning before opening my laptop. Other times, I'd take a break in the afternoon when everything felt a little too overwhelming.",
          'At first, sitting still felt surprisingly difficult. My thoughts kept wandering, and I constantly felt the urge to check my phone. But eventually, I stopped worrying about doing it perfectly.',
          'I simply showed up, took a breath, and let myself be present.',
        ],
      },
    ],
  },
  {
    slug: 'phone-at-2am',
    title: 'I stopped reaching for my phone at 2 a.m.',
    author: 'Lucas Walsh',
    avatar: lucas,
    date: '2026-10-28',
    minutes: 4,
    photo: phone,
    gradient: 'linear-gradient(160deg, #2E3A4A, #8FA3B8)',
    session: 'night-rain-sleep',
    blocks: [
      { kind: 'p', text: 'I used to wake up at two in the morning almost every night. Not because of a noise or a dream, just awake, with my mind already running through the next day.' },
      { kind: 'p', text: "The first thing I'd do was reach for my phone. Ten minutes of scrolling became forty, and by the time I put it down I was wide awake and annoyed with myself." },
      { kind: 'quote', text: '“I didn’t need to fall back asleep straight away. I needed something to do with my mind that wasn’t a screen.”' },
      { kind: 'session', lead: 'What I play now, instead of the phone:', slug: 'night-rain-sleep' },
      {
        kind: 'section',
        title: 'The nights that ran together',
        text: [
          'After a few weeks of this, my days started to blur. I was tired by mid-morning and wired at night, and coffee was doing most of the work.',
          'I told Aurelia exactly that: I wake at 2 a.m. and I reach for my phone. It made me a short night session, rain and a slow voice, with nothing at the end that would make me check the time.',
        ],
      },
      { kind: 'gallery', photos: [gallery3, gallery1, gallery2] },
      {
        kind: 'section',
        title: 'Leaving the phone in the other room',
        text: [
          'The session only works if the phone is not in my hand, so I started charging it in the kitchen and playing the session from a small speaker.',
          'Some nights I am asleep before it ends. Some nights I am not, and that is fine too. What changed is that 2 a.m. stopped being the start of my next day.',
        ],
      },
    ],
  },
]

export function findStory(slug: string | undefined) {
  return STORIES.find((s) => s.slug === slug)
}

export function storyDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}
