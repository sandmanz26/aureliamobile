import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aurelia_mobile/core/data/sessions.dart' show Shelf, sessionsOnShelf;
import 'package:aurelia_mobile/core/widgets/aurelia_logo.dart';
import 'package:aurelia_mobile/core/widgets/community_network.dart';
import 'package:aurelia_mobile/core/widgets/photo_circle.dart';
import 'package:aurelia_mobile/core/widgets/section_header.dart';
import 'package:aurelia_mobile/core/widgets/session_grid_card.dart';
import 'package:aurelia_mobile/core/audio/audio_engine.dart';
import 'package:aurelia_mobile/core/audio/voice_capture.dart';
import 'package:aurelia_mobile/core/auth/auth_scope.dart';
import 'package:aurelia_mobile/core/auth/sso.dart';
import 'package:aurelia_mobile/core/data/progress.dart' show ProgressTab;
import 'package:aurelia_mobile/core/data/replies.dart';
import 'package:aurelia_mobile/features/chat/chat_session_controller.dart' show ChatArgs;
import 'package:aurelia_mobile/features/chat/widgets/mini_player.dart';
import 'package:aurelia_mobile/features/chat/widgets/recommendation_deck.dart';
import 'package:aurelia_mobile/features/chat/widgets/recommendation_card.dart';
import 'package:aurelia_mobile/features/chat/widgets/attached_session.dart';
import 'package:aurelia_mobile/features/credits/credits_screen.dart';
import 'package:aurelia_mobile/features/chat/widgets/empty_thread.dart';
import 'package:aurelia_mobile/features/chat/widgets/free_limit_notice.dart';
import 'package:aurelia_mobile/features/upgrade/upgrade_screen.dart';
import 'package:aurelia_mobile/features/player/player_screen.dart';
import 'package:aurelia_mobile/features/recreate/recreate_screen.dart';
import 'package:aurelia_mobile/features/progress/progress_screen.dart';
import 'package:aurelia_mobile/main.dart';

/// Pumps the app and settles. Network images resolve to the gradient floor in
/// tests (the test HTTP client returns 400), which is the same path a blocked
/// network takes on a device — so these tests also prove the fallback works.
Future<void> _boot(WidgetTester tester,
    {VoiceCapture? voiceCapture, SsoProvider? sso, AudioEngine? audioEngine}) async {
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

  // A silent engine, not the real one: a test binding has no platform
  // channels, so constructing the just_audio player here would fail before the
  // first frame. It keeps a real clock, so everything these tests assert about
  // playback — the bar moving, pausing holding it, a new track resetting it —
  // is still the behaviour the screens depend on.
  await tester.pumpWidget(AureliaApp(
    audioEngine: audioEngine ?? SilentAudioEngine(),
    voiceCapture: voiceCapture ?? SilentVoiceCapture(),
    // No delay: the dummy's 900ms is there so a person sees the spinner, and
    // a test that waits it out is 900ms slower for nothing.
    sso: sso ?? DummySsoProvider(delay: Duration.zero),
  ));
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

    testWidgets('the closing CTA sits inside the community network',
        (tester) async {
      await _boot(tester);

      await tester.scrollUntilVisible(
        find.byKey(const ValueKey('home-cta')),
        600,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.pumpAndSettle();

      // The drawing is the argument the card then states in words, so it is
      // wider than the content column and the card overlaps its foot.
      final drawing = tester.getRect(find.byType(CommunityNetwork));
      final card = tester.getRect(find.byKey(const ValueKey('home-cta')));
      expect(drawing.left, 0);
      expect(drawing.width, 420);
      expect(card.left, 20);
      expect(drawing.bottom - card.top, closeTo(24, 0.5));
      expect(find.text('Get Started'), findsOneWidget);
    });

    testWidgets('a visitor types first, and the ask survives sign-in',
        (tester) async {
      await _boot(tester);

      // Typing must not bounce anyone to sign-in — that is the whole point.
      await tester.enterText(find.byType(TextField).first, 'help me sleep better');
      await tester.pumpAndSettle();
      expect(find.text('Or continue using'), findsNothing);

      // Sending is the commit, so that is where the account is asked for.
      await tester.testTextInput.receiveAction(TextInputAction.send);
      await tester.pumpAndSettle();
      expect(find.text('Or continue using'), findsOneWidget);

      // Sign in on the screen the gate put up — pushing a fresh /login would
      // throw away the destination it remembered.
      await tester.tap(find.widgetWithText(ElevatedButton, 'Sign In'));
      await tester.pump(const Duration(milliseconds: 700));
      await tester.pumpAndSettle();

      // What was typed is waiting in the thread on the other side of it.
      expect(find.text('help me sleep better'), findsOneWidget);
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
      expect(find.text('Sessions'), findsOneWidget);
      expect(find.text('Created by you'), findsOneWidget);
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
    testWidgets('opens the conversation with the fork attached', (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      // The route still resolves — the form is switched off, not removed —
      // and it lands in the cockpit rather than on a dead end.
      navigator.pushNamed('/recreate', arguments: 'dolphins-frequency');
      await tester.pumpAndSettle();
      expect(find.byType(RecreateScreen), findsNothing);

      // Nothing has been asked for yet, so the opening line states the fork
      // and stops: "Keep it as it is" belongs to someone who went through the
      // form and changed nothing.
      expect(find.text('Recreate “Dolphins frequency” by Adam Nilson.'),
          findsOneWidget);
      // Attached, not just named — you can see and hear what you are about to
      // change without leaving the thread.
      expect(find.byType(AttachedSession), findsOneWidget);
      expect(find.byTooltip('Play Dolphins frequency'), findsOneWidget);

      // And the question that screen used to ask in a heading is asked here.
      await tester.pump(const Duration(milliseconds: 1700));
      await tester.pumpAndSettle();
      expect(find.textContaining('Tell me what should be different'),
          findsOneWidget);
    });

    testWidgets('the form is still there, and lists only what differs',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      // Pushed directly rather than by route: `recreateFormEnabled` is off, so
      // /recreate forwards. The screen is kept — a slider is a better
      // instrument than a sentence for "how long" — so it stays tested.
      navigator.push(MaterialPageRoute<void>(
          builder: (_) => const RecreateScreen(slug: 'dolphins-frequency')));
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
    test('Aurelia answers what was said, not one sentence for everything', () {
      // The specific rules come before the general ones, and this is the case
      // that proves the order: "shorter" must not be caught by anything above
      // it, and "?" must not fall through to a fallback that answers a
      // question nobody asked.
      expect(replyTo('make it shorter').changes, isTrue);
      expect(replyTo('I can’t sleep').proposes, isTrue);
      expect(replyTo('a female voice please').text, contains('female voice'));
      expect(replyTo('how did I sleep?').text, contains('Six hours forty'));
      // The opener this app offers on an empty thread. Under the `morning`
      // rule it came back with a proposal for a wake-up session — an answer to
      // a question nobody asked, to a question the product had put in their
      // mouth.
      expect(replyTo('Good morning, how did I sleep?').text,
          contains('Six hours forty'));
      // Nothing matched is still an honest answer rather than a confident
      // non-answer.
      expect(replyTo('xyzzy'), same(kFallbackReply));

      // The shrug, three ways, and one near-miss that must not land here.
      for (final said in ['idk', "I don't know.", '?', 'idk what to change']) {
        expect(replyTo(said).prompts, hasLength(5), reason: said);
      }
      expect(replyTo('make it shorter?').prompts, isNull);
    });

    testWidgets('"I don’t know" gets questions back, and they are tappable',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/chat');
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).last, 'idk');
      await tester.testTextInput.receiveAction(TextInputAction.send);
      await tester.pump(const Duration(milliseconds: 2500));
      await tester.pumpAndSettle();

      expect(find.textContaining('Here are few suggestions'), findsOneWidget);
      expect(find.text('What did you like most about the meditation?'),
          findsOneWidget);

      // Tapping one sends it, which is the point: being stuck costs a tap
      // rather than a sentence.
      await tester.tap(find.text('What kind of sounds help you relax before bed?'));
      await tester.pump(const Duration(milliseconds: 2500));
      await tester.pumpAndSettle();
      expect(find.text('What kind of sounds help you relax before bed?'),
          findsWidgets);
    });

    testWidgets('a new session opens empty, and the openers start it',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/chat', arguments: const ChatArgs(fresh: true));
      await tester.pumpAndSettle();

      // Nothing above the composer. It used to open on the demo conversation,
      // which was about a session the user had not made — so "New session"
      // opened on somebody else's.
      expect(find.byType(EmptyThread), findsOneWidget);
      expect(find.text('Hello Adam, What are you creating today?'),
          findsOneWidget);
      expect(find.text('Today'), findsNothing);

      // The openers are there because the hardest part of a blank chat is the
      // first sentence.
      await tester.tap(find.text('Good morning, how did I sleep?'));
      await tester.pump(const Duration(milliseconds: 2500));
      await tester.pumpAndSettle();
      expect(find.byType(EmptyThread), findsNothing);
      expect(find.text('Good morning, how did I sleep?'), findsOneWidget);
      // And Aurelia answers that, rather than filing a note about it.
      expect(find.textContaining('Six hours forty'), findsOneWidget);
    });

    testWidgets('the free limit trips after three sends', (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/chat', arguments: const ChatArgs(fresh: true));
      await tester.pumpAndSettle();

      for (final said in ['one', 'two', 'three']) {
        await tester.enterText(find.byType(TextField).last, said);
        await tester.testTextInput.receiveAction(TextInputAction.send);
        await tester.pump(const Duration(milliseconds: 2500));
        await tester.pumpAndSettle();
      }

      // Above the composer, not in the thread: it is the product speaking
      // about itself, and in the transcript it would scroll away.
      expect(find.byType(FreeLimitNotice), findsOneWidget);
      expect(find.textContaining('Session paused until'), findsOneWidget);

      // Upgrade is the second way out, and it is a screen rather than a sheet.
      await tester.tap(find.text('Upgrade'));
      await tester.pumpAndSettle();
      expect(find.byType(UpgradeScreen), findsOneWidget);
      expect(find.text('\$10'), findsOneWidget);
      await tester.tap(find.text('Annual'));
      await tester.pumpAndSettle();
      expect(find.text('\$100'), findsOneWidget);
      await tester.tap(find.byTooltip('Close'));
      await tester.pumpAndSettle();

      // The first one costs nothing, and it clears the limit.
      await tester.tap(find.text('New Session'));
      await tester.pumpAndSettle();
      expect(find.byType(FreeLimitNotice), findsNothing);
      expect(find.byType(EmptyThread), findsOneWidget);
    });

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

    testWidgets('the recommendations can be dropped, then applied',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/chat');
      await tester.pumpAndSettle();

      // All three arrive applied — Aurelia proposed them, so the user's job
      // is to take away what they do not want. They arrive folded into a deck,
      // which carries the count.
      expect(find.text('Apply new changes (3)'), findsOneWidget);
      expect(find.byType(RecommendationDeck), findsOneWidget);

      // Opening the deck lays the three cards out with their controls.
      await tester.tap(find.byType(RecommendationDeck));
      await tester.pumpAndSettle();
      expect(find.text('Increase yellow'), findsOneWidget);

      // Tapped by its label: OutlinedButton.icon builds a private subclass,
      // so widgetWithText(OutlinedButton, ...) matches nothing.
      await tester.tap(find.text('Remove').first);
      await tester.pumpAndSettle();
      expect(find.text('Apply new changes (2)'), findsOneWidget);
      // The card stays, offering the change back.
      expect(find.text('Add'), findsOneWidget);

      await tester.tap(find.text('Apply new changes (2)'));
      await tester.pump();
      expect(find.text('Updating..'), findsOneWidget);

      await tester.pump(const Duration(milliseconds: 1500));
      // The cards give way to the session being rebuilt.
      expect(find.text('Increase yellow'), findsNothing);
      expect(find.text('Creating your new session..'), findsOneWidget);

      // The percentage climbs on its own, and finishes.
      await tester.pump(const Duration(seconds: 6));
      expect(find.text('Ready to play'), findsOneWidget);
    });

    testWidgets('publishing runs from the header menu through to a tick',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/chat');
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('More options'));
      await tester.pumpAndSettle();
      // Insights and Settings are in the menu but inert until those ship.
      expect(find.text('Insights'), findsOneWidget);
      expect(find.text('Settings'), findsOneWidget);

      // Pumped frame by frame, not settled: the spinner never stops, so
      // pumpAndSettle would run the fake clock straight past the 2.2s wait.
      await tester.tap(find.text('Publish'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 400));
      expect(find.text('Publishing your Session…'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);

      // The sheet swaps its spinner for the tick in place, rather than
      // replacing itself with a second sheet.
      await tester.pump(const Duration(milliseconds: 2400));
      expect(find.text('Session Published!'), findsOneWidget);
      expect(find.text('View Session'), findsOneWidget);

      await tester.tap(find.text('View Session'));
      await tester.pumpAndSettle();
      expect(find.text('Create the space you imagine.'), findsOneWidget);
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
      // Counted from the catalogue, not typed in — adding a session to the
      // shelf should not break a test about the grid.
      expect(find.byType(SessionGridCard),
          findsNWidgets(sessionsOnShelf(Shelf.picked).length));
    });

    testWidgets('Drawer items share one left column', (tester) async {
      await _boot(tester);
      await _signIn(tester);
      await tester.tap(find.byTooltip('Open menu').first);
      await tester.pumpAndSettle();

      // The mark, every nav icon, the Latest label and the two links below the
      // rule all sit on the same left edge — the thing the design aligns on.
      // Scoped to the Drawer: the screen behind it has a mark of its own.
      Finder inDrawer(Finder f) =>
          find.descendant(of: find.byType(Drawer), matching: f);
      double leftOf(Finder f) => tester.getTopLeft(f.first).dx;
      final markLeft = leftOf(inDrawer(find.byType(AureliaLogo)));
      for (final label in ['Profile', 'Explore', 'Sessions', 'Latest', 'Invite a Friend', 'Help']) {
        final text = inDrawer(find.text(label));
        final row = find.ancestor(of: text, matching: find.byType(Row));
        final left = leftOf(row.evaluate().isEmpty ? text : row);
        expect(left, closeTo(markLeft, 1),
            reason: '"$label" should start on the drawer\'s left column');
      }
      // Sign out left the drawer with the design; nothing below the rule but these two.
      expect(find.text('Sign out'), findsNothing);
    });

    testWidgets('My Wellness derives its summary from the switches',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));
      navigator.pushNamed('/wellness');
      await tester.pumpAndSettle();

      expect(find.text('Active Signals'), findsOneWidget);
      expect(find.text('Apple Watch'), findsOneWidget);
      // Four of six connected out of the box.
      expect(find.text('4'), findsOneWidget);
      expect(find.text('/ 6 Sources'), findsOneWidget);

      // Turning one on moves the count — the summary is computed, not written.
      await tester.tap(find.byKey(const ValueKey('switch-oura-ring')));
      await tester.pumpAndSettle();
      expect(find.text('5'), findsOneWidget);

      // The request sheet confirms rather than closing on a dead submit.
      await tester.tap(find.text('Don’t see your favorite device or app?'));
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextField).last, 'Garmin');
      await tester.pumpAndSettle();
      await tester.tap(find.text('Send'));
      await tester.pumpAndSettle();
      expect(find.text('Thanks — that’s logged.'), findsOneWidget);
    });

    testWidgets('Profile shows what this account published', (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/profile');
      await tester.pumpAndSettle();

      expect(find.text('Adam Nilson'), findsOneWidget);
      expect(find.text('Dubai, UAE'), findsOneWidget);
      // The counts are this profile's, not the shelf's.
      expect(find.text('18,513'), findsOneWidget);
      expect(find.text('Dolphins frequency'), findsOneWidget);
      // Four cards, and all four are sessions now — the shelf used to be a
      // hardcoded list of titles the catalogue did not have, which is why
      // neither control on a card could go anywhere.
      expect(find.text('Soft Reset'), findsOneWidget);
      expect(find.text('Deep Space'), findsOneWidget);
      expect(find.text('Clear Skies'), findsOneWidget);
      expect(find.text('Recreate'), findsNWidgets(4));

      // And both of them do something.
      await tester.tap(find.byTooltip('Play Soft Reset'));
      await tester.pumpAndSettle();
      expect(find.byType(PlayerScreen), findsOneWidget);
      navigator.pop();
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('Recreate Clear Skies'));
      await tester.pumpAndSettle();
      expect(find.text('Recreate “Clear Skies” by Adam Nilson.'), findsOneWidget);
    });

    testWidgets('the coin opens the ledger, from anywhere it is drawn',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/explore');
      await tester.pumpAndSettle();

      // A balance is the most obviously tappable thing in a header — it is a
      // number about *you*. It was drawn in ten places and did nothing in all
      // of them.
      await tester.tap(find.byTooltip('1,323 credits').first);
      await tester.pumpAndSettle();

      expect(find.byType(CreditsScreen), findsOneWidget);
      expect(find.text('Total Credits'), findsOneWidget);
      expect(find.text('Invite Friends, Get Credits!'), findsOneWidget);
      expect(find.textContaining('Aria Moon'), findsOneWidget);
      expect(find.text('+500'), findsNWidgets(5));
      // The frame hides its own Trailing: the balance is the subject of the
      // screen, so repeating it in the chrome would state it twice.
      expect(find.byType(CoinPill), findsNothing);
    });

    testWidgets('Explore carries two challenges, and the second is empty',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/explore');
      await tester.pumpAndSettle();

      expect(find.text('Monthly Challenges!'), findsOneWidget);
      expect(find.text('30-Day Nervous System Reset'), findsOneWidget);
      expect(find.text('250 pts'), findsOneWidget);

      // The second one is the state a real challenge spends its first hours
      // in: nobody has joined, and the points figure is its own rather than
      // the hard-coded 250 every card used to show.
      final shelf = find.byType(ListView).at(0);
      await tester.drag(shelf, const Offset(-400, 0));
      await tester.pumpAndSettle();
      expect(find.text('14-Day Morning Light'), findsOneWidget);
      expect(find.text('150 pts'), findsOneWidget);
      expect(find.text('Be the first'), findsOneWidget);
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
      // The board ranks sessions, each credited to whoever made that version.
      expect(find.text('Dolphins frequency'), findsWidgets);
      expect(find.text('Aria Moon'), findsOneWidget);
      expect(find.text('12,687'), findsOneWidget);
      expect(find.text('by Amara Osei'), findsOneWidget);
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

  group('Player', () {
    testWidgets('plays a session, and keeps playing when you go back',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/chat');
      await tester.pumpAndSettle();
      // Nothing is on the deck yet, so the cockpit has no mini player.
      expect(find.byType(MiniPlayer), findsNothing);

      await tester.tap(find.byTooltip('Play session'));
      await tester.pumpAndSettle();
      expect(find.byType(PlayerScreen), findsOneWidget);
      expect(find.text('Dolphins frequency'), findsWidgets);

      // The clock is stopped until the transport is pressed.
      expect(find.text('0:00'), findsOneWidget);
      await tester.tap(find.byTooltip('Play'));
      await tester.pump(const Duration(milliseconds: 1200));
      expect(find.text('0:01'), findsOneWidget);

      // Walking back leaves the session running, and the cockpit picks it up:
      // this is the whole reason playback lives above the navigator.
      navigator.pop();
      await tester.pumpAndSettle();
      expect(find.byType(MiniPlayer), findsOneWidget);
      expect(find.byTooltip('Pause Dolphins frequency'), findsOneWidget);
      // And the header's own play glyph steps aside rather than offering a
      // second control for the same thing.
      expect(find.byTooltip('Play session'), findsNothing);
    });

    testWidgets('the sheet carries the credit, the mix and a way to fork it',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/play',
          arguments: const PlayRequest(slug: 'dolphins-frequency'));
      await tester.pumpAndSettle();

      expect(find.text('Adam Nilson'), findsOneWidget);
      expect(find.text('Details'), findsOneWidget);
      expect(find.text('Cetacean song'), findsOneWidget);
      expect(find.text('Recreate your own version'), findsOneWidget);
      // The cards here fork a session rather than adding to a set, so they
      // carry Recreate and not Add.
      expect(find.text('Recreate'), findsWidgets);
      expect(find.text('Add'), findsNothing);
    });

    testWidgets('the bar can be dragged, and it moves the sound with it',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/play',
          arguments: const PlayRequest(slug: 'dolphins-frequency'));
      await tester.pumpAndSettle();

      final slider = find.byType(Slider);
      expect(slider, findsOneWidget);
      expect(find.text('0:00'), findsOneWidget);

      // Dragged to about three quarters. The bar used to be three painted
      // boxes reading a clock — there was nothing here to drag at all.
      final box = tester.getRect(slider);
      await tester.tapAt(Offset(box.left + box.width * 0.75, box.center.dy));
      await tester.pumpAndSettle();
      expect(find.text('0:07'), findsOneWidget);

      // And a drag carries it, which is the thing that was missing: the bar
      // used to be three painted boxes reading a clock.
      await tester.drag(slider, Offset(-box.width * 0.25, 0));
      await tester.pumpAndSettle();
      expect(find.text('0:02'), findsOneWidget);

      // Forward 15 on a ten-second bed clamps rather than running off the end.
      await tester.tap(find.byTooltip('Forward 15 seconds'));
      await tester.pumpAndSettle();
      expect(find.text('0:10'), findsWidgets);

      await tester.tap(find.byTooltip('Back 15 seconds'));
      await tester.pumpAndSettle();
      expect(find.text('0:00'), findsOneWidget);
    });

    testWidgets('sound can be turned off without stopping the session',
        (tester) async {
      final engine = SilentAudioEngine();
      await _boot(tester, audioEngine: engine);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      // Into the player from the cockpit, because popping has to land back on
      // the card that carries the other half of this switch.
      navigator.pushNamed('/chat');
      await tester.pumpAndSettle();
      await tester.tap(find.byTooltip('Play session'));
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('Play'));
      await tester.pump(const Duration(milliseconds: 600));

      await tester.tap(find.byTooltip('Turn sound off'));
      await tester.pumpAndSettle();
      // Muting is not pausing: the switch reaches the engine and the session
      // goes on running.
      expect(engine.muted, isTrue);
      expect(find.byTooltip('Pause'), findsOneWidget);
      await tester.pump(const Duration(milliseconds: 600));
      expect(find.text('0:00'), findsNothing);

      // The same switch, not a second one: the cockpit's card shows it off.
      navigator.pop();
      await tester.pumpAndSettle();
      expect(find.byTooltip('Turn sound on'), findsOneWidget);
      await tester.tap(find.byTooltip('Turn sound on'));
      await tester.pumpAndSettle();
      expect(engine.muted, isFalse);
    });
  });

  group('Sessions and Explore are two screens', () {
    testWidgets('a session row carries its markers and two tap targets',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/sessions');
      await tester.pumpAndSettle();

      // The frame's duration format, m:ss rather than "22 min".
      expect(find.text('22:22'), findsOneWidget);
      // Published is stated; a draft would say nothing at all.
      expect(find.text('Published'), findsWidgets);
      // Dolphins frequency passed through Marcus Lee before Adam, which is
      // what recreated means — the other rows came straight off a template.
      expect(find.byTooltip('Recreated from Marcus Lee'), findsOneWidget);

      // The disc sits exactly on its artwork. It is asserted rather than
      // eyeballed because it silently did not: the row's Stack sized itself to
      // the 35px Row inside it, so the Positioned disc landed 16.5px low.
      expect(tester.getRect(find.byTooltip('Play Dolphins frequency')),
          tester.getRect(find.byType(PhotoCircle).first));

      // The play disc opens the player...
      await tester.tap(find.byTooltip('Play Dolphins frequency'));
      await tester.pumpAndSettle();
      expect(find.byType(PlayerScreen), findsOneWidget);
      navigator.pop();
      await tester.pumpAndSettle();

      // ...and the rest of the row opens that session's conversation, which is
      // where the frame's own prototype goes. Not a blank cockpit: the thread
      // opens already about this session, and its deck is laid open rather
      // than folded, because the changes are what you came to look at.
      await tester.tap(find.text('Dolphins frequency'));
      await tester.pumpAndSettle();
      expect(find.byType(RecommendationDeck), findsNothing);
      expect(find.byType(RecommendationCard), findsWidgets);
      expect(
          find.textContaining('“Dolphins frequency” is built and running'),
          findsOneWidget);
    });

    testWidgets('a draft opens on the cockpit state a draft is in',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      // Drafts live only under "Created by you" — that is the whole reason the
      // filter is worth a tap.
      navigator.pushNamed('/sessions');
      await tester.pumpAndSettle();
      expect(find.text('Evening Unwind v3'), findsNothing);
      await tester.tap(find.text('Created by you'));
      await tester.pumpAndSettle();
      expect(find.text('Evening Unwind v3'), findsOneWidget);

      await tester.tap(find.text('Evening Unwind v3'));
      await tester.pumpAndSettle();
      // Nobody has played it, so Aurelia has nothing to report back — which is
      // the difference between a draft and a session that is out.
      expect(find.textContaining('still yours only'), findsOneWidget);
      expect(find.textContaining('Anything you want to change before it goes out?'),
          findsOneWidget);
    });

    testWidgets('Sessions lists what is published and narrows to your own',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/sessions');
      await tester.pumpAndSettle();
      expect(find.text('Sessions'), findsOneWidget);
      // Explore's shelves are not here — that was the bug this split fixed.
      expect(find.text('Trusted Creators'), findsNothing);

      final all = find.text('Dolphins frequency');
      expect(all, findsOneWidget);

      await tester.tap(find.text('Created by you'));
      await tester.pumpAndSettle();
      // Adam's own work stays; a session by anyone else goes.
      expect(find.text('Dolphins frequency'), findsOneWidget);
      expect(find.text('Trusted Creators'), findsNothing);
    });

    testWidgets('Explore is still the browse surface', (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/explore');
      await tester.pumpAndSettle();
      expect(find.text('Explore'), findsWidgets);
      expect(find.text('Trusted Creators'), findsOneWidget);
    });

    testWidgets('All Categories opens the whole list and filters the shelf',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/explore');
      await tester.pumpAndSettle();

      await tester.tap(find.text('All Categories'));
      await tester.pumpAndSettle();
      // The sheet lists bare names; the chips carry the library count.
      expect(find.text('Meditations'), findsOneWidget);
      expect(find.text('Meditations (12.5k)'), findsWidgets);

      await tester.tap(find.text('Meditations').last);
      await tester.pumpAndSettle();
      expect(find.text('All Categories'), findsOneWidget);
    });
  });

  group('Settings', () {
    testWidgets('is reached by the gear on your own profile, and signs you out',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/profile');
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('Settings'));
      await tester.pumpAndSettle();
      expect(find.text('Connected Accounts'), findsOneWidget);
      expect(find.text('Log Out'), findsOneWidget);

      await tester.tap(find.text('Log Out'));
      await tester.pumpAndSettle();

      // Back on Home, and the wall is up again — which is the only proof that
      // signing out did anything.
      navigator.pushNamed('/profile');
      await tester.pumpAndSettle();
      expect(find.text('Or continue using'), findsOneWidget);
    });

    testWidgets('a stranger gets no gear, and their own published work',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/profile', arguments: 'maya-chen');
      await tester.pumpAndSettle();

      expect(find.text('Maya Chen'), findsWidgets);
      expect(find.text('Follow'), findsOneWidget);
      // There is nothing of a stranger's to configure, and no coin balance of
      // theirs to show.
      expect(find.byTooltip('Settings'), findsNothing);
    });
  });

  group('The cockpit survives leaving it', () {
    testWidgets('an applied set is still there when you come back',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/chat');
      await tester.pumpAndSettle();

      await tester.tap(find.byType(RecommendationDeck));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Remove').first);
      await tester.pumpAndSettle();
      expect(find.text('Apply new changes (2)'), findsOneWidget);

      await tester.tap(find.text('Apply new changes (2)'));
      await tester.pump(const Duration(milliseconds: 1500));
      await tester.pump(const Duration(seconds: 6));
      expect(find.text('Ready to play'), findsOneWidget);
      // A change makes a new cut, and the card says which one it is holding:
      // v1.2 with white noise added is not v1.2.
      expect(find.text('Sleep meditation v1.3'), findsOneWidget);

      // Off to play it, then back. Before the thread moved above the
      // navigator this returned a fresh conversation with nothing to publish.
      await tester.tap(find.byTooltip('Play Sleep meditation v1.3'));
      await tester.pumpAndSettle();
      expect(find.byType(PlayerScreen), findsOneWidget);

      navigator.pop();
      await tester.pumpAndSettle();
      expect(find.text('Ready to play'), findsOneWidget);
      expect(find.text('Apply new changes (2)'), findsNothing);
    });
  });

  group('Publishing', () {
    testWidgets('a draft offers Publish, and publishing takes', (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      // A draft: nothing is live, so the only thing the menu offers is
      // Publish. There is nothing to take down.
      navigator.pushNamed('/chat',
          arguments: const ChatArgs(slug: 'evening-unwind-v3'));
      await tester.pumpAndSettle();
      await tester.tap(find.byTooltip('More options'));
      await tester.pumpAndSettle();
      expect(find.text('Publish'), findsOneWidget);
      expect(find.text('Republish'), findsNothing);
      expect(find.text('Unpublish'), findsNothing);

      await tester.tap(find.text('Publish'));
      // Pumped rather than settled: the sheet's spinner never stops, so
      // pumpAndSettle has nothing to settle to.
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 600));
      expect(find.text('Publishing your Session…'), findsOneWidget);
      await tester.pump(const Duration(milliseconds: 2400));
      expect(find.text('Session Published!'), findsOneWidget);
      await tester.tap(find.text('View Session'));
      await tester.pumpAndSettle();

      // And it took: the session is out in the world now, which the Sessions
      // list reads off the same record. Pressing Publish used to move a sheet
      // and nothing else.
      navigator.pushNamed('/chat',
          arguments: const ChatArgs(slug: 'evening-unwind-v3'));
      await tester.pumpAndSettle();
      await tester.tap(find.byTooltip('More options'));
      await tester.pumpAndSettle();
      // Published and unchanged since — so there is nothing to offer. A button
      // that would do nothing is worse than no button.
      expect(find.text('Publish'), findsNothing);
      expect(find.text('Republish'), findsNothing);
      expect(find.text('Unpublish'), findsOneWidget);

      await tester.tap(find.text('Unpublish'));
      await tester.pumpAndSettle();
      expect(find.text('Session Unpublished'), findsOneWidget);
      await tester.tap(find.text('Done'));
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('More options'));
      await tester.pumpAndSettle();
      expect(find.text('Publish'), findsOneWidget);
      expect(find.text('Unpublish'), findsNothing);
    });

    testWidgets('a change to a published session offers Republish',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/chat',
          arguments: const ChatArgs(slug: 'dolphins-frequency'));
      await tester.pumpAndSettle();

      // Out in the world and unchanged: nothing to offer.
      await tester.tap(find.byTooltip('More options'));
      await tester.pumpAndSettle();
      expect(find.text('Republish'), findsNothing);
      await tester.tapAt(const Offset(10, 10));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Apply new changes (3)'));
      await tester.pump(const Duration(milliseconds: 1500));
      await tester.pump(const Duration(seconds: 6));

      // Moved on since it was published, so now there is.
      await tester.tap(find.byTooltip('More options'));
      await tester.pumpAndSettle();
      expect(find.text('Republish'), findsOneWidget);
      expect(find.text('Publish'), findsNothing);
    });

    testWidgets('Chapters reverts, and the thread says so', (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/chat',
          arguments: const ChatArgs(slug: 'dolphins-frequency'));
      await tester.pumpAndSettle();
      await tester.tap(find.byTooltip('More options'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Insights'));
      await tester.pumpAndSettle();

      final revert = find.byTooltip(RegExp('^Revert to '));
      expect(revert, findsWidgets);
      final label = (tester.widget<Tooltip>(revert.first).message ?? '')
          .replaceFirst('Revert to ', '');
      await tester.tap(revert.first);
      await tester.pumpAndSettle();

      // Back in the cockpit, and the revert is in the conversation rather than
      // a card quietly renaming itself.
      expect(find.text('Go back to $label.'), findsOneWidget);
      expect(find.textContaining('The later cuts are still in the history'),
          findsOneWidget);
      expect(find.text(label), findsWidgets);
    });
  });

  group('SSO', () {
    testWidgets('the two buttons are two providers, not one handler',
        (tester) async {
      await _boot(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));
      navigator.pushNamed('/login');
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('Continue with Apple'));
      await tester.pumpAndSettle();

      // Signed in, and the app knows which door you came through — Apple's
      // relay address, not a real one, because that is what Apple hands over
      // when someone chooses "Hide My Email".
      final auth = AuthScope.of(tester.element(find.byType(Navigator)));
      expect(auth.signedIn, isTrue);
      expect(auth.provider, SsoProviderId.apple);
      expect(auth.account?.email, contains('privaterelay.appleid.com'));
    });

    testWidgets('Google is its own path', (tester) async {
      await _boot(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));
      navigator.pushNamed('/login');
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('Continue with Google'));
      await tester.pumpAndSettle();

      final auth = AuthScope.of(tester.element(find.byType(Navigator)));
      expect(auth.provider, SsoProviderId.google);
      expect(auth.account?.email, 'adam.nilson@gmail.com');
    });

    testWidgets('a cancelled sheet leaves you where you were, quietly',
        (tester) async {
      await _boot(tester,
          sso: DummySsoProvider(
              delay: Duration.zero, failWith: SsoFailure.cancelled));
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));
      navigator.pushNamed('/login');
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('Continue with Google'));
      await tester.pumpAndSettle();

      // Still on the form, still signed out, and no banner: the user dismissed
      // the sheet themselves and being told about it reads as a telling-off.
      expect(AuthScope.of(tester.element(find.byType(Navigator))).signedIn, isFalse);
      expect(find.byType(SnackBar), findsNothing);
      expect(find.byTooltip('Continue with Google'), findsOneWidget);
    });

    testWidgets('a failure says which provider and what to do', (tester) async {
      await _boot(tester,
          sso: DummySsoProvider(
              delay: Duration.zero, failWith: SsoFailure.network));
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));
      navigator.pushNamed('/login');
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('Continue with Apple'));
      await tester.pumpAndSettle();

      expect(AuthScope.of(tester.element(find.byType(Navigator))).signedIn, isFalse);
      expect(find.textContaining('Could not reach Apple'), findsOneWidget);
      // And the buttons come back, rather than staying spinning on a failure.
      expect(find.byType(CircularProgressIndicator), findsNothing);
    });
  });

  group('Voice', () {
    testWidgets('a refused microphone is a state, not a dead sheet',
        (tester) async {
      // The real device throws this when the person says no; the silent
      // capture is how the test reaches that branch without one.
      await _boot(tester,
          voiceCapture:
              SilentVoiceCapture(failWith: VoiceCaptureError.permissionDenied));
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/chat');
      await tester.pumpAndSettle();
      await tester.tap(find.byTooltip('Voice input'));
      await tester.pumpAndSettle();

      // Not "Listening.." over a mic that is shut: it says what is wrong and
      // offers both remedies.
      expect(find.text('Listening..'), findsNothing);
      expect(find.text('Aurelia cannot hear you'), findsOneWidget);
      expect(find.text('Try again'), findsOneWidget);

      // Typing instead closes the recorder and leaves the composer.
      await tester.tap(find.text('Type instead'));
      await tester.pumpAndSettle();
      expect(find.text('Aurelia cannot hear you'), findsNothing);
      expect(find.text('Type here'), findsOneWidget);
    });

    testWidgets('a busy microphone says something different', (tester) async {
      await _boot(tester,
          voiceCapture:
              SilentVoiceCapture(failWith: VoiceCaptureError.unavailable));
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/chat');
      await tester.pumpAndSettle();
      await tester.tap(find.byTooltip('Voice input'));
      await tester.pumpAndSettle();

      // Two failures, two remedies — "something went wrong" would leave the
      // user with nothing to do.
      expect(find.text('The microphone is busy'), findsOneWidget);
    });
  });

  group('Progress', () {
    testWidgets('Insights in the cockpit opens the session it is about',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      // From a session's own thread, not a blank cockpit: Progress is about
      // one session, so a thread with nothing behind it has nothing to show.
      navigator.pushNamed('/chat',
          arguments: const ChatArgs(slug: 'dolphins-frequency'));
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('More options'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Insights').last);
      await tester.pumpAndSettle();

      expect(find.byType(ProgressScreen), findsOneWidget);
      // Chapters is the tab it opens on: the objective, then the cuts.
      expect(find.text('Objective'), findsOneWidget);
      expect(find.text('Lower my stress'), findsOneWidget);
      expect(find.text('Version History'), findsOneWidget);
      expect(find.text('Dolphins frequency v1.3'), findsOneWidget);
    });

    testWidgets('the three tabs are three bodies over one shell',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/progress',
          arguments: const ProgressRequest(slug: 'dolphins-frequency'));
      await tester.pumpAndSettle();

      // The header and the chip row do not change with the tab; only the body
      // does, which is how the three frames are drawn.
      await tester.tap(find.text('Social Impact'));
      await tester.pumpAndSettle();
      expect(find.text('Sessions'), findsOneWidget);
      expect(find.text('Earnings'), findsOneWidget);
      // The figures agree with the row that opened it.
      expect(find.text('124k'), findsOneWidget);
      expect(find.text('Lineage Tree'), findsOneWidget);

      // The chip row scrolls, and has to: the test font is square-per-em, so
      // every label here is far wider than Mulish sets it and the third chip
      // lands off a 420-wide surface. On a device the three fit the frame's
      // 362 with room to spare.
      await tester.ensureVisible(find.text('Insights'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Insights'));
      await tester.pumpAndSettle();
      expect(find.text('Less coffee, better sleep'), findsOneWidget);
      expect(find.text('Earnings'), findsNothing);
    });

    testWidgets('a draft has nothing to show on Social Impact', (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/progress',
          arguments: const ProgressRequest(
              slug: 'evening-unwind-v3', tab: ProgressTab.social));
      await tester.pumpAndSettle();

      // Zeroes rather than borrowed figures, and it says why rather than
      // printing an empty list: nobody can play a session that is not out.
      expect(find.text('0'), findsNWidgets(3));
      expect(find.textContaining('this one is not published'), findsOneWidget);
      expect(find.textContaining('See All'), findsOneWidget);
    });

    testWidgets('a version card plays that cut, not the session',
        (tester) async {
      await _boot(tester);
      await _signIn(tester);
      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      navigator.pushNamed('/progress',
          arguments: const ProgressRequest(slug: 'dolphins-frequency'));
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('Play Dolphins frequency v1.2'));
      await tester.pumpAndSettle();

      // The player shows the cut, not the session it is a cut of.
      expect(find.byType(PlayerScreen), findsOneWidget);
      expect(find.text('Dolphins frequency v1.2'), findsOneWidget);
    });
  });
}
