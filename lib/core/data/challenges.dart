/// Challenges — the community's shared, time-boxed programme.
///
/// A challenge is not a session: it is a streak people join, ranked by days
/// completed, with sessions created for it. Kept separate from the session
/// catalogue for that reason, and linked to it by slug.
library;

import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

enum Trend { up, down }

class Contender {
  const Contender({
    required this.rank,
    required this.name,
    required this.photo,
    required this.days,
    required this.joined,
    required this.trend,
  });

  final int rank;
  final String name;
  final String photo;

  /// Days completed — what the leaderboard is actually ranked by.
  final int days;

  final String joined;

  /// Movement since the last update; null for the podium, which has no arrow.
  final Trend? trend;
}

class ChallengeRecord {
  const ChallengeRecord({
    required this.slug,
    required this.title,
    required this.summary,
    required this.photo,
    required this.gradient,
    required this.joined,
    required this.endsInDays,
    required this.totalDays,
    required this.minutesPerDay,
    required this.yourDay,
    required this.leaderboard,
    required this.sessionSlugs,
  });

  final String slug;
  final String title;
  final String summary;
  final String photo;
  final List<Color> gradient;
  final String joined;
  final int endsInDays;
  final int totalDays;
  final int minutesPerDay;

  /// Where the current user stands, or null if they have not joined.
  final int? yourDay;

  /// Ranked, best first. The first three render as the podium.
  final List<Contender> leaderboard;

  /// Sessions made for this challenge, by slug.
  final List<String> sessionSlugs;
}

const kChallenges = <ChallengeRecord>[
  ChallengeRecord(
    slug: 'nervous-system-reset',
    title: '30-Day Nervous System Reset',
    summary: 'Slow down and build a calmer daily rhythm.',
    photo: 'neural',
    gradient: [AppPrimitives.neutral950, AppPrimitives.warning700],
    joined: '2.3k',
    endsInDays: 18,
    totalDays: 30,
    minutesPerDay: 8,
    yourDay: 6,
    leaderboard: [
    Contender(
      rank: 1,
      name: 'Aria Moon',
      photo: 'creatorAria',
      days: 27,
      joined: '2026.1.14',
      trend: null,
    ),
    Contender(
      rank: 2,
      name: 'Maya Rivers',
      photo: 'creatorMaya',
      days: 21,
      joined: '2026.1.19',
      trend: null,
    ),
    Contender(
      rank: 3,
      name: 'Theo Waves',
      photo: 'creatorTheo',
      days: 19,
      joined: '2026.2.02',
      trend: null,
    ),
    Contender(
      rank: 4,
      name: 'Amara Osei',
      photo: 'creatorAmara',
      days: 27,
      joined: '2026.2.23',
      trend: Trend.up,
    ),
    Contender(
      rank: 5,
      name: 'Jonas Weber',
      photo: 'creatorJonas',
      days: 21,
      joined: '2026.6.21',
      trend: Trend.down,
    ),
    Contender(
      rank: 6,
      name: 'Adam Nilson',
      photo: 'avatar',
      days: 19,
      joined: '2026.12.10',
      trend: Trend.up,
    ),
    ],
    sessionSlugs: ['mind-dance', 'inner-balance'],
  ),
];

ChallengeRecord? findChallenge(String? slug) {
  for (final challenge in kChallenges) {
    if (challenge.slug == slug) return challenge;
  }
  return null;
}
