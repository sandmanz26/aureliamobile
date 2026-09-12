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

/// The chip row above the community shelf. Closed, like the web's union, so a
/// typo in a session's category cannot quietly create a chip nothing matches.
class SessionCategory {
  const SessionCategory(this.name, this.libraryCount);

  final String name;

  /// The size of the whole catalogue behind the chip — the shelf below it is a
  /// sample of that, not all of it, which is why the counts do not match.
  final String libraryCount;

  String get label => '$name ($libraryCount)';
}

const kCategories = <SessionCategory>[
  SessionCategory('Meditations', '12.5k'),
  SessionCategory('Music', '8.3k'),
  SessionCategory('Energy', '3.1k'),
  SessionCategory('Sleep', '13.4k'),
  SessionCategory('Calm', '22.3k'),
];

/// "All" is the unfiltered state; every other entry is a category name.
const kAllCategories = 'All';

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
    required this.authorPhoto,
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

  /// Creator portrait, so a card can credit by face as well as name.
  final String authorPhoto;

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
    authorPhoto: 'avatar',
    authorRole: 'Community creator · 34 published sessions',
    plays: '124k',
    recreated: '9.8k',
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
    authorPhoto: 'creatorSophia',
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
    authorPhoto: 'creatorLily',
    authorRole: 'Community creator · 7 published sessions',
    plays: '7.2k',
    recreated: '2.1k',
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
    description: 'This helped Daniel release tension and reset their mind in just 10 minutes.',
    summary: 'Ten minutes of very slow harmonic drift, with no beat to hold onto and nothing to follow. Written for the gap between two things you did not want to do — short enough to fit, long enough to change the register you are in.',
    author: 'Emma Carter',
    authorPhoto: 'creatorAria',
    authorRole: 'Community creator · 21 published sessions',
    plays: '41.3k',
    recreated: '3.4k',
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
    authorPhoto: 'creatorAmara',
    authorRole: 'Community creator · 9 published sessions',
    plays: '62.8k',
    recreated: '1.1k',
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
    shelves: [Shelf.community, Shelf.picked],
  ),
  SessionRecord(
    slug: 'deep-grounding',
    title: 'Deep Grounding',
    photo: 'forest',
    gradient: [AppPrimitives.success900, AppPrimitives.success500],
    description: 'This helped Daniel sleep better, with 76% deeper rest at night.',
    summary: 'A long, low session that stays close to the ground — earth-toned texture, a very slow breath cue, and no melody at all. Built to be played lying down, at the point in the evening where the day has not finished letting go.',
    author: 'Daniel Brooks',
    authorPhoto: 'creatorDaniel',
    authorRole: 'Community creator · 41 published sessions',
    plays: '88.1k',
    recreated: '6.2k',
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
    shelves: [Shelf.community, Shelf.impact],
  ),
  SessionRecord(
    slug: 'inner-frequency',
    title: 'Inner Frequency',
    photo: 'glow',
    gradient: [AppPrimitives.danger600, AppPrimitives.warning400],
    description: 'This helped Noah start his day with 91% feeling calmer within one session.',
    summary: 'A morning session that does not try to wake you up quickly. Warm low strings under a slowly rising tone, ending on the note the day is meant to start on.',
    author: 'Noah Williams',
    authorPhoto: 'creatorNoah',
    authorRole: 'Community creator · 16 published sessions',
    plays: '23.7k',
    recreated: '2.8k',
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
    shelves: [Shelf.community, Shelf.impact],
  ),
  SessionRecord(
    slug: 'ocean-breath',
    title: 'Ocean Breath',
    photo: 'waves',
    gradient: [AppPrimitives.info950, AppPrimitives.info600],
    description: 'This helped Maya feel calmer and more grounded within minutes.',
    summary: 'Breath paced to a swell rather than a metronome — the inhale rises with the water and the exhale goes out with it. Six cycles a minute, which is roughly where the nervous system settles on its own.',
    author: 'Maya Chen',
    authorPhoto: 'creatorMaya',
    authorRole: 'Community creator · 18 published sessions',
    plays: '15.4k',
    recreated: '4.9k',
    minutes: 11,
    category: 'Calm',
    intent: 'Slow the breath without making the listener count anything.',
    outcome: [
      Outcome(label: 'Felt calmer', value: '+52%', note: 'self-reported, straight after'),
      Outcome(label: 'Breath rate', value: '−4 /min', note: 'median across 2.8k listeners'),
      Outcome(label: 'Finished it', value: '86%', note: 'played to the end'),
    ],
    layers: [
      SoundLayer(id: 'swell', name: 'Ocean swell', detail: 'Field recording, 6 cycles / minute', level: 74),
      SoundLayer(id: 'pad', name: 'Low pad', detail: 'Follows the swell, never leads it', level: 46),
      SoundLayer(id: 'voice', name: 'Guidance', detail: 'Female, 6 cues total', level: 38),
    ],
    chapters: [
      Chapter(label: 'Find it', minutes: 3, detail: 'The swell alone, until its rhythm is obvious.'),
      Chapter(label: 'Follow it', minutes: 5, detail: 'Breath cues land on the rise and the fall.'),
      Chapter(label: 'Keep it', minutes: 3, detail: 'Cues stop; the swell carries the pace.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Resting heart rate, stress check-in'),
      LabelValue('Voice', 'Female · unhurried'),
      LabelValue('Ends', 'Fade to silence'),
      LabelValue('Best time', 'Any time you are holding your breath'),
    ],
    commonChanges: [
      LabelValue('Made it longer', '40%'),
      LabelValue('Removed the guidance', '31%'),
      LabelValue('Slowed the pace', '17%'),
    ],
    lineage: [
      LineageStep(title: 'Tide bed', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Ocean Breath', author: 'Maya Chen', note: 'Timed the breath cues to the swell'),
    ],
    safety: [
      'Paced breathing can cause light-headedness — stop if you feel dizzy.',
      'Not a treatment for any medical condition.',
    ],
    shelves: [Shelf.community, Shelf.picked],
  ),
  SessionRecord(
    slug: 'rainy-mind',
    title: 'Rainy Mind',
    photo: 'rain',
    gradient: [AppPrimitives.info800, AppPrimitives.warning400],
    description: 'This helped Chloe reduce racing thoughts by 62% in 20 minutes.',
    summary: 'Rain against a window, recorded from inside, with the room left in. For the kind of racing thought that needs something to happen nearby rather than silence to fill.',
    author: 'Chloe Anderson',
    authorPhoto: 'creatorChloe',
    authorRole: 'Community creator · 24 published sessions',
    plays: '96.5k',
    recreated: '780',
    minutes: 20,
    category: 'Calm',
    intent: 'Give a racing mind company instead of an empty room.',
    outcome: [
      Outcome(label: 'Racing thoughts', value: '−62%', note: 'self-reported, 20 minutes'),
      Outcome(label: 'Repeat rate', value: '69%', note: 'played again within a week'),
      Outcome(label: 'Finished it', value: '64%', note: 'played to the end'),
    ],
    layers: [
      SoundLayer(id: 'rain', name: 'Rain on glass', detail: 'Recorded from inside, room included', level: 76),
      SoundLayer(id: 'traffic', name: 'Distant traffic', detail: 'Far off, occasional', level: 32),
      SoundLayer(id: 'hum', name: 'Room hum', detail: 'Keeps it from sounding like a loop', level: 28),
    ],
    chapters: [
      Chapter(label: 'Inside', minutes: 5, detail: 'Rain arrives and steadies.'),
      Chapter(label: 'Stay', minutes: 11, detail: 'Nothing changes on purpose.'),
      Chapter(label: 'Easing', minutes: 4, detail: 'The rain thins out and stops.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Time of day, session history'),
      LabelValue('Voice', 'None — ambient'),
      LabelValue('Ends', 'Fade to silence'),
      LabelValue('Best time', 'Working, or trying to'),
    ],
    commonChanges: [
      LabelValue('Made it longer', '55%'),
      LabelValue('Dropped the traffic', '20%'),
      LabelValue('Added a guiding voice', '10%'),
    ],
    lineage: [
      LineageStep(title: 'Room tone', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Rainy Mind', author: 'Chloe Anderson', note: 'Recorded the rain from indoors'),
    ],
    safety: [
      'Field recordings licensed for redistribution inside Aurelia sessions only.',
      'Not a treatment for anxiety or any medical condition.',
    ],
    shelves: [Shelf.community, Shelf.picked],
  ),
  SessionRecord(
    slug: 'inner-balance',
    title: 'Inner Balance',
    photo: 'stones',
    gradient: [AppPrimitives.neutral500, AppPrimitives.neutral200],
    description: 'This helped Daniel feel 47% more grounded after a stressful week.',
    summary: 'A session with a centre of gravity: one low tone that never moves, and everything else arranged around it. Written for the end of a week that got away from you.',
    author: 'Daniel Kim',
    authorPhoto: 'creatorEthan',
    authorRole: 'Community creator · 31 published sessions',
    plays: '11.2k',
    recreated: '1.9k',
    minutes: 18,
    category: 'Meditations',
    intent: 'Give a scattered week one fixed point to reorganise around.',
    outcome: [
      Outcome(label: 'Felt grounded', value: '+47%', note: 'self-reported, after one week'),
      Outcome(label: 'Weekly use', value: '3.1×', note: 'median sessions per week'),
      Outcome(label: 'Finished it', value: '79%', note: 'played to the end'),
    ],
    layers: [
      SoundLayer(id: 'centre', name: 'Centre tone', detail: '110 Hz, held throughout', level: 70),
      SoundLayer(id: 'stones', name: 'Struck stone', detail: 'Sparse, irregular', level: 44),
      SoundLayer(id: 'air', name: 'Open air', detail: 'Wide, no reflections', level: 30),
    ],
    chapters: [
      Chapter(label: 'Set it down', minutes: 5, detail: 'The centre tone enters and stays.'),
      Chapter(label: 'Around it', minutes: 9, detail: 'Stone strikes come and go; the tone does not move.'),
      Chapter(label: 'Stand up', minutes: 4, detail: 'Everything else clears, the tone last.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Stress check-in, day of week'),
      LabelValue('Voice', 'None — instrumental'),
      LabelValue('Ends', 'Fade to silence'),
      LabelValue('Best time', 'End of the week'),
    ],
    commonChanges: [
      LabelValue('Added a guiding voice', '36%'),
      LabelValue('Made it longer', '24%'),
      LabelValue('Dropped the stone strikes', '15%'),
    ],
    lineage: [
      LineageStep(title: 'Single tone', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Inner Balance', author: 'Daniel Kim', note: 'Built the stone layer around the centre'),
    ],
    safety: [
      'Contains sustained low frequency — keep the volume moderate on headphones.',
      'Not a treatment for any medical condition.',
    ],
    shelves: [Shelf.community, Shelf.picked, Shelf.impact],
  ),
  SessionRecord(
    slug: 'golden-hour',
    title: 'Golden Hour',
    photo: 'glow',
    gradient: [AppPrimitives.warning700, AppPrimitives.warning300],
    description: 'This helped Nina release 54% more tension in one session.',
    summary: 'Warm, slow and short, built for the hour when the light goes orange and the day is technically still going. A body scan without the instruction to scan anything.',
    author: 'Nina Harper',
    authorPhoto: 'creatorNina',
    authorRole: 'Community creator · 14 published sessions',
    plays: '34.6k',
    recreated: '5.1k',
    minutes: 13,
    category: 'Calm',
    intent: 'Let the body put the day down before the evening starts.',
    outcome: [
      Outcome(label: 'Tension', value: '−54%', note: 'self-reported, one session'),
      Outcome(label: 'Held for', value: '2.7 h', note: 'median before returning to baseline'),
      Outcome(label: 'Finished it', value: '83%', note: 'played to the end'),
    ],
    layers: [
      SoundLayer(id: 'warm', name: 'Warm bed', detail: 'Tape-saturated pad', level: 68),
      SoundLayer(id: 'voice', name: 'Guidance', detail: 'Female, low, 12 cues', level: 52),
      SoundLayer(id: 'room', name: 'Late room', detail: 'Evening air, very quiet', level: 26),
    ],
    chapters: [
      Chapter(label: 'Arrive', minutes: 3, detail: 'Pad only, brightening slowly.'),
      Chapter(label: 'Let down', minutes: 7, detail: 'Cues move from shoulders to jaw to hands.'),
      Chapter(label: 'Stay warm', minutes: 3, detail: 'No more cues; the pad holds.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Time of day, tension check-in'),
      LabelValue('Voice', 'Female · low'),
      LabelValue('Ends', 'Fade to silence'),
      LabelValue('Best time', 'Late afternoon'),
    ],
    commonChanges: [
      LabelValue('Made it longer', '33%'),
      LabelValue('Swapped to a male voice', '21%'),
      LabelValue('Removed the guidance', '16%'),
    ],
    lineage: [
      LineageStep(title: 'Warm bed', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Golden Hour', author: 'Nina Harper', note: 'Wrote the release cue set'),
    ],
    safety: [
    ],
    shelves: [Shelf.community, Shelf.picked],
  ),
  SessionRecord(
    slug: 'quiet-space',
    title: 'Quiet Space',
    photo: 'meadow',
    gradient: [AppPrimitives.success800, AppPrimitives.success400],
    description: 'This helped Lucas quiet his thoughts by 71% before bed.',
    summary: 'A field at dusk with almost nothing in it — a little wind, one bird a long way off, and a lot of space. The quietest session in the catalogue, and deliberately so.',
    author: 'Lucas Martin',
    authorPhoto: 'creatorLucas',
    authorRole: 'Community creator · 26 published sessions',
    plays: '57.9k',
    recreated: '640',
    minutes: 24,
    category: 'Sleep',
    intent: 'Empty the last half hour of the day out.',
    outcome: [
      Outcome(label: 'Mental noise', value: '−71%', note: 'self-reported, before bed'),
      Outcome(label: 'Time to sleep', value: '−9 min', note: 'median across 3.4k listeners'),
      Outcome(label: 'Finished it', value: '38%', note: 'most listeners fall asleep first'),
    ],
    layers: [
      SoundLayer(id: 'wind', name: 'Grass and wind', detail: 'Low, continuous, no gusts', level: 58),
      SoundLayer(id: 'bird', name: 'Distant bird', detail: 'Once or twice a minute at most', level: 24),
      SoundLayer(id: 'space', name: 'Open space', detail: 'The room the rest sits in', level: 34),
    ],
    chapters: [
      Chapter(label: 'Step out', minutes: 6, detail: 'Wind only.'),
      Chapter(label: 'Stand still', minutes: 12, detail: 'Almost nothing happens, on purpose.'),
      Chapter(label: 'Dark', minutes: 6, detail: 'Everything thins until it is gone.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Bedtime, sleep score'),
      LabelValue('Voice', 'None — ambient'),
      LabelValue('Ends', 'Fade to silence, no chime'),
      LabelValue('Best time', 'Last thing'),
    ],
    commonChanges: [
      LabelValue('Made it longer', '49%'),
      LabelValue('Dropped the bird', '22%'),
      LabelValue('Added a guiding voice', '9%'),
    ],
    lineage: [
      LineageStep(title: 'Open field', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Quiet Space', author: 'Lucas Martin', note: 'Took almost everything out'),
    ],
    safety: [
      'Designed to be played while falling asleep — do not use while driving.',
      'Not a treatment for insomnia or any medical condition.',
    ],
    shelves: [Shelf.community, Shelf.picked, Shelf.impact],
  ),
  SessionRecord(
    slug: 'dream-drift',
    title: 'Dream Drift',
    photo: 'underwater',
    gradient: [AppPrimitives.info900, AppPrimitives.info400],
    description: 'This helped Mia unwind 65% faster and ease into sleep.',
    summary: 'Weightlessness, as a sound. Slow suspended tones with no floor and no edges, for the stretch between lying down and letting go.',
    author: 'Mia Parker',
    authorPhoto: 'creatorMia',
    authorRole: 'Community creator · 11 published sessions',
    plays: '72.4k',
    recreated: '1.2k',
    minutes: 26,
    category: 'Sleep',
    intent: 'Shorten the gap between lying down and actually going under.',
    outcome: [
      Outcome(label: 'Unwound faster', value: '+65%', note: 'self-reported, first two weeks'),
      Outcome(label: 'Time to sleep', value: '−13 min', note: 'median across 5.1k listeners'),
      Outcome(label: 'Finished it', value: '31%', note: 'most listeners fall asleep first'),
    ],
    layers: [
      SoundLayer(id: 'suspend', name: 'Suspended tones', detail: 'No root note, no resolution', level: 66),
      SoundLayer(id: 'depth', name: 'Depth', detail: 'Sub content, felt not heard', level: 38),
      SoundLayer(id: 'drift', name: 'Slow drift', detail: 'The mix moves ear to ear over minutes', level: 30),
    ],
    chapters: [
      Chapter(label: 'Float', minutes: 8, detail: 'Tones enter without a beginning.'),
      Chapter(label: 'Drift', minutes: 12, detail: 'The mix moves so slowly it is hard to notice.'),
      Chapter(label: 'Under', minutes: 6, detail: 'Everything sinks below hearing.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Bedtime, sleep score'),
      LabelValue('Voice', 'None — instrumental'),
      LabelValue('Ends', 'Fade to silence, no chime'),
      LabelValue('Best time', 'In bed, lights out'),
    ],
    commonChanges: [
      LabelValue('Made it longer', '58%'),
      LabelValue('Raised the depth', '18%'),
      LabelValue('Removed the drift', '11%'),
    ],
    lineage: [
      LineageStep(title: 'Suspended', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Dream Drift', author: 'Mia Parker', note: 'Added the slow stereo drift'),
    ],
    safety: [
      'Designed to be played while falling asleep — do not use while driving.',
      'Contains sustained low frequency — keep the volume moderate on headphones.',
      'Not a treatment for any medical condition.',
    ],
    shelves: [Shelf.community, Shelf.picked],
  ),
  SessionRecord(
    slug: 'slow-piano-drift',
    title: 'Slow Piano Drift',
    photo: 'morning',
    gradient: [AppPrimitives.neutral800, AppPrimitives.info400],
    description: 'This helped Theo work through a long afternoon without stalling.',
    summary: 'Felt piano recorded close enough to hear the hammers, with the reverb tail left long and the tempo below anything you would tap a foot to. Written as something to work under, not to listen to.',
    author: 'Theo Lindqvist',
    authorPhoto: 'creatorTheo',
    authorRole: 'Community creator · 41 published sessions',
    plays: '73.2k',
    recreated: '6.1k',
    minutes: 32,
    category: 'Music',
    intent: 'Fill a room quietly enough that attention stays on the work, not the music.',
    outcome: [
      Outcome(label: 'Stayed on task', value: '+28%', note: 'self-reported, 4.1k listeners'),
      Outcome(label: 'Replayed it', value: '61%', note: 'played more than once in a week'),
      Outcome(label: 'Skipped early', value: '9%', note: 'stopped in the first 3 minutes'),
    ],
    layers: [
      SoundLayer(id: 'piano', name: 'Felt piano', detail: 'Close mic, sustain left down', level: 70),
      SoundLayer(id: 'tail', name: 'Reverb tail', detail: '6 second decay, no early reflections', level: 44),
      SoundLayer(id: 'room', name: 'Room noise', detail: 'The recording room, kept in on purpose', level: 22),
    ],
    chapters: [
      Chapter(label: 'Open', minutes: 6, detail: 'Single notes, a long way apart.'),
      Chapter(label: 'Settle', minutes: 18, detail: 'Phrases repeat without resolving.'),
      Chapter(label: 'Thin out', minutes: 8, detail: 'Notes drop away until only the tail is left.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Focus block length, time of day'),
      LabelValue('Voice', 'None — instrumental'),
      LabelValue('Ends', 'Fade to silence'),
      LabelValue('Best time', 'Deep work, afternoon'),
    ],
    commonChanges: [
      LabelValue('Made it longer', '54%'),
      LabelValue('Removed the room noise', '23%'),
      LabelValue('Shortened the reverb', '14%'),
    ],
    lineage: [
      LineageStep(title: 'Keys bed', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Slow Piano Drift', author: 'Theo Lindqvist', note: 'Recorded the piano and kept the room in'),
    ],
    safety: [
    ],
    shelves: [Shelf.community, Shelf.picked],
  ),
  SessionRecord(
    slug: '432-hz-strings',
    title: '432 Hz Strings',
    photo: 'mountains',
    gradient: [AppPrimitives.primary900, AppPrimitives.warning400],
    description: 'This helped Amara unwind after teaching without going straight to sleep.',
    summary: 'A string quartet bowed at the edge of audible, tuned to A=432 and recorded in one take. The bowing never stops, so the sound has no seams to catch on.',
    author: 'Amara Osei',
    authorPhoto: 'creatorAmara',
    authorRole: 'Community creator · 23 published sessions',
    plays: '48.7k',
    recreated: '3.4k',
    minutes: 18,
    category: 'Music',
    intent: 'Give the evening a shape without the sedative pull of a sleep track.',
    outcome: [
      Outcome(label: 'Felt settled', value: '+47%', note: 'self-reported, straight after'),
      Outcome(label: 'Finished it', value: '81%', note: 'played to the end'),
      Outcome(label: 'Recreated it', value: '3.4k', note: 'forks published'),
    ],
    layers: [
      SoundLayer(id: 'strings', name: 'Bowed quartet', detail: 'One take, A=432, no edits', level: 76),
      SoundLayer(id: 'sub', name: 'Sub drone', detail: 'Root note, an octave and a half down', level: 34),
      SoundLayer(id: 'air', name: 'Hall air', detail: 'The room the quartet sat in', level: 26),
    ],
    chapters: [
      Chapter(label: 'Draw', minutes: 5, detail: 'One chord, bowed slowly into place.'),
      Chapter(label: 'Hold', minutes: 9, detail: 'The chord moves a step at a time.'),
      Chapter(label: 'Release', minutes: 4, detail: 'Bows lift, the drone stays a moment longer.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Evening check-in, stress level'),
      LabelValue('Voice', 'None — instrumental'),
      LabelValue('Ends', 'Fade to silence'),
      LabelValue('Best time', 'Early evening'),
    ],
    commonChanges: [
      LabelValue('Lowered the sub drone', '36%'),
      LabelValue('Made it longer', '29%'),
      LabelValue('Added rain over it', '15%'),
    ],
    lineage: [
      LineageStep(title: 'Single tone', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Long bow', author: 'Sofia Martinez', note: 'Swapped the synth for strings'),
      LineageStep(title: '432 Hz Strings', author: 'Amara Osei', note: 'Recorded a live quartet in one take'),
    ],
    safety: [
      'Tuning claims are not medically established — this is music, not therapy.',
      'Not a treatment for any medical condition.',
    ],
    shelves: [Shelf.community],
  ),
  SessionRecord(
    slug: 'bowl-bath',
    title: 'Bowl Bath',
    photo: 'calm',
    gradient: [AppPrimitives.info800, AppPrimitives.neutral300],
    description: 'This helped Jonas end the day without reaching for his phone.',
    summary: 'Seven singing bowls struck in an order that never repeats, recorded far enough back that the strikes arrive softened. Long gaps are the point — the silence between bowls is most of the session.',
    author: 'Jonas Weber',
    authorPhoto: 'creatorJonas',
    authorRole: 'Community creator · 16 published sessions',
    plays: '31.9k',
    recreated: '2.7k',
    minutes: 25,
    category: 'Music',
    intent: 'Hold attention with sound sparse enough that the mind stops looking for the next thing.',
    outcome: [
      Outcome(label: 'Phone put down', value: '+38%', note: 'self-reported, 1.9k listeners'),
      Outcome(label: 'Felt calmer', value: '+44%', note: 'self-reported, straight after'),
      Outcome(label: 'Finished it', value: '72%', note: 'played to the end'),
    ],
    layers: [
      SoundLayer(id: 'bowls', name: 'Seven bowls', detail: 'Struck once each, never in the same order', level: 68),
      SoundLayer(id: 'decay', name: 'Decay tail', detail: 'Left to run out entirely before the next strike', level: 52),
      SoundLayer(id: 'floor', name: 'Room floor', detail: 'Wooden room, barely there', level: 18),
    ],
    chapters: [
      Chapter(label: 'First strike', minutes: 6, detail: 'One bowl at a time, gaps getting longer.'),
      Chapter(label: 'Between', minutes: 13, detail: 'More silence than sound.'),
      Chapter(label: 'Last', minutes: 6, detail: 'A single bowl, left to run out.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Bedtime, evening check-in'),
      LabelValue('Voice', 'None — instrumental'),
      LabelValue('Ends', 'Last decay, then silence'),
      LabelValue('Best time', 'The hour before bed'),
    ],
    commonChanges: [
      LabelValue('Shortened the gaps', '41%'),
      LabelValue('Made it longer', '26%'),
      LabelValue('Added a low drone', '19%'),
    ],
    lineage: [
      LineageStep(title: 'Single tone', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Bowl Bath', author: 'Jonas Weber', note: 'Recorded seven bowls and kept the silence'),
    ],
    safety: [
      'Sudden strikes can startle — keep the volume moderate on headphones.',
      'Not a treatment for any medical condition.',
    ],
    shelves: [Shelf.community, Shelf.impact],
  ),
  SessionRecord(
    slug: 'morning-spark',
    title: 'Morning Spark',
    photo: 'affirmations',
    gradient: [AppPrimitives.warning600, AppPrimitives.primary300],
    description: 'This helped Aria start the day awake instead of anxious.',
    summary: 'Eight minutes that climb: a pulse that speeds up by a few beats a minute, and a short affirmation set written in the second person, present tense. Meant for before the first message of the day.',
    author: 'Aria Moon',
    authorPhoto: 'creatorAria',
    authorRole: 'Community creator · 29 published sessions',
    plays: '88.4k',
    recreated: '11.2k',
    minutes: 8,
    category: 'Energy',
    intent: 'Lift the first ten minutes of the day without tipping it into urgency.',
    outcome: [
      Outcome(label: 'Woke up easier', value: '+35%', note: 'self-reported, 6.4k listeners'),
      Outcome(label: 'Used it again', value: '68%', note: 'played 3+ mornings in a week'),
      Outcome(label: 'Finished it', value: '91%', note: 'played to the end'),
    ],
    layers: [
      SoundLayer(id: 'pulse', name: 'Rising pulse', detail: '52 → 68 bpm across the session', level: 64),
      SoundLayer(id: 'voice', name: 'Affirmations', detail: 'Female, 9 lines, present tense', level: 58),
      SoundLayer(id: 'bells', name: 'Bright bells', detail: 'Marks each new line', level: 30),
    ],
    chapters: [
      Chapter(label: 'Wake', minutes: 2, detail: 'Pulse alone, slow.'),
      Chapter(label: 'Speak', minutes: 4, detail: 'Affirmations land on the pulse.'),
      Chapter(label: 'Go', minutes: 2, detail: 'Voice stops, the pulse finishes on its own.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Wake time, sleep score'),
      LabelValue('Voice', 'Female · warm'),
      LabelValue('Ends', 'Single bell'),
      LabelValue('Best time', 'First thing, before your phone'),
    ],
    commonChanges: [
      LabelValue('Rewrote the affirmations', '47%'),
      LabelValue('Removed the bells', '22%'),
      LabelValue('Slowed the pulse', '16%'),
    ],
    lineage: [
      LineageStep(title: 'Bright open', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Morning Spark', author: 'Aria Moon', note: 'Wrote the affirmation set and the rising pulse'),
    ],
    safety: [
      'Affirmations are written by the creator, not a clinician.',
      'Not a treatment for any medical condition.',
    ],
    shelves: [Shelf.community, Shelf.picked],
  ),
  SessionRecord(
    slug: 'cold-start',
    title: 'Cold Start',
    photo: 'breathwork',
    gradient: [AppPrimitives.info700, AppPrimitives.primary200],
    description: 'This helped Lucas get moving on the days he did not want to.',
    summary: 'Six minutes of paced breath at a deliberately quick tempo, cued over a rhythm that never lets the count drift. Built for the gap between deciding to start and actually starting.',
    author: 'Lucas Ferrari',
    authorPhoto: 'creatorLucas',
    authorRole: 'Community creator · 12 published sessions',
    plays: '26.3k',
    recreated: '5.6k',
    minutes: 6,
    category: 'Energy',
    intent: 'Raise alertness fast, without caffeine and without a long run-up.',
    outcome: [
      Outcome(label: 'Felt more alert', value: '+41%', note: 'self-reported, straight after'),
      Outcome(label: 'Started the task', value: '+33%', note: 'self-reported, 2.2k listeners'),
      Outcome(label: 'Finished it', value: '88%', note: 'played to the end'),
    ],
    layers: [
      SoundLayer(id: 'count', name: 'Breath count', detail: 'Male voice, 4-in 4-out, no pause', level: 62),
      SoundLayer(id: 'rhythm', name: 'Rhythm', detail: '96 bpm, dry, no reverb', level: 56),
      SoundLayer(id: 'lift', name: 'Lift', detail: 'Chord rises once per round', level: 38),
    ],
    chapters: [
      Chapter(label: 'Set', minutes: 1, detail: 'Rhythm alone, so the pace is obvious.'),
      Chapter(label: 'Rounds', minutes: 4, detail: 'Four rounds, each a little quicker.'),
      Chapter(label: 'Stop', minutes: 1, detail: 'Everything cuts; you are left standing.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Energy check-in, time of day'),
      LabelValue('Voice', 'Male · direct'),
      LabelValue('Ends', 'Hard stop, no fade'),
      LabelValue('Best time', 'Mid-morning, or before training'),
    ],
    commonChanges: [
      LabelValue('Slowed the pace', '38%'),
      LabelValue('Removed the voice', '27%'),
      LabelValue('Added a fourth round', '13%'),
    ],
    lineage: [
      LineageStep(title: 'Bright open', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Cold Start', author: 'Lucas Ferrari', note: 'Wrote the rounds and the hard stop'),
    ],
    safety: [
      'Quick paced breathing can cause light-headedness — sit down and stop if you feel dizzy.',
      'Skip this one if you are pregnant or have a heart or respiratory condition.',
      'Not a treatment for any medical condition.',
    ],
    shelves: [Shelf.community],
  ),
  SessionRecord(
    slug: 'body-scan-slowly',
    title: 'Body Scan, Slowly',
    photo: 'stress',
    gradient: [AppPrimitives.success900, AppPrimitives.success500],
    description: 'This helped Mia notice tension she had been carrying all day.',
    summary: 'A body scan given at half the usual pace, with long silences where most recordings keep talking. Twenty-eight minutes from the scalp down, and no instruction to relax anything.',
    author: 'Mia Ortiz',
    authorPhoto: 'creatorMia',
    authorRole: 'Community creator · 31 published sessions',
    plays: '57.6k',
    recreated: '4.2k',
    minutes: 28,
    category: 'Meditations',
    intent: 'Notice what the body is doing, without asking it to do anything else.',
    outcome: [
      Outcome(label: 'Noticed tension', value: '+58%', note: 'self-reported, 3.7k listeners'),
      Outcome(label: 'Felt calmer', value: '+39%', note: 'self-reported, straight after'),
      Outcome(label: 'Finished it', value: '64%', note: 'played to the end'),
    ],
    layers: [
      SoundLayer(id: 'voice', name: 'Guidance', detail: 'Female, slow, long gaps between cues', level: 66),
      SoundLayer(id: 'bed', name: 'Warm bed', detail: 'One sustained chord, barely moving', level: 30),
      SoundLayer(id: 'silence', name: 'Silence', detail: 'Roughly a third of the session', level: 0),
    ],
    chapters: [
      Chapter(label: 'Arrive', minutes: 4, detail: 'Weight, contact, nothing to change.'),
      Chapter(label: 'Down', minutes: 18, detail: 'Scalp to feet, one region at a time.'),
      Chapter(label: 'Whole', minutes: 6, detail: 'The body as one thing, then quiet.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Stress check-in, time available'),
      LabelValue('Voice', 'Female · slow'),
      LabelValue('Ends', 'Silence, no chime'),
      LabelValue('Best time', 'End of the working day'),
    ],
    commonChanges: [
      LabelValue('Made it shorter', '44%'),
      LabelValue('Added a closing chime', '25%'),
      LabelValue('Swapped the voice', '18%'),
    ],
    lineage: [
      LineageStep(title: 'Guided bed', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Body Scan, Slowly', author: 'Mia Ortiz', note: 'Halved the pace and kept the silences'),
    ],
    safety: [
      'Body scans can surface discomfort — stop if anything feels distressing.',
      'Not a treatment for any medical condition.',
    ],
    shelves: [Shelf.community, Shelf.impact],
  ),
  SessionRecord(
    slug: 'noting-practice',
    title: 'Noting Practice',
    photo: 'bloom',
    gradient: [AppPrimitives.warning700, AppPrimitives.primary200],
    description: 'This helped Ethan stop arguing with his own thoughts.',
    summary: 'The plainest practice in the catalogue: name what is happening in one word, let it go, wait for the next one. A bell every ninety seconds, and nothing else.',
    author: 'Ethan Miller',
    authorPhoto: 'creatorEthan',
    authorRole: 'Community creator · 52 published sessions',
    plays: '112k',
    recreated: '14.6k',
    minutes: 15,
    category: 'Meditations',
    intent: 'Give a restless mind one job small enough to actually do.',
    outcome: [
      Outcome(label: 'Less rumination', value: '−31%', note: 'self-reported, 8.9k listeners'),
      Outcome(label: 'Practised again', value: '73%', note: 'returned within a week'),
      Outcome(label: 'Finished it', value: '84%', note: 'played to the end'),
    ],
    layers: [
      SoundLayer(id: 'bell', name: 'Bell', detail: 'Every 90 seconds, same pitch', level: 48),
      SoundLayer(id: 'voice', name: 'Guidance', detail: 'Male, 5 cues in total', level: 44),
      SoundLayer(id: 'room', name: 'Room', detail: 'Quiet room tone, nothing added', level: 14),
    ],
    chapters: [
      Chapter(label: 'How', minutes: 3, detail: 'One word, then let it go. That is the whole instruction.'),
      Chapter(label: 'Practice', minutes: 10, detail: 'Bells only; you do the noting.'),
      Chapter(label: 'Close', minutes: 2, detail: 'A last cue, then the room.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Practice history, time available'),
      LabelValue('Voice', 'Male · plain'),
      LabelValue('Ends', 'Single bell'),
      LabelValue('Best time', 'Any time your head is loud'),
    ],
    commonChanges: [
      LabelValue('Made it longer', '49%'),
      LabelValue('Removed the bells', '21%'),
      LabelValue('Added a background bed', '17%'),
    ],
    lineage: [
      LineageStep(title: 'Bare bell', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Noting Practice', author: 'Ethan Miller', note: 'Cut everything except the bell and five cues'),
    ],
    safety: [
      'Sitting with difficult thoughts is not right for everyone — stop if it feels distressing.',
      'Not a treatment for any medical condition.',
    ],
    shelves: [Shelf.community, Shelf.picked, Shelf.impact],
  ),
  SessionRecord(
    slug: 'night-rain-sleep',
    title: 'Night Rain Sleep',
    photo: 'sleep',
    gradient: [AppPrimitives.primary950, AppPrimitives.info700],
    description: 'This helped Sophia fall asleep without the room feeling empty.',
    summary: 'Steady rain on a flat roof, recorded for six hours and cut to the least eventful fifty minutes of it. No thunder, no wind, nothing that resolves — the point is that nothing happens.',
    author: 'Sophia Reynolds',
    authorPhoto: 'creatorSophia',
    authorRole: 'Community creator · 27 published sessions',
    plays: '204k',
    recreated: '7.3k',
    minutes: 50,
    category: 'Sleep',
    intent: 'Cover the silence a quiet bedroom leaves, without giving the ear anything to follow.',
    outcome: [
      Outcome(label: 'Fell asleep faster', value: '−14 min', note: 'median, 11.4k listeners'),
      Outcome(label: 'Woke less', value: '−22%', note: 'self-reported night wakings'),
      Outcome(label: 'Played to sleep', value: '79%', note: 'still playing at the end'),
    ],
    layers: [
      SoundLayer(id: 'rain', name: 'Roof rain', detail: 'Flat roof, steady, no gusts', level: 78),
      SoundLayer(id: 'gutter', name: 'Gutter', detail: 'Water running, far off', level: 34),
      SoundLayer(id: 'sub', name: 'Low bed', detail: 'Fills under the rain so it is not thin', level: 24),
    ],
    chapters: [
      Chapter(label: 'Settle', minutes: 10, detail: 'Rain comes up from nothing.'),
      Chapter(label: 'Steady', minutes: 32, detail: 'Unchanging, on purpose.'),
      Chapter(label: 'Thin', minutes: 8, detail: 'Rain eases; the low bed goes last.'),
    ],
    personalization: [
      LabelValue('Adapts to', 'Bedtime, sleep score'),
      LabelValue('Voice', 'None — field recording'),
      LabelValue('Ends', 'Fade to silence, no chime'),
      LabelValue('Best time', 'In bed, lights out'),
    ],
    commonChanges: [
      LabelValue('Looped it all night', '62%'),
      LabelValue('Removed the low bed', '19%'),
      LabelValue('Added distant thunder', '12%'),
    ],
    lineage: [
      LineageStep(title: 'Room tone', author: 'Aurelia', note: 'Starter template'),
      LineageStep(title: 'Night Rain Sleep', author: 'Sophia Reynolds', note: 'Recorded six hours and kept the dullest fifty minutes'),
    ],
    safety: [
      'Designed to be played while falling asleep — do not use while driving.',
      'Not a treatment for any medical condition.',
    ],
    shelves: [Shelf.community],
  ),
];

SessionRecord? findSession(String? slug) {
  for (final session in kSessions) {
    if (session.slug == slug) return session;
  }
  return null;
}

List<SessionRecord> sessionsOnShelf(Shelf shelf, [String category = kAllCategories]) => kSessions
    .where((session) =>
        session.shelves.contains(shelf) &&
        (category == kAllCategories || session.category == category))
    .toList();

/// The same filter over the whole catalogue, for surfaces that are not a shelf.
List<SessionRecord> sessionsInCategory([String category = kAllCategories]) => category == kAllCategories
    ? kSessions
    : kSessions.where((session) => session.category == category).toList();
