import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aurelia_mobile/core/data/sessions.dart' show Shelf;
import 'package:aurelia_mobile/core/widgets/section_header.dart';
import 'package:aurelia_mobile/core/widgets/session_grid_card.dart';
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

/// Signs in through the real form, so the tests exercise the same wall a user
/// meets rather than reaching past it.
Future<void> _signIn(WidgetTester tester) async {
  final navigator = tester.state<NavigatorState>(find.byType(Navigator));
  navigator.pushNamed('/login');
  await tester.pumpAndSettle();
  await tester.tap(find.widgetWithText(ElevatedButton, 'Sign In'));
  await tester.pump(const Duration(milliseconds: 700));
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
      await _signIn(tester);
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

  group('Drawer', () {
    testWidgets('drops Home and leads with the account', (tester) async {
      await _boot(tester);
      await tester.tap(find.byTooltip('Open menu').first);
      await tester.pumpAndSettle();

      expect(find.text('Home'), findsNothing);
      // Signed out, the first row is the way in.
      expect(find.text('Sign In'), findsWidgets);
      expect(find.text('Sessions'), findsWidgets);
      expect(find.text('Help'), findsOneWidget);
    });
  });

  group('New screens', () {
    testWidgets('See All renders a whole shelf as a grid', (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));
      navigator.pushNamed('/see-all', arguments: Shelf.picked);
      await tester.pumpAndSettle();

      expect(find.text('Picked for You'), findsOneWidget);
      // Eight sessions sit on that shelf.
      expect(find.byType(SessionGridCard), findsNWidgets(8));
    });

    testWidgets('Notifications group by age and the chips narrow them',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));
      navigator.pushNamed('/notifications');
      await tester.pumpAndSettle();

      expect(find.text('Today'), findsWidgets);
      expect(find.textContaining('Aria Moon', findRichText: true), findsOneWidget);

      await tester.tap(find.widgetWithText(PillChip, 'Yesterday'));
      await tester.pumpAndSettle();
      // Today's rows are gone once the filter narrows to yesterday.
      expect(find.textContaining('Aria Moon', findRichText: true), findsNothing);
      expect(find.textContaining('Jonas Webber', findRichText: true), findsOneWidget);
    });

    testWidgets('Challenge detail shows the podium and the ranked rows',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));
      navigator.pushNamed('/challenge', arguments: 'nervous-system-reset');
      await tester.pumpAndSettle();

      expect(find.text('30-Day Nervous System Reset'), findsOneWidget);
      expect(find.text('Aria Moon'), findsOneWidget);
      expect(find.text('Joined 2026.2.23'), findsOneWidget);
      expect(find.text('Join Challenge'), findsOneWidget);
    });

    testWidgets('Help opens without an account and expands an answer',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));
      navigator.pushNamed('/help');
      await tester.pumpAndSettle();

      expect(find.text('What is Aurelia AI?'), findsOneWidget);
      await tester.tap(find.text('How do I create a new session?'));
      await tester.pumpAndSettle();
      expect(find.textContaining('follow the prompts'), findsOneWidget);
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
