// Cover art for sessions, served from the Unsplash CDN.
//
// These stand in for the artwork a real session would carry (generated or
// creator-uploaded). Every consumer renders them through <CoverImage>, which
// keeps the design-token gradient underneath — so if a photo 404s, is blocked
// by a corporate network, or Unsplash is unreachable, the card still reads as
// designed instead of going blank.
//
// Attribution: Unsplash photos are free to use under the Unsplash License,
// which does not require attribution but appreciates it. Before this ships to
// real users, replace these with licensed or generated artwork — hotlinking a
// third party's CDN is fine for a demo, not for production.

export function unsplash(id: string, width = 600, height = 600) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&h=${height}&q=75`
}

/** Photo id per session subject, so the same session looks the same everywhere. */
export const COVER_PHOTOS = {
  affirmations: '1506126613408-eca07ce68773',   // sunrise yoga
  breathwork: '1544367567-0f2fcb009e0b',        // stretching at dawn
  dolphins: '1439066615861-d1af74d74000',       // deep ocean
  vibration: '1465146344425-f00d5f5c8f07',      // wildflowers, warm light
  mindDance: '1502134249126-9f3755a50d78',      // night sky
  sleep: '1519681393784-d120267933ba',          // mountains under stars
  morning: '1470071459604-3b5ec3a7fe05',        // fog over pines
  stress: '1447752875215-b2761acb3c5d',         // forest path
  forest: '1441974231531-c6227db76b6e',         // sunlit canopy
  calm: '1499209974431-9dddcece7f88',           // still water
  mountains: '1506905925346-21bda4d32df4',      // dawn ridgeline
  water: '1518241353330-0f7941c2d9b5',          // rippled surface
  avatar: '1500648767791-00dcc994a43e',         // portrait, for the demo profile
} as const

export type CoverKey = keyof typeof COVER_PHOTOS
