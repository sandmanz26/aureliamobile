/// The signal sources behind My Wellness — the mobile mirror of the web app's
/// `src/lib/signals.ts`.
///
/// A "signal" is anything Aurelia can read to decide what a session should be.
/// They are grouped by what they tell it about: the body, the day, and the room
/// you are in. A real build swaps this for the `integrations` table and an OAuth
/// connection per source.
library;

import 'package:flutter/material.dart';

enum SignalGroup { biological, cognitive, atmospheric }

extension SignalGroupLabel on SignalGroup {
  String get label => switch (this) {
        SignalGroup.biological => 'Biological',
        SignalGroup.cognitive => 'Cognitive',
        SignalGroup.atmospheric => 'Atmospheric',
      };
}

class SignalSource {
  const SignalSource({
    required this.id,
    required this.name,
    required this.group,
    required this.icon,
    required this.defaultOn,
    required this.reads,
  });

  final String id;
  final String name;
  final SignalGroup group;
  final IconData icon;

  /// Whether it is connected out of the box, before the visitor touches it.
  final bool defaultOn;

  /// What Aurelia actually reads from it.
  ///
  /// Not rendered — the design's rows are a single line. Kept because it is the
  /// content the consent story needs somewhere, and because whatever the
  /// integration pulls has to match it.
  final String reads;
}

const kSignalSources = <SignalSource>[
  SignalSource(
    id: 'apple-watch',
    name: 'Apple Watch',
    group: SignalGroup.biological,
    icon: Icons.watch_outlined,
    defaultOn: true,
    reads: 'Heart rate, sleep stages, activity',
  ),
  SignalSource(
    id: 'oura-ring',
    name: 'Oura Ring',
    group: SignalGroup.biological,
    icon: Icons.radio_button_checked,
    defaultOn: false,
    reads: 'Readiness, HRV, body temperature',
  ),
  SignalSource(
    id: 'google-calendar',
    name: 'Google Calendar',
    group: SignalGroup.cognitive,
    icon: Icons.calendar_month_outlined,
    defaultOn: true,
    reads: 'Busy blocks only — never titles or guests',
  ),
  SignalSource(
    id: 'conversation-history',
    name: 'Conversation History',
    group: SignalGroup.cognitive,
    icon: Icons.forum_outlined,
    defaultOn: true,
    reads: 'What you asked Aurelia for, and what helped',
  ),
  SignalSource(
    id: 'weather-data',
    name: 'Weather Data',
    group: SignalGroup.atmospheric,
    icon: Icons.wb_cloudy_outlined,
    defaultOn: true,
    reads: 'Daylight, pressure, temperature',
  ),
  SignalSource(
    id: 'location-data',
    name: 'Location Data',
    group: SignalGroup.atmospheric,
    icon: Icons.place_outlined,
    defaultOn: false,
    reads: 'Coarse area, to know the season and daylight',
  ),
];

List<SignalSource> sourcesInGroup(SignalGroup group) =>
    kSignalSources.where((source) => source.group == group).toList();

/// The state the screen opens in.
Map<String, bool> defaultConnections() => {
      for (final source in kSignalSources) source.id: source.defaultOn,
    };
