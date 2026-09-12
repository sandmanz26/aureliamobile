/// Challenges — the community's shared, time-boxed programme.
///
/// A challenge is not a session: it is a streak people join, ranked by days
/// completed, with sessions created for it. Kept separate from the session
/// catalogue for that reason, and linked to it by slug.
library;

import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

enum Trend { up, down }

/// One entry on a challenge leaderboard.
///
/// The board ranks *sessions made for the challenge*, not the people in it, so
/// what competes is the work and the creator is credited beside it. The session
/// is a slug into the catalogue, so a title or cover can never drift from the
/// session it names; the creator lives on the entry because a challenge entry
/// is someone's own take on that session, not its original.
class Contender {
  const Contender({
    required this.rank,
    required this.sessionSlug,
    required this.creator,
    required this.creatorPhoto,
    required this.plays,
    required this.trend,
  });

  final int rank;
  final String sessionSlug;
  final String creator;
  final String creatorPhoto;

  /// Plays — what the board is ranked by.
  final String plays;

  /// Movement since the last update; null on the podium, which has no arrow.
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
      Contender(rank: 1, sessionSlug: 'dolphins-frequency', creator: 'Aria Moon', creatorPhoto: 'creatorAria', plays: '12,687', trend: null),
      Contender(rank: 2, sessionSlug: 'deep-grounding', creator: 'Maya Rivers', creatorPhoto: 'creatorMaya', plays: '11,234', trend: null),
      Contender(rank: 3, sessionSlug: 'cosmic-flow', creator: 'Theo Waves', creatorPhoto: 'creatorTheo', plays: '10,052', trend: null),
      Contender(rank: 4, sessionSlug: 'ocean-breath', creator: 'Amara Osei', creatorPhoto: 'creatorAmara', plays: '9,564', trend: Trend.up),
      Contender(rank: 5, sessionSlug: 'golden-hour', creator: 'Jonas Weber', creatorPhoto: 'creatorJonas', plays: '9,123', trend: Trend.down),
      Contender(rank: 6, sessionSlug: 'dream-drift', creator: 'Adam Nilson', creatorPhoto: 'avatar', plays: '8,761', trend: Trend.up),
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
