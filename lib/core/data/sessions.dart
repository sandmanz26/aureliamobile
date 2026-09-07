/// The session catalogue — the mobile mirror of the web app's
/// `src/lib/sessions.ts`, generated from it so the two cannot drift.
///
/// A real build replaces this with the `sessions` table from the PRD's backend
/// plan; the shape is deliberately close to it (slug, author, layers, chapters,
/// lineage). The one difference from the web file is `gradient`: CSS custom
/// properties become two stops from the same token ramp.
library;

import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// Which shelves on the Sessions screen a session appears on.
enum Shelf { community, picked, impact }

class SoundLayer {
  const SoundLayer({
    required this.id,
    required this.name,
    required this.detail,
    required this.level,
  });

  final String id;
  final String name;
  final String detail;

  /// 0-100, how present the layer is in the mix.
  final int level;
}

class Chapter {
  const Chapter({required this.label, required this.minutes, required this.detail});

  final String label;
  final int minutes;
  final String detail;
}

class Outcome {
  const Outcome({required this.label, required this.value, required this.note});

  final String label;
  final String value;
  final String note;
}

/// A label with its value — personalization rows and "what people changed".
class LabelValue {
  const LabelValue(this.label, this.value);

  final String label;
  final String value;
}

class LineageStep {
  const LineageStep({required this.title, required this.author, required this.note});

  final String title;
  final String author;
  final String note;
}

class SessionRecord {
  const SessionRecord({
    required this.slug,
    required this.title,
    required this.photo,
    required this.gradient,
    required this.description,
    required this.summary,
    required this.author,
    required this.authorRole,
    required this.plays,
    required this.recreated,
    required this.minutes,
    required this.category,
    required this.intent,
    required this.outcome,
    required this.layers,
    required this.chapters,
    required this.personalization,
    required this.commonChanges,
    required this.lineage,
    required this.safety,
    required this.shelves,
  });

  final String slug;
  final String title;

  /// Key into `coverPhotos`.
  final String photo;

  /// Painted under the cover photo, and left showing if it fails to load.
  final List<Color> gradient;

  final String description;
  final String summary;
  final String author;
  final String authorRole;
  final String plays;
  final String recreated;
  final int minutes;
  final String category;
  final String intent;
  final List<Outcome> outcome;
  final List<SoundLayer> layers;
  final List<Chapter> chapters;
  final List<LabelValue> personalization;
  final List<LabelValue> commonChanges;
  final List<LineageStep> lineage;
  final List<String> safety;
  final List<Shelf> shelves;

  int get totalMinutes =>
      chapters.fold(0, (sum, chapter) => sum + chapter.minutes);
}

const kSessions = <SessionRecord>[
  SessionRecord(
    slug: 'dolphins-frequency',
    title: 'Dolphins frequency',
    photo: 'dolphins',
    gradient: [AppPrimitives.info800, AppPrimitives.info400],
    description: 'This helped Adam reduce stress by 43% in less that a week.',
    summary: 'A slow descent built around cetacean song pitched down two octaves, laid over a tide that breathes at six cycles a minute. Written for the hour after work, when the body is still braced for something that is no longer coming.',
    author: 'Adam Nilson',
    authorRole: 'Community creator · 34 published sessions',
    plays: '18.5k',
    recreated: '1.5k',
    minutes: 22,
    category: 'Calm',
    intent: 'Bring the nervous system down from a working-day baseline without putting the listener to sleep.',
    outcome: [
      Outcome(label: 'Stress', value: '−43%', note: 'self-reported, first week'),
      Outcome(label: 'Resting HR', value: '−6 bpm', note: 'median across 4.1k listeners'),
      Outcome(label: 'Finished it', value: '81%', note: 'played to the last chapter'),
    ],
    layers: [
      SoundLayer(id: 'song', name: 'Cetacean song', detail: 'Field recording, pitched −24 st', level: 72),
      SoundLayer(id: 'tide', name: 'Tide bed', detail: 'Breathes at 6 cycles / minute', level: 58),
      SoundLayer(id: 'drone', name: 'Sub drone', detail: '52 Hz, barely audible', level: 34),
      SoundLayer(id: 'voice', name: 'Guidance', detail: 'Female, sparse — 9 cues total', level: 45),
    ],
    chapters: [
      Chapter(label: 'Arrival', minutes: 3, detail: 'Tide only. Nothing asked of the listener yet.'),
      Chapter(label: 'Descent', minutes: 7, detail: 'Song enters far off and moves closer; breath cues begin.'),
      Chapter(label: 'Deep water', minutes: 9, detail: 'No guidance. The mix holds steady and wide.'),
      Chapter(label: 'Surface', minutes: 3, detail: 'Layers thin out one at a time; ends on the tide alone.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Sleep score, resting heart rate'),
      LabelValue('Voice', 'Female · unhurried'),
      LabelValue('Ends', 'Fade to silence, no chime'),
      LabelValue('Best time', 'Late afternoon / early evening'),
    ],
    commonChanges: [
      LabelValue('Made it longer', '38%'),
      LabelValue('Removed the guidance', '24%'),
      LabelValue('Raised the tide level', '16%'),
      LabelValue('Swapped to a male voice', '9%'),
    ],
    lineage: [
      LineageStep(title: 'Ocean floor', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Deep blue, slower', author: 'Marcus Lee', note: 'Halved the tempo'),
      LineageStep(title: 'Dolphins frequency', author: 'Adam Nilson', note: 'Added cetacean song and the breath cues'),
    ],
    safety: [
      'Not a treatment for any medical condition, and not a substitute for care.',
      'Do not listen while driving or operating machinery — the descent is designed to lower alertness.',
      'Field recordings licensed for redistribution inside Aurelia sessions only.',
    ],
    shelves: [Shelf.community],
  ),
  SessionRecord(
    slug: 'raise-your-vibration',
    title: 'Raise your Vibration',
    photo: 'vibration',
    gradient: [AppPrimitives.warning300, AppPrimitives.danger200],
    description: 'This helped Sara improve her mood within few minutes.',
    summary: 'A short, bright session that climbs rather than settles. Warm pads and a rising affirmation cadence, built for the flat stretch of a morning when nothing is wrong and nothing is moving either.',
    author: 'Sara Trezeguat',
    authorRole: 'Community creator · 12 published sessions',
    plays: '18.5k',
    recreated: '1.5k',
    minutes: 9,
    category: 'Energy',
    intent: 'Lift a flat mood quickly, without the jolt of stimulants or a workout.',
    outcome: [
      Outcome(label: 'Mood', value: '+31%', note: 'immediately after, self-reported'),
      Outcome(label: 'Held for', value: '3.4 h', note: 'median before returning to baseline'),
      Outcome(label: 'Repeat rate', value: '64%', note: 'played again within a week'),
    ],
    layers: [
      SoundLayer(id: 'pads', name: 'Warm pads', detail: 'Rising major thirds', level: 66),
      SoundLayer(id: 'affirm', name: 'Affirmations', detail: '11 lines, present tense', level: 70),
      SoundLayer(id: 'pulse', name: 'Soft pulse', detail: '72 bpm, matches a calm heartbeat', level: 41),
    ],
    chapters: [
      Chapter(label: 'Open', minutes: 2, detail: 'Pads only, brightening.'),
      Chapter(label: 'Name it', minutes: 3, detail: 'Affirmations begin, one per 20 seconds.'),
      Chapter(label: 'Carry it', minutes: 4, detail: 'Pulse joins; the cadence quickens slightly.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Mood check-in, time of day'),
      LabelValue('Voice', 'Female · warm'),
      LabelValue('Ends', 'Single chime'),
      LabelValue('Best time', 'Morning'),
    ],
    commonChanges: [
      LabelValue('Rewrote the affirmations', '41%'),
      LabelValue('Dropped the pulse', '19%'),
      LabelValue('Made it shorter', '14%'),
    ],
    lineage: [
      LineageStep(title: 'Bright open', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Raise your Vibration', author: 'Sara Trezeguat', note: 'Wrote the affirmation set'),
    ],
    safety: [
      'Affirmation content is user-written and reviewed by moderation before publishing.',
      'Not a treatment for depression or any medical condition.',
    ],
    shelves: [Shelf.community],
  ),
  SessionRecord(
    slug: 'mind-dance',
    title: 'Mind Dance',
    photo: 'mindDance',
    gradient: [AppPrimitives.primary700, AppPrimitives.primary300],
    description: 'This helped Lily reduce stress by 43% in less that a week.',
    summary: 'Movement without moving. A shifting rhythmic bed that keeps attention busy enough to stop it circling, for the kind of stress that will not sit still long enough to be meditated away.',
    author: 'Lily Ahmad',
    authorRole: 'Community creator · 7 published sessions',
    plays: '18.5k',
    recreated: '1.5k',
    minutes: 15,
    category: 'Meditations',
    intent: 'Give restless, looping thought something to follow instead of asking it to stop.',
    outcome: [
      Outcome(label: 'Stress', value: '−43%', note: 'self-reported, first week'),
      Outcome(label: 'Rumination', value: '−28%', note: 'evening check-in score'),
      Outcome(label: 'Finished it', value: '73%', note: 'played to the last chapter'),
    ],
    layers: [
      SoundLayer(id: 'rhythm', name: 'Shifting rhythm', detail: 'Pattern changes every 90 s', level: 64),
      SoundLayer(id: 'keys', name: 'Muted keys', detail: 'Sparse, off the beat', level: 48),
      SoundLayer(id: 'air', name: 'Room air', detail: 'Keeps it from sounding synthetic', level: 30),
    ],
    chapters: [
      Chapter(label: 'Catch the pattern', minutes: 4, detail: 'A single figure, repeated until it is easy to follow.'),
      Chapter(label: 'Let it shift', minutes: 7, detail: 'The pattern changes without warning; attention follows.'),
      Chapter(label: 'Let it go', minutes: 4, detail: 'Rhythm dissolves into the room tone.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Stress check-in, session history'),
      LabelValue('Voice', 'None — instrumental'),
      LabelValue('Ends', 'Fade to silence'),
      LabelValue('Best time', 'Any time you cannot settle'),
    ],
    commonChanges: [
      LabelValue('Added a guiding voice', '33%'),
      LabelValue('Slowed the rhythm', '27%'),
      LabelValue('Made it longer', '21%'),
    ],
    lineage: [
      LineageStep(title: 'Pattern study', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Mind Dance', author: 'Lily Ahmad', note: 'Wrote the shifting pattern set'),
    ],
    safety: [
      'Contains rhythmic content — if you have photosensitive or audiogenic epilepsy, check with a clinician first.',
      'Not a treatment for any medical condition.',
    ],
    shelves: [Shelf.community],
  ),
  SessionRecord(
    slug: 'cosmic-flow',
    title: 'Cosmic Flow',
    photo: 'cosmic',
    gradient: [AppPrimitives.primary950, AppPrimitives.info700],
    description: 'This helped Daniel release tension and reset her mind in just 10 minutes.',
    summary: 'Ten minutes of very slow harmonic drift, with no beat to hold onto and nothing to follow. Written for the gap between two things you did not want to do — short enough to fit, long enough to change the register you are in.',
    author: 'Emma Carter',
    authorRole: 'Community creator · 21 published sessions',
    plays: '18.5k',
    recreated: '1.5k',
    minutes: 10,
    category: 'Calm',
    intent: 'Break a tense stretch in the middle of a day, without needing somewhere quiet to lie down.',
    outcome: [
      Outcome(label: 'Tension', value: '−37%', note: 'self-reported, straight after'),
      Outcome(label: 'Fits in', value: '10 min', note: 'median gap it is played in'),
      Outcome(label: 'Finished it', value: '88%', note: 'played to the end'),
    ],
    layers: [
      SoundLayer(id: 'drift', name: 'Harmonic drift', detail: 'Two detuned pads, no tempo', level: 70),
      SoundLayer(id: 'shimmer', name: 'Shimmer', detail: 'Bowed metal, high and thin', level: 42),
      SoundLayer(id: 'floor', name: 'Sub floor', detail: '48 Hz, felt more than heard', level: 30),
    ],
    chapters: [
      Chapter(label: 'Widen', minutes: 3, detail: 'The pads separate and the room opens out.'),
      Chapter(label: 'Drift', minutes: 5, detail: 'No change is announced; everything moves slowly.'),
      Chapter(label: 'Return', minutes: 2, detail: 'The shimmer drops away and the floor fades last.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Stress check-in, time of day'),
      LabelValue('Voice', 'None — instrumental'),
      LabelValue('Ends', 'Fade to silence'),
      LabelValue('Best time', 'Between two things'),
    ],
    commonChanges: [
      LabelValue('Made it longer', '44%'),
      LabelValue('Added a guiding voice', '22%'),
      LabelValue('Raised the sub floor', '13%'),
    ],
    lineage: [
      LineageStep(title: 'Drift study', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Cosmic Flow', author: 'Emma Carter', note: 'Detuned the pads and cut it to ten minutes'),
    ],
    safety: [
      'Contains sustained low frequency — keep the volume moderate on headphones.',
      'Not a treatment for any medical condition.',
    ],
    shelves: [Shelf.picked],
  ),
  SessionRecord(
    slug: '528-hz-reset',
    title: '528 Hz Reset',
    photo: 'water',
    gradient: [AppPrimitives.neutral600, AppPrimitives.warning200],
    description: 'This helped Sofia quiet her mind by 84% in one session.',
    summary: 'A single tone, held and re-struck, with everything else kept out of the way. The claim attached to 528 Hz is folklore; what is measurable is that a steady pitch with nothing competing gives attention one place to sit.',
    author: 'Sofia Martinez',
    authorRole: 'Community creator · 9 published sessions',
    plays: '18.5k',
    recreated: '1.5k',
    minutes: 12,
    category: 'Music',
    intent: 'Give a loud head one steady thing to rest on.',
    outcome: [
      Outcome(label: 'Mental noise', value: '−84%', note: 'self-reported, one session'),
      Outcome(label: 'Repeat rate', value: '58%', note: 'played again within a week'),
      Outcome(label: 'Finished it', value: '76%', note: 'played to the end'),
    ],
    layers: [
      SoundLayer(id: 'tone', name: 'Sustained tone', detail: '528 Hz, re-struck every 40 s', level: 78),
      SoundLayer(id: 'bowl', name: 'Bowl resonance', detail: 'Recorded, not synthesised', level: 52),
      SoundLayer(id: 'room', name: 'Room tail', detail: 'Long reverb, no early reflections', level: 36),
    ],
    chapters: [
      Chapter(label: 'Strike', minutes: 2, detail: 'The tone arrives alone and is allowed to decay fully.'),
      Chapter(label: 'Hold', minutes: 8, detail: 'Re-struck as it fades; nothing else is added.'),
      Chapter(label: 'Let it go', minutes: 2, detail: 'The last strike is left to decay into the room.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Nothing — fixed by design'),
      LabelValue('Voice', 'None — instrumental'),
      LabelValue('Ends', 'Natural decay'),
      LabelValue('Best time', 'When you cannot think straight'),
    ],
    commonChanges: [
      LabelValue('Made it longer', '52%'),
      LabelValue('Changed the frequency', '29%'),
      LabelValue('Added a guiding voice', '11%'),
    ],
    lineage: [
      LineageStep(title: 'Single tone', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: '528 Hz Reset', author: 'Sofia Martinez', note: 'Swapped the synth tone for a recorded bowl'),
    ],
    safety: [
      'Specific frequencies are not proven to have specific healing effects. This session is presented as music, not medicine.',
      'Not a treatment for any medical condition.',
    ],
    shelves: [Shelf.picked],
  ),
  SessionRecord(
    slug: 'deep-grounding',
    title: 'Deep Grounding',
    photo: 'forest',
    gradient: [AppPrimitives.success900, AppPrimitives.success500],
    description: 'This helped Daniel sleep better, with 76% deeper rest at night.',
    summary: 'A long, low session that stays close to the ground — earth-toned texture, a very slow breath cue, and no melody at all. Built to be played lying down, at the point in the evening where the day has not finished letting go.',
    author: 'Daniel Brooks',
    authorRole: 'Community creator · 41 published sessions',
    plays: '18.5k',
    recreated: '1.5k',
    minutes: 28,
    category: 'Sleep',
    intent: 'Take a body that is lying down but still switched on the rest of the way down.',
    outcome: [
      Outcome(label: 'Deep rest', value: '+76%', note: 'wearable-reported, first two weeks'),
      Outcome(label: 'Time to sleep', value: '−11 min', note: 'median across 6.2k listeners'),
      Outcome(label: 'Finished it', value: '42%', note: 'most listeners fall asleep first'),
    ],
    layers: [
      SoundLayer(id: 'earth', name: 'Earth texture', detail: 'Low granular bed, no pitch centre', level: 68),
      SoundLayer(id: 'breath', name: 'Breath cue', detail: '4 cycles / minute, unspoken', level: 40),
      SoundLayer(id: 'rain', name: 'Distant rain', detail: 'Far off, never overhead', level: 33),
    ],
    chapters: [
      Chapter(label: 'Settle', minutes: 6, detail: 'Texture only; the breath cue has not started.'),
      Chapter(label: 'Slow down', minutes: 10, detail: 'The cue enters and gradually lengthens.'),
      Chapter(label: 'Ground', minutes: 8, detail: 'Everything thins except the low bed.'),
      Chapter(label: 'Leave', minutes: 4, detail: 'Fades far below speaking volume and stops.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Sleep score, bedtime'),
      LabelValue('Voice', 'None — instrumental'),
      LabelValue('Ends', 'Fade to silence, no chime'),
      LabelValue('Best time', 'In bed, lights out'),
    ],
    commonChanges: [
      LabelValue('Made it longer', '48%'),
      LabelValue('Dropped the rain', '23%'),
      LabelValue('Added a guiding voice', '12%'),
    ],
    lineage: [
      LineageStep(title: 'Low bed', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Ground floor', author: 'Adam Nilson', note: 'Added the unspoken breath cue'),
      LineageStep(title: 'Deep Grounding', author: 'Daniel Brooks', note: 'Extended it and pushed the rain further away'),
    ],
    safety: [
      'Designed to be played while falling asleep — do not use while driving.',
      'Sleep figures come from listeners’ own wearables and are not a clinical measurement.',
      'Not a treatment for insomnia or any medical condition.',
    ],
    shelves: [Shelf.impact],
  ),
  SessionRecord(
    slug: 'inner-frequency',
    title: 'Inner Frequency',
    photo: 'glow',
    gradient: [AppPrimitives.danger600, AppPrimitives.warning400],
    description: 'This helped Noah start his day with 91% feeling calmer within one session.',
    summary: 'A morning session that does not try to wake you up quickly. Warm low strings under a slowly rising tone, ending on the note the day is meant to start on.',
    author: 'Noah Williams',
    authorRole: 'Community creator · 16 published sessions',
    plays: '18.5k',
    recreated: '1.5k',
    minutes: 14,
    category: 'Energy',
    intent: 'Start the day settled rather than startled.',
    outcome: [
      Outcome(label: 'Felt calmer', value: '91%', note: 'self-reported, one session'),
      Outcome(label: 'Morning mood', value: '+26%', note: 'first-hour check-in'),
      Outcome(label: 'Repeat rate', value: '71%', note: 'played again within a week'),
    ],
    layers: [
      SoundLayer(id: 'strings', name: 'Low strings', detail: 'Bowed, held, never resolving', level: 65),
      SoundLayer(id: 'rise', name: 'Rising tone', detail: 'Climbs a fifth across the session', level: 55),
      SoundLayer(id: 'birds', name: 'Distant birds', detail: 'Field recording, dawn', level: 28),
    ],
    chapters: [
      Chapter(label: 'Before', minutes: 4, detail: 'Strings only, still and low.'),
      Chapter(label: 'First light', minutes: 6, detail: 'The rising tone enters underneath the birds.'),
      Chapter(label: 'Up', minutes: 4, detail: 'The rise completes and the strings step aside.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Wake time, sleep score'),
      LabelValue('Voice', 'None — instrumental'),
      LabelValue('Ends', 'Single low chime'),
      LabelValue('Best time', 'First thing'),
    ],
    commonChanges: [
      LabelValue('Added affirmations', '35%'),
      LabelValue('Made it shorter', '25%'),
      LabelValue('Dropped the birds', '18%'),
    ],
    lineage: [
      LineageStep(title: 'Bright open', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Inner Frequency', author: 'Noah Williams', note: 'Replaced the pads with bowed strings'),
    ],
    safety: [
      'Field recordings licensed for redistribution inside Aurelia sessions only.',
      'Not a treatment for any medical condition.',
    ],
    shelves: [Shelf.impact],
  )
];

SessionRecord? findSession(String? slug) {
  for (final session in kSessions) {
    if (session.slug == slug) return session;
  }
  return null;
}

List<SessionRecord> sessionsOnShelf(Shelf shelf) =>
    kSessions.where((session) => session.shelves.contains(shelf)).toList();
