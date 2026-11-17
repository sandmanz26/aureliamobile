# Artefact: what the 2025 backend teaches us

The three 2025 documents (the Deep Dive, the Technical Architecture
Documentation and the Wiki Aurelia) are an artefact of how Aurelia was first
built. Read side by side, they show what worked, what was promised but not
built, and where the documents contradict each other. This page turns that
into lessons for the backend still to be built. What can be reused directly
is in the previous tab, **Backend (old)**.

## In one minute

- **The prompts were good where they were concrete:** rules per practice,
  scripts split into tagged parts, a strict quality rubric.
- **The vision ran ahead of the build.** The Deep Dive describes a knowledge
  graph, causal inference and reinforcement learning; the prompts show an
  LLM writing scripts and scoring feedback.
- **Numbers were not checked.** The word-count table was three times too long
  for meditation, and the documents disagree on their own figures.
- **There was no safety layer.**
- **The loop that matters, feedback → what worked → a better next session,**
  was designed but rested on scores the model made up.

## Lesson 1: Claims must match what is built

| The Deep Dive says | The prompts show |
| --- | --- |
| A Wellness State Graph with 120,000 atomic knowledge points (slide 1), or 4,000 points and 120,000 edges (slide 2) | Lists of options passed into prompts |
| Causal inference: "actual cause-and-effect relationships" | Sentiment scores from free-text feedback |
| Reinforcement learning, user state as 768-dimension vectors (slide 6), or 512 (slide 9) | No learning step; analytics aggregate the scores |
| Fine-tuned transformers with "wellness tokens" | Prompts to general models |
| A Compassion Computational Index | Not in any prompt |

**For us:**
- Every claim in a deck, the PRD or investor material names the code or
  data behind it.
- A capability that does not exist yet is labelled roadmap.
- The app already follows this rule for health claims (no invented numbers).
  Apply it to how we describe the technology too.

## Lesson 2: Check the arithmetic against the real use

The script prompt sized scripts with this table: 3 min ≈ 928 words, 5 min ≈
1,547, 7 min ≈ 2,166, 10 min ≈ 3,094. That is about **310 words a minute**,
which is a reading speed. A guided session is spoken slowly, with long
pauses, typically around 100–130 words a minute. So a "10-minute" script came
out as roughly 25–30 minutes of audio, or the voice had to rush.

**For us:**
- Measure, don't assume. Time the chosen TTS voice at the pace setting the
  person picked, including the `<break>` pauses.
- Derive the word budget from that measurement.
- Put the number in the policy, with the date it was measured.

## Lesson 3: Safety is part of the first version, not a later one

None of the 2025 prompts handles distress. A person who writes "I can't do
this anymore" in feedback would get a satisfaction score. The prompts also
include hypnosis with post-hypnotic cues, breath retention and "spiritual
healing", all without screening.

**For us:**
- `safety.classify` runs on every text a person writes, before any other AI
  step, with a scripted support message and a human follow-up (API contract §8.7).
- Intensive techniques (breath holds, hypnosis) need a safety note and a
  decision on whether they are offered at all.

## Lesson 4: Tag what you generate, or you cannot learn from it

The best design decision in 2025: every part of a script recorded which
entities it used (technique, mood, state …). Only because of that could
feedback be traced back to what caused it, through the utility index.

Today's session spec has chapters with an intent and no building blocks, and
a check-in is not linked to the build it rates. As things stand we cannot
learn what worked.

**For us:**
- Every chapter carries the ids of its building blocks.
- Every check-in carries the id of the build.
- This is a small change to the API contract, and it decides whether
  personalisation can ever be more than guessing.

## Lesson 5: Model scores are signals, not measurements

The feedback evaluator asked the model to:
- give 0–10 scores for satisfaction and for each entity mentioned;
- "choose four keys you think are most important to evaluate user mastery",
  then score them.

So the mastery dimensions changed from one piece of feedback to the next,
and no two scores were comparable. The Deep Dive meanwhile describes
satisfaction on a 0–100 scale; the prompt uses 0–10.

**For us:**
- Fixed dimensions, decided in advance.
- The person's own answers (mood 1–5, later WHO-5) are the outcome; model
  scores are explanations of it.
- A sample of model scores is checked against human ratings before anyone
  relies on them.
- Scores are never shown to the person as numbers.

## Lesson 6: One vocabulary, in one place

The 2025 taxonomy had 16 entities. They were spelled differently across
prompts: "Concept" and "foundational wellness goal"; "Setting" and
"World-building"; "Archetype" and "Character". The two script prompts asked
for different fields (the first has no Style, Character or Setting).

We have the same problem today: one building block defined three times with
different ids.

**For us:** one catalogue of building blocks with stable ids, used by the
app, the admin, the prompts and the API contract, with a test that fails
when they drift (open item O29).

## Lesson 7: Prompts are code; version and test them

Contradictions found inside the 2025 prompts:
- **The planning tags.** "Wrap your planning in `<script_planning>` tags"
  followed by "don't include any tags like `<script_planning>` in the
  result".
- **Breathing pauses.** "Use `<break>` tags for pauses", and in the next
  prompt "use ONLY dashes and ellipses" for breathing pauses.
- **Lists returned as text.** JSON with a list written inside a string
  (`"<[skill_id1, skill_id2]>"`), which the code then had to parse.

**For us:**
- Prompts live as versioned policies (API contract §8.2).
- Outputs use structured outputs against a schema, not "please return JSON".
- Every prompt change reruns the eval set.

## Lesson 8: Rules beat personas

The prompts open with "You are a world-renowned wellness expert". What
actually shaped the scripts were the concrete rules: write every breath,
time each phase, include only what was chosen. The first script prompt had
the persona and far fewer rules; the second added them, and is the one worth
keeping.

**For us:** spend prompt length on rules and examples, checked by the judge
rubric. The persona line adds little.

## Lesson 9: The product changed; the loop changed with it

2025 served **creators**: a professional assembled a campaign, and analytics
told them which campaigns earned and which entities worked. Today serves
**the person**: one sentence becomes a session, a check-in shapes the next
chapter, and progress is told in their own words.

The machinery carries over: taxonomy, tagged scripts, attribution and evals.
What it optimises changes:
- **2025 optimised** revenue per script and top campaigns.
- **Today optimises** whether this person feels better and comes back for
  the next chapter.

**For us:**
- Design the backend around the person's loop:
  onboarding → build → play → check-in → next chapter.
- Creator tools (and an "Aurelia Pro") are a separate decision (O32).

## Lesson 10: Keep one source of truth for facts about the system

| Fact | Document A | Document B |
| --- | --- | --- |
| AI providers | Azure OpenAI, AWS Bedrock (Wiki) | Azure OpenAI, Gemini, Claude, DeepSeek (Architecture doc) |
| Knowledge points | 120,000 (Deep Dive slide 1) | 4,000, with 120,000 edges (slide 2) |
| User vector | 768 dimensions (slide 6) | 512 dimensions (slide 9) |
| Satisfaction scale | 0–100 (Deep Dive) | 0–10 (Wiki prompt) |

**For us:** the API contract is the one place these facts live. The wiki
pages link to it rather than restating it.

## Lesson 11: Keep the code with the documents

The wiki lists features as implemented that it does not describe (Talk with
analytics, Agents marketplace, Insight cards), and none of the code came with
the documents. A year later, a team inheriting Aurelia has prompts but not
the system that ran them.

**For us:**
- Every document says where its code lives.
- Every change is recorded with its commit (this repository's update log,
  work journal and handoff).
- The 2025 repository should be found and archived (open item O31).

## What we do differently

| Topic | 2025 | Today's plan |
| --- | --- | --- |
| Who it serves | Creators building campaigns | The person, one session and one chapter at a time |
| Vocabulary | 16 entities, inconsistent names | One catalogue with stable ids (O29) |
| Script structure | Tagged elements | Tagged chapters, linked to builds and check-ins |
| Feedback | Free text scored 0–10 by the model | The person's own answers; model attribution as an explanation |
| Quality | An offline judge in notebooks | Evals on every prompt change, with our own rules added |
| Safety | None | Classification before every step, scripted support, human follow-up |
| Pace | 310 words a minute | Measured on the chosen voice |
| Prompts | Text in a wiki, contradictory | Versioned policies with schemas |
| Claims | A vision presented as built | Every claim names its code or data |

## Checklist for the new backend

1. Building-block catalogue with stable ids, shared by the app, admin, prompts and contract (O29).
2. Chapters carry block ids; check-ins carry the build id.
3. `safety.classify` before any other AI step.
4. Word budget measured on the chosen voice.
5. Script policy built from the 2025 modality rules, without the persona and the word table.
6. Attribution route after each check-in, with fixed dimensions.
7. Judge rubric plus our rules in the eval set.
8. Structured outputs for every route; no JSON inside strings.
9. One document of record for system facts: the API contract.
10. Find and archive the 2025 code (O31).
