import { describe, expect, it } from 'vitest'
import {
  INITIAL_JOURNEY,
  JourneyMapSchema,
  addItem,
  allMoments,
  counts,
  linkHref,
  parseImport,
  removeItem,
  screensFor,
  servedMoments,
  toggleMoment,
  unlinkMoment,
  updateItem,
  updateStage,
  screensOnSurfaces,
  surfacesOf,
  upgradeJourney,
} from './userJourney'
import { toBundle, parseAnyImport } from './journeyBundle'

/** The map as it was saved before screens could name their moments. */
function oldShape() {
  return {
    ...INITIAL_JOURNEY,
    stages: INITIAL_JOURNEY.stages.map((s) => ({ ...s, screens: s.screens.filter((sc) => ['s1', 's2', 's3'].includes(sc.id)).map(({ momentIds: _m, link: _l, surface: _s, ...rest }) => rest) })),
  }
}

describe('user journey map', () => {
  it('starts with four stages, ten moments and six screens', () => {
    expect(JourneyMapSchema.safeParse(INITIAL_JOURNEY).success).toBe(true)
    expect(counts(INITIAL_JOURNEY)).toEqual({ stages: 4, moments: 10, screens: 6 })
  })

  it('adds, edits and removes an item without touching other stages', () => {
    let map = addItem(INITIAL_JOURNEY, 'share', 'screens', 'x1')
    expect(counts(map).screens).toBe(7)
    const added = map.stages[3].screens[2]
    map = updateItem(map, 'share', 'screens', { ...added, title: 'Recap card' })
    expect(map.stages[3].screens[2].title).toBe('Recap card')
    expect(map.stages[0]).toBe(INITIAL_JOURNEY.stages[0])
    map = removeItem(map, 'share', 'screens', 'x1')
    expect(counts(map).screens).toBe(6)
  })

  it('keeps a stage title when the new one is blank', () => {
    const map = updateStage(INITIAL_JOURNEY, 'reflect', { title: '  ', question: 'When?' })
    expect(map.stages[0].title).toBe('Reflect')
    expect(map.stages[0].question).toBe('When?')
  })

  it('imports its own export and the original blueprint format', () => {
    expect(parseImport(JSON.stringify(INITIAL_JOURNEY))).toEqual(INITIAL_JOURNEY)
    const legacy = {
      version: 2,
      stages: [{ id: 'reflect', title: 'Reflect', question: 'Q', color: '#000', scenes: [{ id: 'r1', title: 'A', image: 'assets/scene-01.webp' }], screens: [] }],
    }
    const map = parseImport(JSON.stringify(legacy))
    expect(map?.stages[0].moments[0]).toEqual({ id: 'r1', title: 'A', description: '', feature: '', image: '/admin/user-journey/scene-01.webp' })
    expect(parseImport('{"stages": []}')).toBeNull()
    expect(parseImport('not json')).toBeNull()
  })

  it('still reads a map saved before screens had moments or a link, edits intact', () => {
    const old = oldShape()
    old.stages[0].screens[0].title = 'My edited check-in'
    const parsed = JourneyMapSchema.safeParse(JSON.parse(JSON.stringify(old)))
    expect(parsed.success).toBe(true)
    expect(parsed.data?.stages[0].screens[0].title).toBe('My edited check-in')
    expect(parsed.data?.stages[0].screens[0].momentIds).toBeUndefined()
    expect(parseImport(JSON.stringify(old))?.stages[0].screens[0].title).toBe('My edited check-in')
    expect(parseAnyImport(JSON.stringify(toBundle(old)))?.journey?.stages[0].screens[0].title).toBe('My edited check-in')
  })

  it('links the bundled screens only to moments that exist', () => {
    const ids = new Set(allMoments(INITIAL_JOURNEY).map((m) => m.moment.id))
    const screens = INITIAL_JOURNEY.stages.flatMap((s) => s.screens)
    for (const sc of screens) {
      expect(sc.momentIds?.length).toBeGreaterThan(0)
      for (const id of sc.momentIds ?? []) expect(ids.has(id)).toBe(true)
    }
    expect(screensFor(INITIAL_JOURNEY, 'r1').map((x) => x.screen.id)).toEqual(['s1'])
    expect(screensFor(INITIAL_JOURNEY, 'e3').map((x) => x.screen.id)).toEqual(['s4'])
  })

  it('links and unlinks a screen to moments in any stage', () => {
    const s1 = INITIAL_JOURNEY.stages[0].screens[0]
    const linked = toggleMoment(s1, 'h1', true)
    expect(linked.momentIds).toEqual(['r1', 'r2', 'h1'])
    expect(toggleMoment(linked, 'h1', true).momentIds).toEqual(['r1', 'r2', 'h1'])
    expect(toggleMoment(linked, 'r1', false).momentIds).toEqual(['r2', 'h1'])
    expect(toggleMoment({ ...s1, momentIds: undefined }, 'c1', true).momentIds).toEqual(['c1'])
    const map = updateItem(INITIAL_JOURNEY, 'reflect', 'screens', linked)
    expect(screensFor(map, 'h1')).toContainEqual({ stageId: 'reflect', screen: linked })
  })

  it('removes a deleted moment from every screen, and ignores links to moments that are gone', () => {
    let map = updateItem(INITIAL_JOURNEY, 'create', 'screens', { ...INITIAL_JOURNEY.stages[1].screens[0], momentIds: ['c1', 'c2', 'e2'] })
    map = removeItem(map, 'experience', 'moments', 'e2')
    expect(servedMoments(map, map.stages[1].screens[0])).toEqual(['c1', 'c2'])
    map = unlinkMoment(map, 'e2')
    expect(map.stages[1].screens[0].momentIds).toEqual(['c1', 'c2'])
    expect(map.stages[2].screens[0].momentIds).toEqual(['e1', 'e4', 'e5'])
    expect(map.stages[0]).toBe(INITIAL_JOURNEY.stages[0])
    expect(unlinkMoment(map, 'nothing')).toBe(map)
  })

  it('round-trips the new fields through export and import', () => {
    const map = updateItem(INITIAL_JOURNEY, 'reflect', 'screens', { ...INITIAL_JOURNEY.stages[0].screens[0], link: '/wellness' })
    expect(parseAnyImport(JSON.stringify(toBundle(map)))?.journey).toEqual(map)
    expect(parseImport(JSON.stringify(map))).toEqual(map)
  })

  it('opens only app routes and http(s) links', () => {
    expect(linkHref(' /play/morning ')).toBe('/play/morning')
    expect(linkHref('https://www.figma.com/design/abc')).toBe('https://www.figma.com/design/abc')
    expect(linkHref('//evil.example')).toBeNull()
    expect(linkHref('javascript:alert(1)')).toBeNull()
    expect(linkHref('')).toBeNull()
    expect(linkHref(undefined)).toBeNull()
  })

  it('ties screens to the Product surface tag (U105)', () => {
    const surfaces = new Set(INITIAL_JOURNEY.stages.flatMap((st) => st.screens.map((sc) => sc.surface)))
    expect([...surfaces].sort()).toEqual(['chat', 'checkin', 'journal', 'player', 'progress', 'share'])
    expect(surfacesOf(['time:night', 'surface:player', 'surface:journal'])).toEqual(['player', 'journal'])
    expect(screensOnSurfaces(INITIAL_JOURNEY, ['player']).map((x) => x.screen.id)).toEqual(['s3'])
    expect(screensOnSurfaces(INITIAL_JOURNEY, ['progress', 'share']).map((x) => x.screen.id)).toEqual(['s5', 's6'])
  })

  it('upgrades a map saved before surfaces, keeping its edits', () => {
    const old = oldShape()
    old.stages[0].screens[0].title = 'My edited check-in'
    const up = upgradeJourney(JourneyMapSchema.parse(JSON.parse(JSON.stringify(old))))
    expect(up.stages[0].screens[0]).toMatchObject({ title: 'My edited check-in', surface: 'checkin' })
    expect(counts(up).screens).toBe(6)
    expect(upgradeJourney(up)).toEqual(up)
    expect(upgradeJourney(INITIAL_JOURNEY)).toEqual(INITIAL_JOURNEY)
  })
})
