import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aurelia_mobile/main.dart';

/// Pumps the app and settles. Network images resolve to the gradient floor in
/// tests (the test HTTP client returns 400), which is the same path a blocked
/// network takes on a device — so these tests also prove the fallback works.
Future<void> _boot(WidgetTester tester) async {
  // A tall phone-shaped surface: these screens are long scrolls, and the
  // default 800x600 test window leaves most of each one unbuilt.
  tester.view.physicalSize = const Size(420, 3200);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);

  // The test HTTP client answers every request with 400, so every cover photo
  // fails to load. That is deliberate — it puts the widgets on their gradient
  // fallback path, which is what a device with no network gets. The failure is
  // expected here, so it is filtered rather than failing the test; anything
  // else still surfaces.
  final reportError = FlutterError.onError;
  FlutterError.onError = (details) {
    if (details.exception is NetworkImageLoadException) return;
    reportError?.call(details);
  };
  addTearDown(() => FlutterError.onError = reportError);

  await tester.pumpWidget(const AureliaApp());
  await tester.pumpAndSettle();
}

void main() {
  group('Home', () {
    testWidgets('opens without an account and shows the whole pitch',
        (tester) async {
      await _boot(tester);

      expect(find.text('Create the space you imagine.'), findsOneWidget);
      expect(find.text('Ongoing Live Sessions'), findsOneWidget);
      expect(find.text('Quick Start'), findsOneWidget);
      expect(find.text('Recreate from Community'), findsOneWidget);
      // A visitor has no balance, so the header offers the account instead.
      expect(find.text('Sign in'), findsOneWidget);
    });

    testWidgets('tapping the prompt sends a visitor to sign in', (tester) async {
      await _boot(tester);

      await tester.tap(find.text('Ask Aurelia..'));
      await tester.pumpAndSettle();

      expect(find.text('Or continue using'), findsOneWidget);
    });
  });

  group('Sign in', () {
    testWidgets('continues to the screen the visitor was aiming at',
        (tester) async {
      await _boot(tester);

      // Deep-link into an account-only screen; the wall should catch it.
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));
      navigator.pushNamed('/sessions');
      await tester.pumpAndSettle();
      expect(find.text('Or continue using'), findsOneWidget);

      await tester.tap(find.widgetWithText(ElevatedButton, 'Sign In'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 600));
      await tester.pumpAndSettle();

      // Lands on Sessions, not Home.
      expect(find.text('Trusted Creators'), findsOneWidget);
      expect(find.text('Monthly Challenge!'), findsOneWidget);
    });

    testWidgets('reaches sign up and the password reset path', (tester) async {
      await _boot(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/signup');
      await tester.pumpAndSettle();
      expect(find.text('Full name'), findsOneWidget);
      // Consent gates the submit.
      final createButton = tester.widget<ElevatedButton>(
        find.widgetWithText(ElevatedButton, 'Create account'),
      );
      expect(createButton.onPressed, isNull);

      navigator.pushNamed('/forgot-password');
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextField).first, 'adam@aurelia.care');
      await tester.tap(find.widgetWithText(ElevatedButton, 'Send reset link'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 700));
      await tester.pumpAndSettle();

      // Same answer whether or not the address is registered.
      expect(find.textContaining('If an account exists for'), findsOneWidget);
    });
  });

  group('Sessions and detail', () {
    testWidgets('shelves render and a card opens its detail', (tester) async {
      await _boot(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/login');
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(ElevatedButton, 'Sign In'));
      await tester.pump(const Duration(milliseconds: 700));
      await tester.pumpAndSettle();

      navigator.pushNamed('/session', arguments: 'dolphins-frequency');
      await tester.pumpAndSettle();

      expect(find.text('Dolphins frequency'), findsWidgets);
      // Overview opens by default so the screen is not a wall of closed rows.
      expect(find.textContaining('A slow descent built around'), findsOneWidget);
      expect(find.text('SOUND LAYERS'), findsOneWidget);

      await tester.tap(find.text('SOUND LAYERS'));
      await tester.pumpAndSettle();
      expect(find.text('Cetacean song'), findsOneWidget);
    });
  });

  group('Recreate', () {
    testWidgets('lists only what differs from the original', (tester) async {
      await _boot(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/login');
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(ElevatedButton, 'Sign In'));
      await tester.pump(const Duration(milliseconds: 700));
      await tester.pumpAndSettle();

      navigator.pushNamed('/recreate', arguments: 'dolphins-frequency');
      await tester.pumpAndSettle();

      // Nothing changed yet.
      expect(find.textContaining('No changes yet'), findsOneWidget);

      await tester.tap(find.textContaining('Made it longer'));
      await tester.pumpAndSettle();

      expect(find.textContaining('No changes yet'), findsNothing);
      expect(find.textContaining('22 → 33 min'), findsOneWidget);
    });
  });

  group('Chat', () {
    testWidgets('voice produces a reviewable transcript, then a real message',
        (tester) async {
      await _boot(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/login');
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(ElevatedButton, 'Sign In'));
      await tester.pump(const Duration(milliseconds: 700));
      await tester.pumpAndSettle();

      navigator.pushNamed('/chat');
      await tester.pumpAndSettle();
      expect(find.text('Aurelia'), findsWidgets);

      await tester.tap(find.byTooltip('Voice input'));
      await tester.pump();
      expect(find.text('Listening..'), findsOneWidget);

      await tester.tap(find.text('Stop'));
      await tester.pump();
      expect(find.text('Transcribing…'), findsOneWidget);

      await tester.pump(const Duration(milliseconds: 1200));
      // Nothing has been sent yet — the transcript is a draft.
      expect(find.text('Record again'), findsOneWidget);

      await tester.tap(find.text('Send'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));

      expect(find.textContaining('keep the ocean sound'), findsOneWidget);
    });
  });

  group('Invite', () {
    testWidgets('shows the reward and the link', (tester) async {
      await _boot(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/login');
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(ElevatedButton, 'Sign In'));
      await tester.pump(const Duration(milliseconds: 700));
      await tester.pumpAndSettle();

      navigator.pushNamed('/invite');
      await tester.pumpAndSettle();

      expect(find.text('Invite Friends, Get Points!'), findsOneWidget);
      expect(find.text('+500'), findsOneWidget);
      expect(find.text('https://www.aurelia.ai/inviteafriend'), findsOneWidget);
    });
  });
}
