# AKP roast: v1 (1,046) and v2 (3,106)

U150, J208, 28 Nov 2026. Written for the product owner while the business owner is away. Every count below comes from `src/admin/data/akps.ts` (the generated catalogue, before admin edits) and `docs/akp/akps.json`. All AKPs are status **draft**; nothing here has been reviewed by him.

His needs, read first: EUGENE-CONTEXT §0 A24, A27, A29, A40, A41, A43, A45; the 27 Nov chats on chapters and AKPs, Objective Learning and the AI-brain prototype; the Objective Learning plan (marketing ReadMe types); the six workbooks in `docs/briefs/`.

---

## Part 1. Roast of v1 (the 1,046-AKP draft, U141–U149)

Four critics, one table at the end.

### 1. A sceptical head of product

- **Coverage is upside down against his prototype.** His Figma Make prototype counts Wellness 4,590, Brand 1,847, Product 1,970, Business 1,680 (10,087), plus Analysis (MicroBite "Maxwell" 4,870, TheraGPS "Governor" 10,497). v1 had Wellness 895, Product 104, Brand **0**, Business **0**, Analysis **0**, Identity 47. Two of his five functions (A40) did not exist as AKPs at all, and Product was 5% of his number.
- **Half the "wellness" count is padding.** 500 of the 895 wellness AKPs are goals: 125 StateFlips and their 375 X / Y / Z steps. The step names were generic: "X: first relief" appeared **124 times**, "Y: a routine that helps" **124 times**. A list where the most common name repeats 124 times is not a catalogue anyone can browse.
- **The Grand 4 layers sheet was only half read.** Script has nine layers in his sheet; v1 filled Concepts, Skills, Moods, Methods and Frameworks but left **Techniques (his estimate: 300 types), Archetypes (60), Styles & Tones (100) and Settings (80) with zero instances**. Music, image and video had 30–35 instances each against his 1,000+ types per modality.
- **No product logic layer.** The UI/UX sheet's own "Logic" tab (layer 0 input → 4 render) was not on any product AKP, so "product AKPs write high-precision features" (A45) had nothing to compute with.

### 2. A wellness clinician

- **No voice.** The narrator's voice (timbre, pace, warmth, breath, pause) is the most direct lever on arousal in a guided session, and it was not a family. Sleep chapter 1's four voice nodes were hand-drafted outside the catalogue.
- **Definitions were mostly sheet fragments.** "Calm", "Healer", "Binaural" with the layer name as description; no plain statement of what the piece *does* to a person, and no contraindication thinking (breath holds with panic, flicker with epilepsy, deep body focus after trauma).
- **Identity had dimensions, not values.** 12 Grand and 35 Light identity dimensions, but no values to match on ("prefers a low warm voice", "evening owl", "no breath holds"). A planner cannot match a chapter to "Voice Timbre Preference"; it needs the preference.
- **Duplicates across modalities read as noise:** "Calm" (WM-MES1, WV-ET1), "Healer" (WM-SPA3, WV-VA3), "Guardian", "Minimalist", "Emotional mastery" (three DOJO concepts), "Reflection".

### 3. An ML engineer

- **Not measurable.** No AKP said how its effect would be read. A tournament compares AKPs on a common outcome; without a signal per AKP (check-in delta, completion, HRV change, CTR…) there is nothing to rank on.
- **Thin, uneven graph.** 653 links over 1,046 AKPs; **393 AKPs had no link at all**; **404 strategy AKPs served no StateFlip**. Music, image and video reached only 12–13 of the 125 StateFlips each, so **113 StateFlips could not assemble a chapter** with music, image and voice.
- **IDs leak collisions.** Media IDs come from layer initials; "Visual Methods" and "Visual Mechanisms" share the code VM, so `WI-VM1…` cannot tell you its layer. Kept stable (renaming would break his references), but new rows must not repeat it.
- **No measure kind.** Analysis signals would have been "strategy" AKPs and counted as coverage.

### 4. The business owner himself (reading his own words back)

- "Each function its own AKP universe and causal network" (A40): only Wellness and Product had one.
- "Product, Business, Wellness, Brand… each need AKP depth like the prototype" (A43): Business and Brand had zero.
- "AKPs as predefined lego pieces first, AI improves them later" (A41): the pieces were there, but no rule put them together into a chapter for a person.
- "Use 10,087 AKPs to identify the minimum viable feature set": we could not run a feature or offer test that *used* AKPs.

### v1 against his needs

| His need | v1 | Fix in v2 |
| --- | --- | --- |
| A24 understand AKPs, entities and tournaments | partly: catalogue and graph, no measurable signal | a `signal` on every v2 AKP; a `measure` kind for Analysis |
| A27 5 dimensions → needs → StateFlips (goal AKPs) linked to strategy/tactic AKPs and script building | partly: 404 strategy AKPs linked to no StateFlip, 113 StateFlips without music or image | every wellness strategy AKP serves a StateFlip; every StateFlip has script, voice, music and image |
| A29 125 StateFlips used to make sessions and chapters | not: no chapter could be assembled from the catalogue | `chapterKit` for all 125; `personalChapter` for a person (used in buyer test 9) |
| A40 five functions, each its own AKP universe | not: Brand, Business, Analysis empty | Business 304, Brand 400 (pending his sheet), Analysis 205 |
| A41 predefined lego pieces first | partly: pieces, no assembly | assembly rules written out (`akpAssembly.ts`) |
| A43 AKP depth like the prototype per function | not: Product 104 vs 1,970; Business and Brand 0 | Product 596 incl. 5 drafted dimensions to make 18; still short (see Part 3) |
| A45 product AKPs write high-precision features | partly: 104 sheet AKPs, no logic layer, not tied to screens | logic layer 0–4 on every product AKP; 312 sheet AKPs applied to our 8 screens |
| His prototype's voice / music / image / script chapter (20 AKPs, 30 links) | partly: voice drafted outside the catalogue | voice family (WN-, 114); the sleep chapter graph now uses catalogue voice AKPs only |
| Marketing ReadMe types (40 goals … 150 knobs) | not | all 13 types drafted (BR-, 400), labelled pending his sheet |
| No duplicates, stable IDs | not: 124× repeated step names, cross-family duplicates | every name unique (normalised); v1 IDs unchanged (tested) |

---

## Part 2. What v2 did

`scripts/akp/extract.py` now writes a `v2` table into `generated/akpSource.ts` (1,945 rows, each with id, name, family, layer, modality, plain definition, used for, helps, causal role, measurable signal, typed links and source). `akps.ts` turns them into AKPs, skips the 10 whose name a v1 AKP of the same family already has, adds one check-in marker per StateFlip (AN-CK-, 125) and runs four clean-up passes over the whole catalogue: unique names, chapter-assemblable StateFlips, a StateFlip for every wellness strategy AKP, and at least one typed link on every AKP. No v1 ID changed.

| Function | His prototype | v1 | v2 |
| --- | ---: | ---: | ---: |
| Wellness (goal, script, voice, music, image, video) | 4,590 | 895 | 1,443 |
| Product | 1,970 | 104 | 596 |
| Business | 1,680 | 0 | 304 |
| Brand | 1,847 | 0 | 400 |
| Analysis (Maxwell + TheraGPS) | 4,870 + 10,497 | 0 | 205 |
| Identity (not a prototype function) | — | 47 | 158 |
| **Total** | 10,087 (+15,367) | **1,046** | **3,106** |

| Family | v1 | v2 | Where the new ones come from |
| --- | ---: | ---: | --- |
| goal (WG) | 500 | 500 | unchanged; step names now carry their StateFlip |
| script (WS) | 300 | 410 | Grand 4 layers' empty Script layers: 71 techniques, 12 archetypes, 12 styles and tones, 15 settings |
| voice (WN) | 0 | 114 | TTS parameters: timbre, pace, warmth, breath, pause, pitch, dynamics, persona, language, presentation, prosody, structure, TTS controls, 20 presets |
| music (WM) | 35 | 173 | instances of all ten music layers: tempi 40–120 BPM, instruments, modes, binaural bands, noise colours, techniques, environments |
| image (WI) | 30 | 138 | instances of the image layers plus 12 colour palettes |
| video (WV) | 30 | 108 | instances of the video layers |
| identity (ID) | 47 | 158 | values of 30 Light sub-dimensions (voice, tempo, colour, length, chronotype, regulation, contraindications…) |
| product (PR) | 104 | 596 | 130 more in the 13 sheet dimensions (sheet IDs continued, e.g. UO9), 50 in five drafted dimensions to make his 18, 312 sheet AKPs applied to our screens (e.g. PR-UM1-PLY) |
| business (BZ) | 0 | 304 | funnel stages, 20 B2B2C channels, 20 prices, 30 retention levers, 20 unit-economics metrics, 15 B2B features, 15 objection answers, 15 experiments, 160 channel × stage plays |
| brand (BR) | 0 | 400 | his 13 ReadMe types, 20–60 each |
| analysis (AN) | 0 | 205 | 40 Maxwell resonance and micro-detail signals, 40 TheraGPS precision signals, 125 per-StateFlip check-in markers |

Links: 653 → 3,266 (feeds 846, drives 755, part-of 644, step-of 375, fed-by 221, measures 205, mirrors 180, supports 40). AKPs with no link: 393 → 0. StateFlips that can assemble a chapter (script, voice, music and image): 0 → 125 (v1 had no voice family; music and image reached about 12 StateFlips).

---

## Part 3. Roast of v2 (honest)

Same four critics, re-scored.

**Head of product.** Better shaped, still not his size. 3,106 is 31% of his 10,087 and 12% if Analysis is counted. Product (596) and Business (304) are a third and a fifth of his prototype. **Half of the Product growth is combinatorial**: 312 of the 492 new product AKPs are "sheet AKP × screen" (e.g. *Progressive Disclosure on Player*). They are concrete, but they are applications, not new knowledge. The same goes for the 160 business "channel × stage plays". His 18 product dimensions: we have 13 from the sheet and **5 named by us** (Accessibility, Trust & Safety, Data & Privacy, Personalisation Engine, Monetisation Surfaces); his list of 18 has not arrived and may differ.

**Clinician.** Voice, techniques and contraindications are now in, and the assembly avoids breath holds for people with worry or panic. But **about 1,400 of the 1,935 new definitions are templated** ("Musical Techniques (music): Reverb bloom.") where the list gave no line of its own. Only the techniques, presets and some voice items have a real one-sentence definition. Nothing carries an evidence level, a dose or a contraindication flag of its own yet; the contraindication values sit in Identity, and only the assembly rules read them.

**ML engineer.** Every v2 AKP has a measurable signal, but the signals are written per family, not per AKP (all music AKPs share one sentence). The graph is complete but **mostly drafted by rule**: of 943 wellness strategy AKPs, only **263 reach a StateFlip by shared words**; the rest were given the least-used StateFlip so every StateFlip has a chapter. That rotation guarantees coverage, not fit; a reviewer should replace it. Median 9 strategy AKPs per StateFlip (sleep has 124), so most StateFlips can assemble one chapter but cannot yet run a tournament with several candidates per slot. Brand and business links come from word overlap with a round-robin fallback. Maxwell has 40 signals against his 4,870, and no learned weights: those need real outcomes.

**Business owner.** Five functions now each have an AKP universe (A40), Brand and Business exist (A43), the lego pieces can be put together for a person (A41) and used in a buyer test. What he asked for and still does not have: his own marketing sheet (Brand is ours, labelled pending), his 120,000 real AKPs (A24), and a tournament that has actually ranked anything.

### v2 re-scored against his needs

| His need | v1 | v2 | Still weak, and why |
| --- | --- | --- | --- |
| A24 AKPs, entities, tournaments | partly | partly | Every AKP is measurable on paper; no tournament has run, signals are per family. |
| A27 needs → StateFlips → strategy AKPs → script | partly | met (draft) | 72% of the wellness links are by rotation, not meaning. |
| A29 125 StateFlips make chapters | not | met (floor) | One chapter each; few alternatives per slot outside sleep. |
| A40 five functions, own AKP universe | not | partly | All five exist; Brand drafted from his ReadMe, not his sheet; Analysis 205 vs 15,367. |
| A41 lego pieces first, assembled by rule | partly | met (draft) | Rules are ours and simple; reviewed by nobody. |
| A43 depth like the prototype | not | partly | 31% of his total; Product and Business inflated by combinations. |
| A45 product AKPs write features | partly | partly | Logic layer and screens added; 5 of 18 dimensions are our guess. |
| Voice / music / image / script per chapter | partly | met | Voice is a full family; the sleep chapter graph is all catalogue. |
| Marketing ReadMe types | not | partly | All 13 types, at about a quarter of his counts. |
| No duplicates, stable IDs | not | met | Tested: unique names, v1 IDs present, links valid. |

**Score: v1 met 0, partly 5, not 5. v2 met 5, partly 5, not 0.** "Met" here means met as a draft we can show him, not approved.

### What would move it next

1. His marketing sheet, to replace the 400 drafted Brand AKPs.
2. His list of 18 product dimensions, to replace our five.
3. A clinician pass on the 263 word-matched and ~680 rotated wellness links, and per-AKP definitions for the templated 1,400.
4. Real check-ins from the feedback group, so the per-StateFlip markers (AN-CK) and Maxwell signals score something and a first tournament can run on sleep.
