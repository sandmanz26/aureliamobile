import 'package:flutter/material.dart';

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
  bool _signedIn = false;

  bool get signedIn => _signedIn;

  void signIn() {
    if (_signedIn) return;
    _signedIn = true;
    notifyListeners();
  }

  void signOut() {
    if (!_signedIn) return;
    _signedIn = false;
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
