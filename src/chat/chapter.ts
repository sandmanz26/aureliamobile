import type { Recommendation } from '../components/chat/RecommendationCard'

/** "Longer, increased yellow and less movement" — the Chapter card's one line (U066). */
export function chapterSummary(recommendations: Pick<Recommendation, 'title'>[]) {
  const words = recommendations.map((r, i) => (i === 0 ? r.title : r.title.charAt(0).toLowerCase() + r.title.slice(1)))
  return words.length > 1 ? `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}` : (words[0] ?? '')
}

/**
 * What the next build is called on the card and the sheet. With a journey
 * (v4+) it is the chapter that check-ins have reached; otherwise the count of
 * builds already in this thread, plus the one this would make.
 */
export function chapterTitle(checkIns: number | null, builds: number) {
  if (checkIns !== null) return `Chapter ${checkIns + 1}`
  return `Chapter ${builds + 1}`
}
