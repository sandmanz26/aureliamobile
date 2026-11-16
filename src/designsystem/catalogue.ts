// Every component in src/components, grouped into the patterns they belong to,
// for /designsystem. `catalogue.test.ts` fails when a component file is added
// without an entry here, so the catalogue cannot quietly fall behind the code.
// Props are not written here: the page reads them from each file's source.

export interface Pattern {
  id: string
  name: string
  /** When to reach for this pattern, in one or two sentences. */
  guidance: string
  /** Rules every component in the pattern follows. */
  rules: string[]
}

export interface CatalogueEntry {
  /** Path under src/components, e.g. "ui/Button.tsx". */
  file: string
  name: string
  pattern: string
  purpose: string
  useWhen: string
  /** Variants and states worth knowing before using it. */
  states: string[]
  /** Where it appears in the app (routes or screens). */
  where: string
  /** Figma node, when the code names one. */
  figma?: string
}

export const PATTERNS: Pattern[] = [
  { id: 'actions', name: 'Actions and controls', guidance: 'Anything a person taps to do something or choose between a few things.', rules: ['One primary button per view; everything else is secondary or ghost.', 'A selected chip is filled espresso; an unselected one is an outline, never a grey fill.', 'Disabled uses button/disabled tokens, never lowered opacity.'] },
  { id: 'inputs', name: 'Inputs', guidance: 'Where a person types or speaks. Aurelia’s main input is one sentence about how they feel.', rules: ['Pill-shaped fields on surface/default with a border/default hairline.', 'Voice is always offered beside typing, never instead of it.', 'Never ask before the first session what could be asked after it.'] },
  { id: 'navigation', name: 'Navigation', guidance: 'Moving between the four core places: Create, Discover, Progress and Me.', rules: ['Below lg: four bottom tabs (design v4+). At lg and above: the sidebar names the same four.', 'A turned-off module stays listed but inert, so the map never changes shape.'] },
  { id: 'content', name: 'Cards and content', guidance: 'Showing sessions, journeys and their details. Every card layers a photo over a token gradient.', rules: ['The gradient is the floor, not a fallback: a card without network still looks finished.', 'Covers fill their parent: anything on top needs `relative`.', 'One card shadow for every surface (0 5px 24px 4px, black 5%).'] },
  { id: 'sheets', name: 'Sheets and overlays', guidance: 'A focused task on top of the current screen: share, rename, pick, review, check in.', rules: ['Always rendered through a portal, because routed pages animate with a transform.', 'A grab handle, close on drag-down or flick, Escape and a Close button.', 'Picking something that ends the task closes the sheet.'] },
  { id: 'cockpit', name: 'Cockpit (chat)', guidance: 'Where sessions are made: the conversation, the proposals, the build and the player docked in the header.', rules: ['The thread is where the product happens; an empty one must say what the field is for.', 'Proposals arrive applied; the person takes away what they do not want.', 'The product speaking about itself (limits, errors) sits above the composer, not in the thread.'] },
  { id: 'progress', name: 'Progress and wellness', guidance: 'How someone is doing: check-ins, the journal, chapters and progress told in words.', rules: ['From design v5: progress in words from the person’s own check-ins, no invented percentages.', 'A score is never shown that nobody measured.', 'Days still to come are greyed and not selectable.'] },
  { id: 'feedback', name: 'Loading, status and motion', guidance: 'What the app shows while something loads, changes or goes offline.', rules: ['Skeletons mirror the shape of what is coming, never a spinner on a blank page.', 'All motion respects “reduce motion”.', 'Offline is a note, not a blocker: the app keeps working.'] },
  { id: 'brand', name: 'Brand and identity', guidance: 'The logo, Aurelia’s own icons and the build badge.', rules: ['The real exported artwork only; never redrawn.', 'Icons take currentColor, so they follow the text colour where they sit.'] },
  { id: 'plumbing', name: 'App plumbing', guidance: 'Components with little or no visual design of their own that every screen relies on.', rules: ['Not reused as visual building blocks.'] },
]

export const CATALOGUE: CatalogueEntry[] = [
  // Actions and controls
  { file: 'ui/Button.tsx', name: 'Button', pattern: 'actions', purpose: 'The app’s button, mapped 1:1 to the button/* tokens.', useWhen: 'Any action. Primary for the one main action of a view.', states: ['primary', 'secondary', 'ghost', 'hover', 'pressed', 'disabled', 'with icon'], where: 'Everywhere' },
  { file: 'ui/Chip.tsx', name: 'Chip', pattern: 'actions', purpose: 'The filter pill shared by every row of filters.', useWhen: 'Filtering a list by one value.', states: ['unselected (outline)', 'selected (filled)'], where: 'Home, Discover, See All', figma: 'Tab Set_notClear 16538:21547' },
  { file: 'ui/SegmentedControl.tsx', name: 'SegmentedControl', pattern: 'actions', purpose: 'One choice out of two to four options in a single track.', useWhen: 'Switching a view (Monthly / Annual, Day / Week).', states: ['one option selected'], where: 'Upgrade, Progress' },
  { file: 'chat/FilterChips.tsx', name: 'FilterChips', pattern: 'actions', purpose: 'The “+” sheet’s filter: All, Visual, Sound, Movement, Selected, with counts and a sliding highlight.', useWhen: 'Filtering the list of changes in the cockpit.', states: ['a kind at 0 is not offered', 'sliding highlight'], where: 'Chat → “+” sheet' },
  { file: 'ui/CoinPill.tsx', name: 'CoinPill / CoinMark', pattern: 'actions', purpose: 'The coin balance as one object, and a control that opens Credits.', useWhen: 'Showing the balance (from v4 only in Me, Invite and a challenge).', states: ['interactive', 'static', 'always (shown in v4+)'], where: 'Me, Invite, Challenges' },

  // Inputs
  { file: 'ui/TextField.tsx', name: 'TextField', pattern: 'inputs', purpose: 'A pill text input with an optional leading icon and trailing slot.', useWhen: 'Search and short single-line input.', states: ['empty', 'filled', 'focus', 'with icon'], where: 'Search, sign-in, settings' },
  { file: 'chat/ChatComposer.tsx', name: 'ChatComposer', pattern: 'inputs', purpose: 'The cockpit’s input: plus, field, voice orb, send.', useWhen: 'Only in the chat.', states: ['empty', 'typing', 'replying to a message', 'disabled', 'voice unavailable'], where: 'Chat', figma: 'Container' },
  { file: 'chat/VoiceRecorder.tsx', name: 'VoiceRecorder', pattern: 'inputs', purpose: 'Recording a voice message, with Pause / Play and send.', useWhen: 'When someone would rather speak than type.', states: ['recording', 'paused', 'cancelled'], where: 'Chat' },

  // Navigation
  { file: 'ui/TabBar.tsx', name: 'TabBar', pattern: 'navigation', purpose: 'Four bottom tabs for the four core features (design v4+).', useWhen: 'Below lg on every main screen.', states: ['active tab', 'notification dot on Me', 'hidden in chat and sheets'], where: 'Create, Discover, Progress, Me' },
  { file: 'ui/NavItem.tsx', name: 'NavItem', pattern: 'navigation', purpose: 'One row of the drawer or desktop sidebar.', useWhen: 'Menu lists.', states: ['active', 'disabled (module off)', 'end (exact match)'], where: 'Drawer, desktop sidebar', figma: 'Menu List Item (16651:12647)' },

  // Cards and content
  { file: 'ui/FeatureCard.tsx', name: 'FeatureCard', pattern: 'content', purpose: 'A benefit with an icon, a title and one line.', useWhen: 'Explaining what Aurelia does on marketing surfaces.', states: ['default'], where: 'Home (signed out)' },
  { file: 'ui/SessionGridCard.tsx', name: 'SessionGridCard', pattern: 'content', purpose: 'The tall session card: leads with Play and credits the creator by face.', useWhen: 'Grids of sessions.', states: ['with or without author', 'guarded (asks to sign in)'], where: 'See All, challenge shelf, profile' },
  { file: 'journeys/JourneyCard.tsx', name: 'JourneyCard', pattern: 'content', purpose: 'A personal journey story: photo under a dark gradient, the story’s words as the title.', useWhen: 'The Personal Journeys shelf.', states: ['loading (gradient floor)', 'loaded'], where: 'Discover, /journeys', figma: '16906:5645' },
  { file: 'ui/CoverImage.tsx', name: 'CoverImage', pattern: 'content', purpose: 'A photo over its gradient floor, with an optional scrim.', useWhen: 'Inside any card that has a cover.', states: ['loading', 'loaded', 'failed (gradient only)'], where: 'Every card' },
  { file: 'ui/PhotoCircle.tsx', name: 'PhotoCircle', pattern: 'content', purpose: 'The round counterpart to CoverImage, for avatars.', useWhen: 'Creator and author portraits.', states: ['loading', 'loaded', 'failed'], where: 'Cards, profiles, lineage' },
  { file: 'ui/TagRow.tsx', name: 'TagRow', pattern: 'content', purpose: 'Topic tags, wrapped, with the overflow folded into “+N”.', useWhen: 'A session’s topics.', states: ['under the limit', 'folded'], where: 'Session details, Progress' },
  { file: 'ui/Accordion.tsx', name: 'Accordion', pattern: 'content', purpose: 'Sections that open and close, one or more at a time.', useWhen: 'Long detail a person may not need.', states: ['closed', 'open', 'default open'], where: 'Help, Analysis' },
  { file: 'ui/SessionDetails.tsx', name: 'SessionDetails', pattern: 'content', purpose: 'When a session went public and which cut is live.', useWhen: 'Session detail and settings.', states: ['draft', 'published'], where: 'Session details' },
  { file: 'ui/LineageTreeCard.tsx', name: 'LineageTreeCard / LineageSheet', pattern: 'content', purpose: 'Who a session was recreated from, as a short tree, with See All in a sheet.', useWhen: 'Crediting originals on a recreated session.', states: ['three rows', 'see all (sheet)'], where: 'Session details' },
  { file: 'chat/AttachedSession.tsx', name: 'AttachedSession', pattern: 'content', purpose: 'The original a recreate is being made from, shown and playable in the thread.', useWhen: 'Recreate flows in the chat.', states: ['default'], where: 'Chat (recreate)' },

  // Sheets and overlays
  { file: 'ui/ShareSheet.tsx', name: 'ShareSheet', pattern: 'sheets', purpose: 'Share a session: WhatsApp, X, Facebook, Telegram, LinkedIn, Email, Copy link, More.', useWhen: 'Any share action.', states: ['link copied'], where: 'Player, session details' },
  { file: 'ui/CategorySheet.tsx', name: 'CategorySheet', pattern: 'sheets', purpose: 'All categories as a list, the one in force marked.', useWhen: 'When the chip row cannot show every category.', states: ['one selected'], where: 'Home, Discover', figma: '16523:18461' },
  { file: 'ui/ObjectiveSheet.tsx', name: 'ObjectiveSheet', pattern: 'sheets', purpose: 'Edit a session’s objective.', useWhen: 'The pencil on the Objective card.', states: ['editing', 'saved'], where: 'Session → About', figma: '16659:41284' },
  { file: 'ui/RenameSessionSheet.tsx', name: 'RenameSessionSheet', pattern: 'sheets', purpose: 'Rename a session.', useWhen: 'The pencil on Session settings’ title.', states: ['editing', 'saved'], where: 'Session settings', figma: '16883:13096' },
  { file: 'ui/RewardsSheet.tsx', name: 'RewardsSheet', pattern: 'sheets', purpose: 'A challenge’s rewards.', useWhen: 'Opening rewards on a challenge.', states: ['default'], where: 'Challenge detail' },
  { file: 'chat/AddSheet.tsx', name: 'AddSheet', pattern: 'sheets', purpose: 'The “+” sheet: every change you can make to a session, with a summary of what you will get.', useWhen: 'Changing a session in the chat.', states: ['filtered', 'items selected', 'summary (v3+)', 'proposals first (v4+)'], where: 'Chat' },
  { file: 'chat/ReviewSheet.tsx', name: 'ReviewSheet', pattern: 'sheets', purpose: '“Change this session”: the changes and experiments for a chapter, with Apply.', useWhen: 'Reviewing a chapter before building it.', states: ['changes on or off', 'experiments picked'], where: 'Chat' },
  { file: 'chat/PublishSheet.tsx', name: 'PublishSheet', pattern: 'sheets', purpose: 'Publishing, published and unpublishing a session.', useWhen: 'Publish from the chat.', states: ['publishing (brand ring)', 'published (green)', 'unpublished'], where: 'Chat', figma: 'Chat: Publish' },
  { file: 'daily/DailyCheckInSheet.tsx', name: 'DailyCheckInSheet', pattern: 'sheets', purpose: 'The daily check-in: mood, whether yesterday’s session helped, a note.', useWhen: 'After sign-in (a demo rule), or from the Journal.', states: ['empty', 'prefilled with today', 'saved'], where: 'After sign-in, Journal', figma: '16906:5362' },

  // Cockpit
  { file: 'chat/ChatHeader.tsx', name: 'ChatHeader', pattern: 'cockpit', purpose: 'The chat’s top bar: back or menu, coin, insights and more.', useWhen: 'Only in the chat.', states: ['v1–v3 menu', 'v4+ back'], where: 'Chat' },
  { file: 'chat/ChatMessageItem.tsx', name: 'ChatMessageItem', pattern: 'cockpit', purpose: 'One message in the thread, from the person or from Aurelia.', useWhen: 'The thread.', states: ['person', 'Aurelia', 'with proposals', 'with a chapter card', 'sending / sent / read'], where: 'Chat' },
  { file: 'chat/EmptyThread.tsx', name: 'EmptyThread', pattern: 'cockpit', purpose: 'A new thread: Aurelia present and waiting, asking what you are creating today.', useWhen: 'A conversation with nothing in it yet.', states: ['default'], where: 'Chat' },
  { file: 'chat/RecommendationCard.tsx', name: 'RecommendationCard', pattern: 'cockpit', purpose: 'One proposed change, on the brand gradient hairline.', useWhen: 'Inside the recommendation deck.', states: ['on', 'off', 'locked while building'], where: 'Chat', figma: 'Frame 45 (16809:4992)' },
  { file: 'chat/RecommendationDeck.tsx', name: 'RecommendationDeck', pattern: 'cockpit', purpose: 'The stacked proposals, opening the “+” sheet.', useWhen: 'Showing Aurelia’s proposals in a message.', states: ['collapsed', 'open'], where: 'Chat' },
  { file: 'chat/ChapterCard.tsx', name: 'ChapterCard', pattern: 'cockpit', purpose: 'The next chapter with its changes: Review changes or Apply.', useWhen: 'Proposing the next chapter.', states: ['ready', 'applying'], where: 'Chat' },
  { file: 'chat/SessionProgressCard.tsx', name: 'SessionProgressCard', pattern: 'cockpit', purpose: 'The original building state: a pill with the thumbnail and a percentage.', useWhen: 'Kept for the older design option.', states: ['building', 'done'], where: 'Chat (older option)', figma: 'Frame 10' },
  { file: 'chat/SessionProgressCardV2.tsx', name: 'SessionProgressCardV2', pattern: 'cockpit', purpose: 'The building state since U026: a morphing mark and a rotating status line.', useWhen: 'While a session is being built.', states: ['generating', 'ready'], where: 'Chat' },
  { file: 'chat/SessionReasoningCard.tsx', name: 'SessionReasoningCard', pattern: 'cockpit', purpose: 'Why a session was built the way it was.', useWhen: 'After a build, to explain it.', states: ['placeholder reasoning until a real one exists'], where: 'Chat' },
  { file: 'chat/RotatingStatus.tsx', name: 'RotatingStatus', pattern: 'cockpit', purpose: 'A status line that cycles through what the build is doing.', useWhen: 'Inside the building state.', states: ['cycling'], where: 'Chat' },
  { file: 'chat/GeneratingShape.tsx', name: 'GeneratingShape', pattern: 'cockpit', purpose: 'The 2×2 morphing mark traced from Figma’s spinner.', useWhen: 'Anything being generated.', states: ['animating', 'static with reduced motion'], where: 'Chat' },
  { file: 'chat/VoiceMessage.tsx', name: 'VoiceMessage', pattern: 'cockpit', purpose: 'A sent voice message: waveform, duration and transcript.', useWhen: 'In the thread after recording.', states: ['playing', 'paused'], where: 'Chat' },
  { file: 'chat/MiniPlayer.tsx', name: 'MiniPlayer', pattern: 'cockpit', purpose: 'The running session, docked in the chat header so playing is not leaving.', useWhen: 'While a session plays.', states: ['playing', 'paused'], where: 'Chat; floats elsewhere in v2+', figma: 'Chat: Play (16523:18533)' },
  { file: 'chat/FreeLimitNotice.tsx', name: 'FreeLimitNotice', pattern: 'cockpit', purpose: 'The free plan’s limit, above the composer.', useWhen: 'When free creations are used up.', states: ['limit reached', 'resets in N minutes'], where: 'Chat', figma: 'Free Limit' },

  // Progress and wellness
  { file: 'wellness/FeelingProgress.tsx', name: 'FeelingProgress', pattern: 'progress', purpose: 'Progress told in words from the person’s own check-ins (design v5).', useWhen: 'Progress → Your goals in v5.', states: ['before the first session', 'with check-ins', 'two-week report'], where: 'Progress' },
  { file: 'daily/WeekStrip.tsx', name: 'WeekStrip', pattern: 'progress', purpose: 'Mon–Sun with today framed; days to come greyed.', useWhen: 'Picking a day in the check-in or the journal.', states: ['today', 'selected', 'future (disabled)'], where: 'Daily check-in, Journal', figma: '16906:5374' },
  { file: 'daily/JournalView.tsx', name: 'JournalView', pattern: 'progress', purpose: 'The Journal tab: the week, then the chosen day’s three answers as cards.', useWhen: 'A session’s About → Journal.', states: ['day with answers', 'empty day'], where: 'Session → About → Journal', figma: '16906:5450' },
  { file: 'wellness/ChapterCheckIn.tsx', name: 'ChapterCheckIn', pattern: 'progress', purpose: '“How do you feel now?” after listening to your own chapter.', useWhen: 'The player sheet for your own sessions (v4+).', states: ['asking', 'answered', 'recent (not asked again)'], where: 'Player' },
  { file: 'wellness/NextChapterCard.tsx', name: 'NextChapterCard', pattern: 'progress', purpose: 'Home’s first block once you have a session: the next chapter.', useWhen: 'Signed-in Home with a journey.', states: ['ready', 'tomorrow'], where: 'Home' },
  { file: 'wellness/ProgressRing.tsx', name: 'ProgressRing', pattern: 'progress', purpose: 'A ring whose arc is the value, drawn from the number.', useWhen: 'Small or hero progress readouts.', states: ['gradient arc', 'solid arc', 'with inner content'], where: 'Analysis, cards' },
  { file: 'wellness/AlignmentGauge.tsx', name: 'AlignmentGauge', pattern: 'progress', purpose: 'A needle between “Challenging” and “Aligned”.', useWhen: 'Analytics (v1–v4).', states: ['0–100'], where: 'My Wellness → Analytics' },
  { file: 'wellness/AlignmentPanel.tsx', name: 'AlignmentPanel', pattern: 'progress', purpose: 'The gauge with before and after states stacked.', useWhen: 'Analytics (v1–v4).', states: ['default'], where: 'My Wellness → Analytics' },
  { file: 'wellness/AnalysisParts.tsx', name: 'AnalysisParts', pattern: 'progress', purpose: 'The pieces of the analysis page: status, trends, what helped, projections.', useWhen: 'The wellness analysis page.', states: ['improving', 'steady', 'declining'], where: 'Analysis' },
  { file: 'wellness/AnalyticsSessionCard.tsx', name: 'AnalyticsSessionCard', pattern: 'progress', purpose: 'One session’s analytics card on the brand gradient hairline.', useWhen: 'Analytics list (v1–v4).', states: ['default'], where: 'My Wellness → Analytics', figma: '16883:14859' },
  { file: 'wellness/SessionFeedback.tsx', name: 'SessionFeedback', pattern: 'progress', purpose: 'Feedback on a played session.', useWhen: 'After a session.', states: ['asking', 'thanked'], where: 'Player' },
  { file: 'wellness/WellnessObjectiveCard.tsx', name: 'WellnessObjectiveCard', pattern: 'progress', purpose: 'An objective with its progress, on My Wellness.', useWhen: 'Goals lists (v1–v4).', states: ['default'], where: 'My Wellness' },

  // Loading, status and motion
  { file: 'ui/Skeleton.tsx', name: 'Skeleton', pattern: 'feedback', purpose: 'A shimmering placeholder block, sized by its class.', useWhen: 'Anything still loading.', states: ['shimmer', 'static with reduced motion'], where: 'Everywhere' },
  { file: 'ui/PageSkeleton.tsx', name: 'PageSkeleton', pattern: 'feedback', purpose: 'The route fallback: a page header and body in outline.', useWhen: 'While a lazy screen loads.', states: ['default'], where: 'Every lazy route' },
  { file: 'ui/CountUp.tsx', name: 'CountUp', pattern: 'feedback', purpose: 'A number that counts up to its value, in compact form (1,323 · 87k).', useWhen: 'Balances and stat reads (v2+).', states: ['counting', 'final'], where: 'Credits, profile' },
  { file: 'ui/FlipWord.tsx', name: 'FlipWord', pattern: 'feedback', purpose: 'One word in a heading that cycles in place.', useWhen: 'Marketing headings.', states: ['cycling', 'static with reduced motion'], where: 'Home (signed out)' },
  { file: 'system/OfflineBanner.tsx', name: 'OfflineBanner', pattern: 'feedback', purpose: 'Says so when there is no connection; the app keeps working.', useWhen: 'Automatic.', states: ['offline', 'back online'], where: 'Every screen' },
  { file: 'system/UpdatePrompt.tsx', name: 'UpdatePrompt', pattern: 'feedback', purpose: 'A new build is ready: tap Reload. Never reloads mid-session on its own.', useWhen: 'Automatic.', states: ['update ready', 'offline ready'], where: 'Every screen' },

  // Brand and identity
  { file: 'ui/AureliaLogo.tsx', name: 'AureliaLogo', pattern: 'brand', purpose: 'The real exported logo: lockup, mark only, or white.', useWhen: 'Headers, sidebars, documents.', states: ['lockup', 'mark only', 'inverse'], where: 'Everywhere' },
  { file: 'ui/AureliaIcons.tsx', name: 'AureliaIcons', pattern: 'brand', purpose: 'Aurelia’s own icons as SVG components in currentColor.', useWhen: 'Where the design has its own icon; Lucide otherwise.', states: ['any size', 'any colour'], where: 'Chat header, tabs, notifications' },
  { file: 'ui/BuildBadge.tsx', name: 'BuildBadge', pattern: 'brand', purpose: 'Which site and which build: “Staging · 0.1.0 · abc1234”.', useWhen: 'The foot of the drawer, the admin sidebar, the console.', states: ['staging (brand chip)', 'production (grey)', 'dark'], where: 'Drawer, admin' },
  { file: 'ui/BuildStamp.tsx', name: 'BuildStamp', pattern: 'brand', purpose: 'What is actually running, stated on the page.', useWhen: 'Diagnosing “I pushed and cannot see it”.', states: ['default'], where: 'Console, settings' },
  { file: 'network3d/Network3D.tsx', name: 'Network3D', pattern: 'brand', purpose: 'Home’s network artwork as a live Three.js scene, off by default.', useWhen: 'Only with the 3D network flag.', states: ['loading (PNG)', 'scene', 'motion'], where: 'Home' },

  // App plumbing
  { file: 'ErrorBoundary.tsx', name: 'ErrorBoundary', pattern: 'plumbing', purpose: 'Catches a crash: root (last resort) and per route, resetting on navigation.', useWhen: 'Wrapping the app and routes.', states: ['fallback'], where: 'App root, routes' },
  { file: 'PageMeta.tsx', name: 'PageMeta', pattern: 'plumbing', purpose: 'A page’s title and description, hoisted into the head by React 19.', useWhen: 'Every page.', states: [], where: 'Every page' },
  { file: 'SiteLock.tsx', name: 'SiteLock', pattern: 'plumbing', purpose: 'The shared site password in front of everything except the console.', useWhen: 'Wrapping the app.', states: ['locked', 'unlocked'], where: 'Whole site' },
  { file: 'daily/DailyCheckInGate.tsx', name: 'DailyCheckInGate', pattern: 'plumbing', purpose: 'Opens the daily check-in after sign-in, and holds it on screens it would interrupt.', useWhen: 'Mounted once in the app.', states: ['pending', 'held', 'done'], where: 'After sign-in' },
]
