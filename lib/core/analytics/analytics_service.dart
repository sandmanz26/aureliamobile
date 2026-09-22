/// The one place this app records that something happened.
///
/// Same bargain as [AudioEngine]/[VoiceCapture]: a screen or controller knows
/// *when* an event is worth recording, an [AnalyticsService] owns *where it
/// goes*. That is what keeps the tests able to assert "this fired" without a
/// network call anywhere near them, and what keeps a real vendor SDK — once
/// this app has a backend and a project to send events to — a matter of
/// writing one new class and handing it to [AureliaApp], not touching the
/// eighteen screens that call [AnalyticsService.logEvent] today.
///
/// **Nothing in this file leaves the device.** There is no backend yet (see
/// CLAUDE.md), so there is nowhere honest to send an event to — [ConsoleLog]
/// is the default and it only ever writes to the device's own debug console,
/// and only in a debug build. Wiring in Firebase, Amplitude, Mixpanel or
/// similar later is exactly the [AnalyticsService] seam other plugins already
/// use here: implement the interface, pass it to `AureliaApp(analytics: ...)`,
/// nothing else changes.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

/// One recorded fact: a name and whatever detail makes it useful later.
///
/// Parameter **values** only ever carry small, closed pieces of information —
/// a slug, a method name, a count — never free text a person typed. A chat
/// message's own words, a voice note's transcript, an email address: none of
/// that belongs in an event, on this app or any other, because an analytics
/// pipeline is not access-controlled the way the product itself is. See
/// `chat_message_sent`, which records that one was sent and whether it was a
/// voice note, and nothing about what was said.
@immutable
class AnalyticsEvent {
  const AnalyticsEvent(this.name, [this.parameters = const {}]);

  final String name;
  final Map<String, Object?> parameters;

  @override
  String toString() =>
      parameters.isEmpty ? name : '$name $parameters';
}

/// What a screen or controller can do with this app's analytics.
///
/// Two calls rather than one: [logEvent] is something that happened —
/// a tap, a state change, a fork started — and [logScreenView] is where the
/// user is, which [AnalyticsRouteObserver] calls on every navigation so no
/// screen has to remember to announce itself.
abstract class AnalyticsService {
  void logEvent(String name, {Map<String, Object?> parameters = const {}});

  void logScreenView(String screenName);
}

/// The default. Prints to the debug console and nowhere else — see the file
/// comment for why that is the honest default rather than a placeholder for
/// a vendor SDK this app does not have credentials for.
class ConsoleAnalytics implements AnalyticsService {
  const ConsoleAnalytics();

  @override
  void logEvent(String name, {Map<String, Object?> parameters = const {}}) {
    if (!kDebugMode) return;
    debugPrint('[analytics] ${AnalyticsEvent(name, parameters)}');
  }

  @override
  void logScreenView(String screenName) {
    if (!kDebugMode) return;
    debugPrint('[analytics] screen_view {screen: $screenName}');
  }
}

/// Records nothing anywhere — for a test that does not care what fired.
///
/// Distinct from [ConsoleAnalytics] in debug builds of the test binary: a
/// widget test's `debugPrint` output is real console noise across 62 tests,
/// and most of them have no opinion on analytics at all. The handful that do
/// install [RecordingAnalytics] instead.
class NoopAnalytics implements AnalyticsService {
  const NoopAnalytics();

  @override
  void logEvent(String name, {Map<String, Object?> parameters = const {}}) {}

  @override
  void logScreenView(String screenName) {}
}

/// Keeps every call instead of acting on it — what the tests that *do* care
/// install, so a test can assert "applying two recommendations logged
/// `recommendations_applied` with count: 2" the same way they assert on a
/// rendered widget, rather than parsing debug console output.
class RecordingAnalytics implements AnalyticsService {
  final events = <AnalyticsEvent>[];
  final screenViews = <String>[];

  @override
  void logEvent(String name, {Map<String, Object?> parameters = const {}}) {
    events.add(AnalyticsEvent(name, parameters));
  }

  @override
  void logScreenView(String screenName) {
    screenViews.add(screenName);
  }

  /// Whether an event with this name was logged at all — most assertions
  /// only need that, not the parameters.
  bool has(String name) => events.any((event) => event.name == name);
}

/// Makes the app's [AnalyticsService] reachable from any widget, for the
/// calls that belong to a screen rather than a controller — a button whose
/// tap has no other state to change, or a failure a widget catches itself
/// (see `SocialSignIn`, which logs `login_failed` from its own `catch`).
///
/// A plain [InheritedWidget], not a [ChangeNotifier] scope like [AuthScope]
/// or [PlaybackScope]: the service instance is fixed for the app's lifetime
/// and nothing above a widget should ever rebuild because an event fired —
/// logging one is a side effect, not state a screen reads.
class AnalyticsScope extends InheritedWidget {
  const AnalyticsScope({
    super.key,
    required this.analytics,
    required super.child,
  });

  final AnalyticsService analytics;

  static AnalyticsService of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AnalyticsScope>();
    assert(scope != null, 'AnalyticsScope is missing above this widget');
    return scope!.analytics;
  }

  @override
  bool updateShouldNotify(AnalyticsScope oldWidget) =>
      analytics != oldWidget.analytics;
}
