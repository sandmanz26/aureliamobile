/// Single sign-on, as a seam with nothing real behind it yet.
///
/// The two buttons on the auth forms have always been decoration: both called
/// the same handler and signed you straight in, so there was no way to tell
/// Google from Apple, no loading state, and no way for either to fail. This
/// file is the shape the real thing has — one provider per button, an account
/// coming back, and the three ways it does not.
///
/// **Nothing here talks to Google or Apple.** [DummySsoProvider] returns a
/// fixed account after a short pause. Swapping in `google_sign_in` and
/// `sign_in_with_apple` means writing one class each against [SsoProvider];
/// no screen changes. `docs/SSO.md` has what those two need from the outside
/// — client IDs, entitlements, a backend to verify the token — because that
/// part is configuration and paperwork rather than code.
library;

import 'dart:async';

/// Which button was pressed. The account that comes back records it, because
/// "you already have an account, with Google" is the one useful thing to say
/// when somebody comes back through the other button.
enum SsoProviderId { google, apple }

extension SsoProviderLabel on SsoProviderId {
  String get label => switch (this) {
        SsoProviderId.google => 'Google',
        SsoProviderId.apple => 'Apple',
      };
}

/// Why a sign-in did not produce an account.
enum SsoFailure {
  /// The sheet was dismissed. Not an error: it gets no message, because the
  /// user knows what they just did and a banner would be a telling-off.
  cancelled,

  /// No network, or the provider is down.
  network,

  /// The provider answered and said no — a revoked token, a blocked account.
  rejected,
}

class SsoException implements Exception {
  const SsoException(this.failure);

  final SsoFailure failure;

  @override
  String toString() => 'SsoException($failure)';
}

/// What comes back from a successful sign-in.
///
/// [idToken] is the only field a backend will care about: it is what gets
/// verified server-side. The rest is for showing a name and a face before that
/// round trip returns.
class SsoAccount {
  const SsoAccount({
    required this.provider,
    required this.id,
    required this.email,
    required this.name,
    this.photoUrl,
    required this.idToken,
  });

  final SsoProviderId provider;

  /// Stable per provider, and the thing an account is keyed on. Apple's is not
  /// an email — it is a `user` string, and it is the only identifier you are
  /// guaranteed to get twice.
  final String id;

  /// **Apple can withhold this**, or hand over a private relay address, and it
  /// is only ever sent on the *first* authorisation. A build that treats email
  /// as the primary key loses the account on the second sign-in.
  final String email;
  final String name;
  final String? photoUrl;
  final String idToken;
}

abstract class SsoProvider {
  /// Opens the provider's sheet. Throws [SsoException] rather than returning
  /// null, so a caller cannot quietly treat a cancel as a success.
  Future<SsoAccount> signIn(SsoProviderId provider);

  /// Ends the provider-side session. Signing out of Aurelia does not have to
  /// sign you out of Google, and this is where that decision gets made.
  Future<void> signOut();
}

/// A provider that signs you in without leaving the app.
///
/// It is deliberately not instant: the real sheet takes a second or two, and a
/// button that resolves in the same frame hides every layout problem the
/// loading state has.
class DummySsoProvider implements SsoProvider {
  DummySsoProvider({
    this.delay = const Duration(milliseconds: 900),
    this.failWith,
  });

  final Duration delay;

  /// Set it and [signIn] throws — how the tests and `/__demo` reach cancel,
  /// network and rejected without unplugging anything.
  final SsoFailure? failWith;

  @override
  Future<SsoAccount> signIn(SsoProviderId provider) async {
    await Future<void>.delayed(delay);

    final failure = failWith;
    if (failure != null) throw SsoException(failure);

    // The signed-in user the rest of the mock catalogue already assumes. Using
    // anyone else here would make the profile, the sessions and the challenge
    // board disagree about who you are.
    return switch (provider) {
      SsoProviderId.google => const SsoAccount(
          provider: SsoProviderId.google,
          id: 'google-108452119',
          email: 'adam.nilson@gmail.com',
          name: 'Adam Nilson',
          idToken: 'dummy.google.id-token',
        ),
      // Apple's relay address is what you actually get when someone chooses
      // "Hide My Email", and it is worth having in the mock so nobody writes
      // code that assumes a real domain.
      SsoProviderId.apple => const SsoAccount(
          provider: SsoProviderId.apple,
          id: '001432.6f2c9a1b4e0d.1142',
          email: 'k7m2x9qp4t@privaterelay.appleid.com',
          name: 'Adam Nilson',
          idToken: 'dummy.apple.id-token',
        ),
    };
  }

  @override
  Future<void> signOut() async {}
}
