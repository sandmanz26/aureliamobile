import 'package:flutter/material.dart';
import '../analytics/analytics_service.dart';
import 'sso.dart';

/// Who is using the app — the mobile mirror of the web app's AuthContext.
///
/// Home is open to everyone: a visitor can read the whole pitch before handing
/// over an email. The moment they try to *do* something — ask Aurelia, open a
/// session, recreate, press a CTA — they are asked to sign in and land back
/// where they were headed.
///
/// There is no backend yet, so "signed in" is a flag in memory. Everything that
/// reads it goes through this scope, so swapping in a real session token is one
/// file.
class AuthController extends ChangeNotifier {
  AuthController({AnalyticsService? analytics})
      : _analytics = analytics ?? const NoopAnalytics();

  final AnalyticsService _analytics;

  bool _signedIn = false;
  SsoAccount? _account;

  bool get signedIn => _signedIn;

  /// The provider account, when that is how you got in. Null after an
  /// email-and-password sign-in, which is most of the app's paths today.
  SsoAccount? get account => _account;

  /// Which button you came in through, for the one place it is worth saying:
  /// "you already have an account, with Google" when somebody returns through
  /// the other one.
  SsoProviderId? get provider => _account?.provider;

  /// [isSignUp] is the only thing that tells `sign_up` and `login` apart —
  /// the three forms that reach this (sign in, sign up, reset-then-continue)
  /// all call the same method, so the screen states which one it is rather
  /// than this guessing from nothing.
  void signIn({String method = 'email', bool isSignUp = false}) {
    if (_signedIn) return;
    _signedIn = true;
    _analytics.logEvent(isSignUp ? 'sign_up' : 'login', parameters: {'method': method});
    notifyListeners();
  }

  /// The same, carrying what the provider handed back. Google and Apple do
  /// not tell this dummy seam new-account from returning one apart — see
  /// `docs/SSO.md` — so both log as `login`; that stops being accurate the
  /// day a real provider is wired in and can say which one it was.
  void signInWith(SsoAccount account) {
    _account = account;
    _signedIn = true;
    _analytics.logEvent('login', parameters: {'method': account.provider.name});
    notifyListeners();
  }

  void signOut() {
    if (!_signedIn) return;
    _signedIn = false;
    _account = null;
    _analytics.logEvent('logout');
    notifyListeners();
  }
}

class AuthScope extends InheritedNotifier<AuthController> {
  const AuthScope({super.key, required AuthController super.notifier, required super.child});

  static AuthController of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AuthScope>();
    assert(scope?.notifier != null, 'AuthScope is missing above this widget');
    return scope!.notifier!;
  }
}

/// Guards a control that sits on an open screen but needs an account behind it.
///
/// Returns true when the action ran. When it did not, the sign-in screen is
/// pushed with [destination] remembered, so finishing sign-in continues to the
/// place the tap was aiming at rather than dropping the user on Home.
Future<bool> requireSignIn(
  BuildContext context, {
  String? destination,
  Object? arguments,
  VoidCallback? then,
}) async {
  final auth = AuthScope.of(context);
  if (auth.signedIn) {
    then?.call();
    return true;
  }
  await Navigator.of(context).pushNamed(
    '/login',
    arguments: destination == null ? null : {'route': destination, 'arguments': arguments},
  );
  if (!context.mounted) return false;
  if (AuthScope.of(context).signedIn) {
    then?.call();
    return true;
  }
  return false;
}
