# Backend (old): what the 2025 system leaves us

Aurelia had a backend in 2025, built for a different product: wellness
professionals assembled **campaigns** from a taxonomy, and an AI wrote,
voiced and illustrated the script. Three documents describe it. This page
summarises them and lists **what we can take into today's product**.

> **No code came with them.** The three documents hold prompts, data shapes,
> a scoring rubric and infrastructure principles. They do not include a
> repository, endpoints, a database schema or keys. The wiki lists features
> as "implemented", so a 2025 codebase exists somewhere. Asking for it is
> open item O31.

The lessons the documents teach are in the next tab, **Artefact**.

## The three sources

| Source | What it is | Use it for |
| --- | --- | --- |
| **Technical Architecture Deep Dive** (Google Doc, 10 slides) | The vision: a "Wellness State Graph", causal inference, reinforcement learning, user embeddings, proprietary metrics | Direction only. Very little of it is visible in the prompts (see Artefact). |
| **Technical Architecture Documentation** (PDF, 6 pages) | Infrastructure principles: fault tolerance, scaling, provider-agnostic AI, job orchestration, monitoring | A checklist. Today's API contract already covers most of it. |
| **Wiki Aurelia** (Notion, 20 pages) | The prompts the backend actually used, with the data shapes they return | **The useful one.** Most of this page comes from it. |

What the documents reveal about the 2025 stack: Python (Pydantic models),
MongoDB (`MongoBase`, job state), Redis caching, Azure OpenAI and AWS
Bedrock behind one `LLMModel` interface, an embedding model, Luma AI (video
and thumbnails), Beatoven.ai (music) and a text-to-speech service.

## How the 2025 system worked

```
Creator picks a campaign setup
  Chakra/Need → Concept → Skill → Mood → State, Method → Technique,
  Framework, Style, Character, Setting, Agents, Duration
        │  each step: AI recommends the next options, ranked, with a reason
        ▼
Script generation (LLM as "wellness expert")
  → ScriptVersion: plain text + elements, each tagged with the
    entities it uses, with pause markup for the voice
        │
        ├─► Media prompts: video (Luma), thumbnail (Luma), music (Beatoven)
        ├─► Text-to-speech (script sent as is)
        └─► Script editing: suggest, regenerate, in-between, merge,
            split, expand, simplify
        ▼
Listener gives free-text feedback
        ▼
Feedback evaluation (LLM): satisfaction 0–10, per-entity 0–10, mastery
Feedback attribution (test): utility index −1…1 for each of 16 entities
        ▼
Analytics aggregate the scores: campaign, script and entity performance,
best combinations, user mastery over time, supply vs demand
```

Quality was checked offline with an **LLM-as-judge** rubric (nine
criteria). Three features are listed as implemented but not documented: Talk
with analytics, Agents marketplace, Insight cards.

## The taxonomy

The attribution prompt names the **16 entities** a script was built from:

| # | Entity | # | Entity |
| --- | --- | --- | --- |
| 1 | Pro profile (the creator) | 9 | Wellness category |
| 2 | Script logic | 10 | Method |
| 3 | Chakra | 11 | Technique |
| 4 | Concept (the goal) | 12 | Framework category |
| 5 | Skill | 13 | Framework |
| 6 | Mood | 14 | Style |
| 7 | State | 15 | World-building (setting) |
| 8 | Audience | 16 | Character |

The script prompt states the nesting:

- **What we aim for:** Concept → Skill → Mood → State.
- **How we get there:** Method → Technique.
- **The lens:** Framework.
- **The atmosphere:** Style, Character, Setting.

The Deep Dive groups the same ideas into three "atlases": **META** (goals,
chakras, concepts, skills), **PATH** (methods and techniques such as
pranayama, progressive muscle relaxation, visualisation) and **SCRIPT**
(characters, settings, tone, narrative).

**Use it for:** the seed of one shared catalogue of building blocks (open
item O29). Today the same block is defined three times with different ids.
The person-facing app would show only Concept, Technique, Style and Setting;
Chakra, Framework and Pro profile are creator or expert vocabulary.

## Data shapes

The prompts ask the model to return Pydantic models (Python). Rewritten as
Zod, the schema library this app uses, they become the following. Names are
kept so they can be traced back.

```ts
// A generated script and its parts. Each part says which entities it uses,
// which is what makes feedback attributable later.
const ScriptElement = z.object({
  index_number: z.number().int(),          // 0, 1, 2 …
  text: z.string(),                        // may contain <break time="1.5s" />
  method_name: z.string().nullable(),
  mood_name: z.string().nullable(),
  state_name: z.string().nullable(),
  framework_name: z.string().nullable(),
  technique_name: z.string().nullable(),
  skill_name: z.string().nullable(),
  // prompt 2 also asks for style, character and setting
})

const ScriptVersion = z.object({
  campaign_id: z.string(),
  version_number: z.number().int(),
  plain_text: z.string(),
  elements: z.array(ScriptElement),
})

// What the evaluator made of one piece of feedback.
const EntitySatisfactionScore = z.object({
  entity_id: z.string(),
  entity_type: z.enum(['technique', 'framework', 'method', 'mood', 'state']),
  score: z.number(),                       // 0–10
  entity_name: z.string().optional(),
})

const FeedbackEvaluation = z.object({
  script_version_id: z.string(),
  campaign_id: z.string(),
  script_feedback_id: z.string(),
  concept_id: z.string(),
  user_id: z.string(),
  general_satisfaction_score: z.number(),  // 0–10, overall sentiment
  entity_satisfaction_scores: z.array(EntitySatisfactionScore), // only entities mentioned
  mastery_evaluation_scores: z.record(z.string(), z.number()),  // 4 keys the model chooses
  ai_agent_satisfaction_scores: z.record(z.string(), z.number()),
})

// The attribution test: one entry per entity, mentioned or not.
const EntityAttribution = z.object({
  feedback: z.string(),                    // the relevant words, or "none"
  improvement: z.string(),                 // a suggestion, or "none"
  utility_index: z.number().min(-1).max(1),// 0 when not mentioned
})
```

**Use it for:**
- **Chapters that carry block ids.** Extend `SessionSpec.chapters` in the API
  contract with the blocks each chapter uses, so a check-in can be traced to
  them.
- **`EntityAttribution` as the shape of the "what worked" signal.** It feeds
  the admin's learning area, never shown to the person as a number.
- **Drop `mastery_evaluation_scores` as written** (see Artefact, lesson 5).

## Prompts we can reuse

Each prompt below is quoted from the wiki, shortened where marked. They are
inputs to rewrite, not text to paste: every one needs our safety rules, our
"no invented numbers" rule and structured outputs.

### Script writing: the modality rules

The second script prompt is the most valuable text in the three documents.
Its quality comes from concrete rules per practice, not from the "expert"
persona:

- **Only what was chosen.** "Include only the practices explicitly present
  in the setup." If breathing or visualisation is not chosen, leave it out.
- **Breathing:** write out 5–7 complete cycles, every breath; never
  "continue for several minutes"; match cadence to the intended effect.
- **Visualisation:** vivid multisensory imagery, changes of perspective,
  timing cues ("for ten slow heartbeats"), no "skip ahead" summaries.
- **Affirmations:** a counted pause after each, repeat key lines 3–7 times
  with varied emphasis, call-and-echo, tie each to a physical cue.
- **Meditation:** induction, an anchor, the theme, a clear closing; time the
  phases; never "meditate for a while".
- **Mindfulness:** micro-observations, small awareness challenges,
  non-judgemental labelling, a debrief into daily life.
- **Body scan and stretches:** name each region, give tempo (3-second hold,
  5-second release), no medical jargon.
- **Progressive muscle relaxation:** head to toe, explicit squeeze and
  release counts.
- **Emotional work (RAIN, parts work):** identify, locate in the body,
  witness with compassion, close with grounding.
- **Rituals, reflection, hypnosis, prayer, mantra, energy practices:** each
  has an opening, a guided middle and an explicit closing or re-orientation.
- **Transitions:** seamless, using sensory bridges; depth over breadth;
  "script every moment you speak".

**Use it for:** the `session.script` route's policy (API contract §8.2).

Before reuse, the prompt needs three changes:
- remove "healing", "transforms lives" and spiritual framing unless the person chose it;
- replace the word-count table (Artefact, lesson 2);
- run `safety.classify` on the input.

### Pause markup for the voice

```
<break time="1.5s" />   natural pause, at most 3.0 s
-                       a brief beat
...                     a thoughtful, hesitant pause
<break time="30s" />    scripted silence, e.g. for journaling
```

**Use it for:** the script that goes to text-to-speech in the build
pipeline. Check which markup the chosen TTS vendor accepts. The 2025 prompts
also contradict each other here: prompt 2 says breathing pauses use only
dashes and ellipses.

### Feedback attribution (utility index)

The prompt (shortened):

> You have a script created from these entities, and a piece of feedback.
> Decide which parts of the feedback pertain to which entities. List **every
> entity, even if it does not appear**. For each give: the relevant feedback
> (or "none"), an improvement (or "none"), and a `utility_index` from −1
> (very negative) to 1 (very positive), 0.0 when there is no feedback for
> it. Return a single valid JSON.

**Use it for:** a route that reads a check-in note against the blocks of
the build it rates. This closes the loop that is missing today (check-ins
are not linked to what was built).

### Script quality judge

> You are a mental-health-aware evaluator with expertise in therapeutic
> breathing, mindfulness and evidence-based well-being interventions. Score
> each criterion from 1 (poor) to 10 (excellent).

| Criterion | Criterion | Criterion |
| --- | --- | --- |
| Empathic tone and inclusivity | Clarity and flow | Meaningful pausing and pacing |
| Technique depth and accuracy | Practical usability | Entity coverage and balance |
| Consistency | Physiological validity | Goal achievement |

Breathing rules the judge enforces:
1. Diaphragmatic breathing instructs abdominal expansion on the inhale.
2. Counts are physiologically right (4-7-8 means exactly 4, 7, 8).
3. Named techniques (box breathing, alternate nostril) follow their protocol.
4. The pattern fits the goal (longer exhales for relaxation).
5. Breath holds and intense techniques come with safety notes.

**Use it for:** the eval set in API contract §8.8, run on every prompt
change. Add our own criteria: honours the person's "no …", no invented
numbers, no medical claims.

### Script editing: seven modes

| Mode | Instruction |
| --- | --- |
| Suggestion | Provide suggestions for improving the content. |
| Generate / Regenerate | Transform or regenerate the content while keeping context. |
| In-between | Generate a new element that fits naturally between two elements. |
| Merge | Merge the selected elements into one cohesive element. |
| Split | Split the element into two distinct but related elements. |
| Expand | Expand with more detail, examples or elaboration. |
| Simplify | Make the element more concise and easier to understand. |

**Use it for:** the admin's building-block editor first; later, chapter-level
edits in the cockpit ("make this part shorter").

### Recommendations with a reason

Each step of the 2025 setup asked the model to rank the next options and
explain why, for example:

> Given the selected Chakra/Need and Concept, recommend the most suitable
> Skill from these options. List them by priority and briefly explain the
> reasoning for each.

**Use it for:** confirmation of a choice already made. Proposals in the app
carry a `basis` (the Why? in v5). The new part worth taking is "only from
these options": the model ranks a closed list instead of inventing.

### Media prompts

| Medium | Prompt (quoted) |
| --- | --- |
| Video (Luma AI) | You are an AI assistant that writes prompts for video generation based on scripts provided by a wellness professional. Read the script, understand the context, and generate a direct and clear prompt for creating the video. Do not include any introduction, summary, or explanation, only the prompt. |
| Thumbnail (Luma AI) | You need to write a prompt to generate its thumbnail by understanding the script and being direct to your answer. You should not mention any introduction or summary. |
| Music (Beatoven.ai) | You are an AI assistant that writes prompts for {duration} second background music generation based on scripts provided by a wellness professional. Read the script, understand the tone, mood, and emotional context, and generate a direct and clear prompt. |

**Use it for:** the `VisualProvider` and `SoundProvider` adapters once a
vendor is chosen. Add the person's exclusions (no music, no frequencies).

## Infrastructure principles

The Technical Architecture Documentation is a list of good practice. Most of
it is already in today's API contract; the rest is worth keeping as a
checklist.

| 2025 principle | Today |
| --- | --- |
| One interface over several AI providers, failover, cost routing | One `ai-gateway`; the model is a policy field (§8.1, §8.3). Failover can sit inside the gateway later. |
| Retries with backoff, circuit breakers, fallbacks | In the contract (§8.3); scripted fallbacks, never a blank screen. |
| Persistent job queue, status per stage, live progress | `Build.stage` pipeline (§8.4); progress by SSE rather than WebSocket. |
| Schema validation at every boundary | Zod everywhere (`requestJson` in the app; structured outputs for the model). |
| Cost tracking, budgets, alerts | Per-user daily ceiling, alerts at 80 %, cost per completed core loop (§8.8). |
| Audit trails, correlation ids, health checks | Partly in the contract; add correlation ids to every AI call. |
| Encryption, backups, GDPR "ready" | Needs a real decision (contract §11); "HIPAA ready" is a claim to avoid until audited. |

## Where each piece goes

| Piece | Destination | Fixes |
| --- | --- | --- |
| Taxonomy (16 entities) | Shared building-block catalogue, `src/domain/` (O29) | Three definitions of the same block |
| `ScriptElement` tags | `SessionSpec.chapters[].blocks` in the API contract | Check-ins not linked to a build |
| Attribution prompt | New AI route after each check-in | No "what worked" signal |
| Modality rules | `session.script` policy | Script quality |
| Judge rubric | Evals (§8.8) | No quality bar |
| Seven edit modes | Admin building-block editor | No element editing |
| Closed-list recommendations | `proposals.generate` | Invented options |
| Media prompts | Provider adapters | No media generation yet |
| Infrastructure checklist | API contract §9 | — |

## Not to reuse

- **The words-per-minute table** (3 min ≈ 928 words … 10 min ≈ 3,094). That is
  about 310 words a minute, a reading pace, not a meditation pace.
- **The "world-renowned wellness expert" persona.** The rules carry the
  quality.
- **LLM scores as ground truth,** and the model choosing its own mastery
  dimensions per feedback.
- **The Deep Dive figures** (4,000 or 120,000 knowledge points, 768- or
  512-dimension user vectors, causal inference, reinforcement learning).
  None of them is visible in the prompts.
