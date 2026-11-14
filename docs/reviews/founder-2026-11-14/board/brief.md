# Board brief: Aurelia, and the three versions on production

# Aurelia

- **What it is:** a generative wellness companion. A person says in one sentence how they feel or what they need ("I can't fall asleep, my mind keeps racing"), and Aurelia builds a personal audio-visual session for it: a guided script, a voice, a soundscape and visuals. They listen, tell Aurelia what to change, and come back to a five-chapter journey that adapts to how they say they feel.
- **Who it is for:** the self-directed seeker. Adults, mostly 25 to 45, who open a wellness app when something is off (cannot sleep, stressed before a meeting, a foggy head) and do not want to scroll a library to find the right thing. Secondary: people who like to share what they made (sessions can be published and recreated, the creator credited).
- **What it sells, at what price:** freemium subscription. The app's Upgrade screen shows $10 a month or $100 a year. The free limit counts builds, not messages; the API contract's default is 5 builds a day free, Plus 30 a day with 20-minute sessions and all voices, Pro unlimited within fair use. A coin currency exists (earned through referrals). Final pricing is not decided by the business owner.
- **Where and how:** online, a web app today (mobile web and desktop), a Flutter mobile app in progress. Delivered as streamed sessions. No marketing channel is set yet; a 30-person, eight-week feedback-group study is being prepared to prove the product helps with one real problem (e.g. bad sleep to good sleep).
- **Budget and constraints:** pre-launch. The app runs on realistic sample data; there is no backend yet. A 2025 AI system (a causal "Wellness State Graph" of ~4,000 knowledge points and ~120,000 weighted links, with building blocks for goals, techniques and script elements, and a feedback loop that learns which elements help which person) was designed and coded in 2025 and is being reworked for this product. Budget, team size and AI cost per session are not stated.

## The three versions on production being tested

Production lets a visitor pick one of three designs. All three include the latest features (a chapter card on Home, personal journey stories, a daily check-in on each sign-in, the simplified player, the redesigned analysis, the session's About page with a Journal).

- **Version 1 (the earliest still offered):** a drawer menu; Home led by "Create the space you imagine", an Ask field, quick-start chips and cards, marketing blocks below. The chat builds sessions; a "+" sheet lists the changes with a summary of what you will get before you apply; every build is kept in the conversation (v1.2, v1.3…). No onboarding. Progress shows analytics cards.
- **Version 2:** everything in v1, plus a three-question onboarding after the first sign-in (goal, feeling, how sessions should sound; every step skippable), a first session built from the person's own words, a five-chapter journey with "How do you feel now?" after listening, and four bottom tabs (Create, Discover, Progress, Me) instead of the drawer. Coins only shown in Me. Progress still shows analytics cards.
- **Version 3 (the default):** everything in v2, reworked after three real user interviews: progress told in words from the person's own check-ins (no percentages, a short report every two weeks), a "Why?" on every suggested change, the wearable asked for in onboarding (Apple Watch, Whoop, Oura) and off until switched on, an optional journal, and a community about stories with no rankings. Visitor Home says "Sessions made for how you feel today."

## What the screens show (real captures of the production build, 402px phone width)

Contact sheets, one per version (open them with your image-reading tool):
- Version 1: /home/user/aureliamobile/docs/reviews/founder-2026-11-14/screens/sheet-v1.png
- Version 2: /home/user/aureliamobile/docs/reviews/founder-2026-11-14/screens/sheet-v2.png
- Version 3: /home/user/aureliamobile/docs/reviews/founder-2026-11-14/screens/sheet-v3.png

Notes on what was captured, so you do not misread a screenshot:
- The player screen shows "Page not found" in the captures because the capture reloaded the page and sign-in does not persist on reload (a known, deliberate demo setting). In the app the player is a full-screen session with one play button and a cue under it.
- In Version 1, a new user's chat opens on a demo conversation ("Good morning, Adam… score improved by 7% due to increased REM sleep") that is not theirs. Versions 2 and 3 open a thread of the person's own.
- "Daily check-in" appears as a sheet on every sign-in in all three versions.
- All data in the app is sample data; no figure is a real measurement.

## Market context (public facts, with sources)
- Insight Timer: free library of 350,000 practices, "Free. No Ads. No AI."; premium US$59.99/year or US$9.99/month (App Store listing, https://apps.apple.com/us/app/insight-timer-meditation-app/id337472899). Its share of 1–2 star App Store reviews rose from 9% (2022) to 23% (2025), mostly over questions before listening, a paywall on rewind and streak pop-ups (Aurelia's own study of 2,000 reviews, 13 Nov 2026).
- Calm and Headspace are the paid market leaders (subscription apps). Their current prices are not checked here; treat any number for them as unknown.

## What the board is asked
Score the business as a whole, and say which of the three versions is the strongest first version to put in front of real users, and why.
