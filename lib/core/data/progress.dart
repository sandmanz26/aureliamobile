/// What a session has done since it was made — the three tabs behind Insights.
///
/// The mobile mirror of the web app's `src/lib/progress.ts`. Mock, like the
/// rest of `core/data`, and deliberately specific for the same reason: a demo
/// full of zeroes cannot be reasoned about. Nothing here came from a
/// measurement.
///
/// Everything is keyed off a session rather than global, because Progress is
/// opened from a session's own cockpit and is about that one.
library;

import 'package:flutter/material.dart';
import 'sessions.dart';

enum ProgressTab { chapters, social, insights }

/// One earlier cut of the session, newest first.
class Version {
  const Version({
    required this.id,
    required this.title,
    required this.chapter,
    required this.detail,
    required this.author,
    required this.authorPhoto,
    required this.delta,
    required this.minutes,
    required this.photo,
    required this.gradient,
  });

  final String id;
  final String title;

  /// The change this version made, as its author described it.
  final String chapter;
  final String detail;
  final String author;
  final String authorPhoto;

  /// How much it moved the objective.
  final String delta;
  final String minutes;
  final String photo;
  final List<Color> gradient;
}

/// Something a listener did with the session, and what it earned.
class CommunityEvent {
  const CommunityEvent({
    required this.id,
    required this.person,
    required this.did,
    required this.when,
    required this.coins,
  });

  final String id;
  final String person;
  final String did;
  final String when;
  final String coins;
}

/// A step in the chain this session came from or spawned.
class LineageEntry {
  const LineageEntry({
    required this.id,
    required this.title,
    required this.author,
    required this.authorPhoto,
    required this.date,
  });

  final String id;
  final String title;
  final String author;
  final String authorPhoto;
  final String date;
}

/// A pattern Aurelia claims to have noticed.
class Insight {
  const Insight({required this.id, required this.title, required this.body, required this.date});

  final String id;
  final String title;
  final String body;
  final String date;
}

class Progress {
  const Progress({
    required this.objective,
    required this.versions,
    required this.earnings,
    required this.timesPlayed,
    required this.recreated,
    required this.community,
    required this.communityTotal,
    required this.lineage,
    required this.lineageTotal,
    required this.insights,
  });

  final String objective;
  final List<Version> versions;
  final String earnings;
  final String timesPlayed;
  final String recreated;
  final List<CommunityEvent> community;
  final int communityTotal;
  final List<LineageEntry> lineage;
  final int lineageTotal;
  final List<Insight> insights;
}

/// The goal a listener sets, by the kind of session they set it against.
///
/// Not `session.intent`: that is the creator's sentence about what the mix is
/// for and it runs long. The objective is the listener's own goal, short
/// enough to sit on one line beside an edit button, as the frame has it.
const _objectives = <String, String>{
  'Sleep': 'Improve my sleep',
  'Calm': 'Lower my stress',
  'Energy': 'Start the day better',
  'Music': 'Find my focus',
  'Meditations': 'Build a daily practice',
};

const _lineageDates = ['2026.2.23', '2026.6.21', '2026.12.10'];

/// Built from the session so the numbers agree with the row that opened it — a
/// session showing 124k plays in the list must not show something else here.
/// The rest is invented per the file's own standard.
Progress progressFor(SessionRecord session) {
  // "22:22 mins", not the bare "22:22" the session row carries: on a version
  // card the figure sits beside a clock glyph with no column heading to say
  // what it is, so the unit comes with it. The web does the same.
  final clock = '${session.durationLabel} mins';
  // A draft has earned nothing and been played by nobody, which is the whole
  // difference between it and a session that is out.
  final draft = !session.published;

  return Progress(
    objective: _objectives[session.category] ?? 'Feel better day to day',
    versions: [
      Version(
        id: 'v3',
        title: '${session.title} v1.3',
        chapter: session.chapters.length > 1
            ? session.chapters[1].label
            : 'The Off-Switch',
        detail: session.chapters.length > 1
            ? session.chapters[1].detail
            : session.summary,
        author: session.author,
        authorPhoto: session.authorPhoto,
        delta: '12%',
        minutes: clock,
        photo: session.photo,
        gradient: session.gradient,
      ),
      Version(
        id: 'v2',
        title: '${session.title} v1.2',
        chapter: session.chapters.isNotEmpty ? session.chapters.first.label : 'Arrival',
        detail: session.chapters.isNotEmpty ? session.chapters.first.detail : session.summary,
        author: session.author,
        authorPhoto: session.authorPhoto,
        delta: '8%',
        minutes: clock,
        photo: 'bloom',
        gradient: session.gradient,
      ),
    ],
    earnings: draft ? '0' : '2,521',
    timesPlayed: draft ? '0' : session.plays,
    recreated: draft ? '0' : session.recreated,
    community: draft
        ? const []
        : const [
            CommunityEvent(
              id: 'dolores',
              person: 'Dolores',
              did: 'improved her sleep today using your session',
              when: 'Today',
              coins: '+10',
            ),
            CommunityEvent(
              id: 'hanna',
              person: 'Hanna',
              did: 'recreated her own version using your session',
              when: 'Yesterday',
              coins: '+25',
            ),
          ],
    communityTotal: draft ? 0 : 10,
    lineage: [
      for (var i = 0; i < session.lineage.length; i++)
        LineageEntry(
          id: '${session.lineage[i].author}-$i',
          title: session.lineage[i].title,
          author: session.lineage[i].author,
          authorPhoto:
              i == session.lineage.length - 1 ? session.authorPhoto : 'avatar',
          date: i < _lineageDates.length ? _lineageDates[i] : '2026.6.21',
        ),
    ],
    lineageTotal: 10,
    insights: const [
      Insight(
        id: 'coffee',
        title: 'Less coffee, better sleep',
        body: 'On days when you drink less coffee, you tend to sleep better and wake up feeling more rested the next day.',
        date: '2026.6.21',
      ),
      Insight(
        id: 'routine',
        title: 'Your sleep likes a routine',
        body: 'Your sleep quality tends to improve when you go to bed and wake up around the same time, helping your body settle into a more regular rhythm.',
        date: '2026.6.21',
      ),
      Insight(
        id: 'active',
        title: 'Active days, deeper rest',
        body: 'You tend to get better-quality sleep on days when you’re more physically active, suggesting that movement may be helping you wind down at night.',
        date: '2026.6.21',
      ),
      Insight(
        id: 'evenings',
        title: 'Your evenings matter more than you think',
        body: 'You tend to sleep better on evenings with less screen time, which may give your mind more space to slow down before bed.',
        date: '2026.6.21',
      ),
    ],
  );
}

/// One cut of a session, by the id its card carries — what the player is asked
/// for when you press play on a version rather than on the session itself.
///
/// Null when nothing is asked for, which is the session as it stands.
Version? findVersion(SessionRecord session, String? id) {
  if (id == null) return null;
  for (final version in progressFor(session).versions) {
    if (version.id == id) return version;
  }
  return null;
}
