# Retreat-in-a-Box: what Eugene is actually asking for

**Received:** 23 Nov 2026, from the owner (J149).
- Two PDFs, kept beside this file:
  - `2026-11-23-retreat-in-a-box-po-spec.pdf` (PO specification and blueprint, v0.2.0);
  - `2026-11-23-retreat-in-a-box-functional-spec.pdf` (functional requirements and UI spec, v1.0).
- WhatsApp screenshots: the box mock-up, "So its commercially aligned", "Pls update the feedback Project in Wiki to this model", and a Google Doc link that is not readable from here.

**Read with:** `2026-11-23-eugene-freemium-state-transition.md` (J148) and O43.

---

## The goal in one sentence

Prove that Aurelia can be **sold as a paid, creator-led, 8-week "bad to good" retreat** that feeds Aurelia Plus. Before building it for real, have **an admin cockpit that makes that business visible** to the team, to creators and to investors.

## What the pieces are, read together

| What Eugene sent | What it really is |
| --- | --- |
| "Retreat-in-a-Box" with a physical box (a welcome card and a gold activation piece) | A **premium, giftable package** for an 8-week digital programme. The box makes a digital product feel like an occasion; the gold piece is presumably the activation code. |
| €19.99 ticket, cohorts of up to 200, 50 creators, 60/40 split | **A distribution model (B2B2C).** Wellness creators sell the retreat to their followers. Aurelia supplies the programme, the AI and the infrastructure. |
| Week 8 "Graduation and Aurelia Plus transition", 30% conversion | **The retreat is the top of the funnel.** The money is in the subscribers who stay after it. |
| Day 1 against Day 56 sleep and stress | **The proof that the state flip works.** This is the "bad to good" of the lighthouse and of J148's state-transition model. |
| "Creator-Led Cohort Engine" (the Gemini deck title) | The same idea, under the deck's name. |
| "Update the feedback project in the wiki", "commercially aligned" | **The feedback group becomes the first paid cohort.** The real-humans half of the dual track, priced and measured like the business. |
| The admin prototype (both PDFs) | **A cockpit for running and showing this business:** the creator network, adding a creator, the 8-week curriculum with the creator's voice, outcomes, conversion, payouts. |

**How it connects to what is already built:**
- The 8-week retreat is the state-transition freemium model (J148) given a fixed shape and a price.
- The feedback group and the buyer agents are its two validation tracks (J136, J140).
- The business funnel (O43) is its scoreboard.

## What a head of product should not take at face value

1. **"Aurelia's validated 8-week programme" is not validated.**
   - There is no backend, no paying user, and no 8-week programme in the app. The app has a five-chapter journey (`src/lib/journey.ts`).
   - Every KPI in the spec is a target or an invention: 8,450 participants, 31.4%, sleep 4.2 → 7.8 (+85.7%), stress −50%.
   - In a prototype they must be labelled as examples or targets. The app removed invented numbers on purpose (J049, U053).
   - "+85.7% sleep" is also a health claim.
2. **The spec's numbers disagree with each other.**
   - The 31.4% conversion is of *enrollees* (2,653 of 8,450). Of graduates (6,464) it would be 41%.
   - ARR €318,041 assumes €9.99 for everyone. The spec also gives graduates €7.99 for life, which makes it about €254,370.
   - The second PDF's plan, "444 cohort runs → 15,000 Plus subscribers", means about 34 subscribers per cohort, roughly 20% of a 169-person cohort, not 31%.
3. **The targets are optimistic against the research.**
   - Mental-health apps keep 3–5% of installs at day 30.
   - A paid, live, cohort format will do far better. But 76.5% still active at week 8, and 30% converting to a subscription, are best-case figures, not a plan.
   - This is exactly what the buyer agents and the feedback group should test first.
4. **The ticket is not the business.**
   - At 60/40, Aurelia keeps about €8 of €19.99 per seat. Before payment fees, 8 weeks of AI use, the box itself and its shipping, that is close to zero.
   - The model only works if graduates subscribe. So the 30% is the single most important assumption.
5. **The physical box is undefined.**
   - Is it for every participant, a premium tier, or a gift edition?
   - Who pays for production and shipping across 50 creators' countries?
   - It is not in either PDF, only in the WhatsApp image.
6. **Much of the spec is backend, not prototype.**
   - Stripe Connect, landing pages at `aurelia.app/retreat/[slug]`, WebSocket polling and PostgreSQL tables need a backend that does not exist.
   - Only the spec's own Sprint 1 (a UI shell and read-only dashboard with simulated data for 30–50 creators) can be built now.
7. **Design tokens and navigation.**
   - The spec asks for Playfair Display, Plus Jakarta Sans and its own colours, and a new navigation (Core Dashboard, People, Content & AI Studio, GROWTH…).
   - The admin already has its own design system and groups.
   - Proposed: follow ours. It is already espresso and cream, and close to his intent. Put the module under the existing Growth group.
8. **Safety stays fixed.** The spec keeps clinical guardrails active under the creator's "philosophy override". That is right, and it must not be negotiable per creator.

## Questions to put to Eugene before building

1. Who is the prototype for: internal, creators or investors? That decides how polished, and how labelled, the sample data is.
2. Do the 30 founding creators exist? Should the prototype use their real names, or invented ones?
3. The box: is it for every participant, or a premium edition? Is it included in €19.99?
4. Does €19.99 include Aurelia Plus access for the 8 weeks? The drawer says "Included 8-Week Access Mode".
5. What is the 8-week curriculum's relation to today's five-chapter journey: a longer journey, or a separate programme?

## Proposed order (for the owner to decide, O45)

1. **Prototype Sprint 1 in the admin, on staging:**
   - the network overview (KPI bar, platform filters, creator cards);
   - the "+ Handpick creator" drawer (UI only, no payments);
   - the 8-week curriculum view;
   - outcomes and conversion views.

   All on sample data marked as targets, in our design system.
2. **Buyer agent v5:** test the €19.99 retreat offer against plain freemium on the persona panel, with a creator-follower framing, using the J148 brief.
3. **The wiki feedback project:** rewrite it as the first paid cohort, on the dual track.
4. **Only after people and agents agree** that the retreat sells and graduates convert: the backend parts (payments, splits, landing pages).
