/// The three changes Aurelia proposes after its diagnosis — the mobile mirror
/// of the web app's `RECOMMENDATIONS`.
///
/// Lifted out of the chat screen because two surfaces show them now: the
/// cockpit, where each one is a change you add to or drop from the set being
/// built, and the player, where the same three are starting points to fork.
library;

class Recommendation {
  const Recommendation({
    required this.id,
    required this.title,
    required this.description,
    required this.improveScore,
    required this.orb,
    required this.preview,
  });

  final String id;
  final String title;
  final String description;
  final String improveScore;

  /// Asset path — the same PNG the web app ships.
  final String orb;

  /// The session this change previews against, for the play glyph on the orb.
  final String preview;
}

const kRecommendations = <Recommendation>[
  Recommendation(
    id: 'yellow',
    title: 'Increase yellow',
    description: 'Helps bring joy, aligned with your goal',
    improveScore: '12%',
    orb: 'assets/images/orb-increase-yellow.png',
    preview: 'dolphins-frequency',
  ),
  Recommendation(
    id: 'movement',
    title: 'Less movement',
    description: 'Reduced movement helps your nervous system to calm down',
    improveScore: '12%',
    orb: 'assets/images/orb-less-movement.png',
    preview: 'deep-grounding',
  ),
  Recommendation(
    id: 'frequency',
    title: '432Hz',
    description: 'Your body responds positively to this frequency.',
    improveScore: '12%',
    orb: 'assets/images/orb-432hz.png',
    preview: '528-hz-reset',
  ),
];
