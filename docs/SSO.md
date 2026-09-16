# Single sign-on — what is built, and what it needs to become real

The Google and Apple buttons on the auth forms work end to end today against
`DummySsoProvider`. Nothing in this app talks to Google or Apple yet. This
document is the gap between those two sentences.

---

## What exists

`lib/core/auth/sso.dart` holds the whole seam:

| Piece | What it is |
| --- | --- |
| `SsoProviderId` | `google` \| `apple` — which button was pressed |
| `SsoAccount` | what comes back: provider, stable id, email, name, photo, id token |
| `SsoFailure` | `cancelled` \| `network` \| `rejected` |
| `SsoProvider` | `signIn(provider)` and `signOut()`, and nothing else |
| `DummySsoProvider` | returns a fixed account after ~900ms, or throws a chosen failure |

`SocialSignIn` (in `features/auth/auth_shell.dart`) drives it: the pressed
button spins, both go dead while either runs, and `AuthController.signInWith`
records the account so `auth.provider` can answer "which door did they come
through".

**The 900ms is deliberate.** A dummy that resolves in the same frame hides
every layout problem the loading state has, and the real sheet takes longer
than that.

### The three failures are three outcomes

- **cancelled** — no banner. The user dismissed the sheet themselves; telling
  them about it reads as a telling-off.
- **network** — "Could not reach Google. Check your connection and try again."
- **rejected** — "Google could not sign you in. Try email instead." The
  provider answered and said no: a revoked token, a blocked account.

Four widget tests cover these, including that a failure returns the buttons
rather than leaving them spinning.

---

## Swapping in the real thing

Write one class per provider against `SsoProvider`. No screen changes; pass it
to `AureliaApp(sso: ...)` and it reaches both auth forms through the router.

```dart
class GoogleSsoProvider implements SsoProvider { ... }
class AppleSsoProvider implements SsoProvider { ... }
```

### Packages

| Provider | Package | Note |
| --- | --- | --- |
| Google | `google_sign_in` | v7 changed the API to an `initialize()` + event-stream shape; v6 is the older `signIn()` future. Pin deliberately. |
| Apple | `sign_in_with_apple` | Needed on iOS **and** on Android/web, where it runs as a web flow against a Services ID. |

Both ship native code, like the three plugins already here. See the note in
`pubspec.yaml` about why that cost was taken.

### Google — what you need from outside the code

1. A Firebase or Google Cloud project, and an **OAuth client ID per platform**:
   - **Android** — needs the app's package name and the signing certificate's
     **SHA-1**. Debug and release are different certificates, so register both
     or sign-in works on your machine and fails in the store build.
   - **iOS** — a client ID, its reversed form added to `Info.plist` under
     `CFBundleURLTypes`, so the callback comes back to the app.
   - **Web** — a third client ID if the Flutter web build ever needs this.
2. `GoogleService-Info.plist` (iOS) and `google-services.json` (Android),
   dropped into the platform folders. Neither belongs in git.

### Apple — what you need from outside the code

1. An **Apple Developer Program** membership. There is no free path.
2. In the app's identifier: enable the **Sign In with Apple** capability, and
   add the same capability in Xcode so the entitlement ships.
3. For Android or web: a **Services ID**, a private key, and a **return URL**
   you host. Apple posts the result to that URL, so this one cannot be done
   entirely inside the app.
4. Apple requires that if you offer any third-party sign-in on iOS, you offer
   Sign In with Apple too. Both buttons are already here, which satisfies it.

### The two things that bite

**Apple sends the name and email exactly once.** On the first authorisation,
and never again — every later sign-in returns only the `user` id. Persist the
account on first sight or the second sign-in is a stranger. This is why
`SsoAccount.id` exists and why nothing keys off `email`.

**Apple's email may be a private relay.** `k7m2x9qp4t@privaterelay.appleid.com`
forwards, but it is not the user's address and it breaks if they disconnect the
app. The dummy provider returns a relay address on purpose, so nobody writes
code assuming a real domain.

---

## What is still missing after the SDKs are in

The id token is the point of all of this, and today nothing checks it.

- **A backend endpoint** that takes `SsoAccount.idToken`, verifies it against
  the provider's public keys, and issues Aurelia's own session. Until that
  exists, a signed-in state is a client-side claim — the same limitation
  `AuthController` already has.
- **Account linking.** Someone who signs up with Google then returns through
  Apple has two ids and one person behind them. `auth.provider` is recorded so
  the app can say "you already have an account, with Google" rather than
  silently making a second one — but the decision about what to do belongs in
  `docs/PRD.md`, not here.
- **Sign-out semantics.** `SsoProvider.signOut()` exists and the dummy does
  nothing. Signing out of Aurelia does not have to sign you out of Google, and
  which one you want is a product decision.
