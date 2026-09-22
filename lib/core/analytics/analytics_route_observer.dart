/// Screen views, for free, on every route — instead of nineteen screens each
/// remembering to announce themselves in `initState`.
///
/// A [NavigatorObserver] rather than a call inside `_onGenerateRoute` in
/// `main.dart`: the route table only runs when a screen is *pushed*, so it
/// would miss the case this app leans on hardest — walking back to the
/// cockpit or the player and landing on a screen that is already built.
/// [didPop] covers that: the route popping off hands back `previousRoute`,
/// which is what is on screen again.
library;

import 'package:flutter/material.dart';
import 'analytics_service.dart';

class AnalyticsRouteObserver extends RouteObserver<PageRoute<dynamic>> {
  AnalyticsRouteObserver(this._analytics);

  final AnalyticsService _analytics;

  void _record(Route<dynamic>? route) {
    if (route is! PageRoute) return;
    // Every route in this app is named — see the switch in `_onGenerateRoute`
    // — so a null name would mean a new route was added without one, worth
    // seeing in the console rather than silently dropping the event.
    _analytics.logScreenView(route.settings.name ?? 'unnamed');
  }

  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    _record(route);
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    // previousRoute is what becomes visible again — a screen that was
    // already built, the case `initState` cannot see and the reason this is
    // an observer and not a line in the route table.
    _record(previousRoute);
  }

  @override
  void didReplace({Route<dynamic>? newRoute, Route<dynamic>? oldRoute}) {
    _record(newRoute);
  }
}
