// Unit tests for the analytics seam itself — the controllers, not the
// screens. Each one is a `ChangeNotifier` with no widget dependency, so
// asserting "this action logs that event" belongs at this level rather than
// driving a whole screen to reach one line of business logic.
//
// Screen-view tracking is the one part this file cannot reach — it needs a
// real Navigator, so it is covered in `widget_test.dart` instead, alongside
// everything else that needs the full app tree.
import 'package:flutter_test/flutter_test.dart';

import 'package:aurelia_mobile/core/analytics/analytics_service.dart';
import 'package:aurelia_mobile/core/audio/audio_engine.dart';
import 'package:aurelia_mobile/core/audio/playback_controller.dart';
import 'package:aurelia_mobile/core/auth/auth_scope.dart';
import 'package:aurelia_mobile/core/auth/sso.dart';
import 'package:aurelia_mobile/core/data/sessions.dart' show findSession;
import 'package:aurelia_mobile/features/chat/chat_session_controller.dart';

void main() {
  group('AuthController', () {
    test('signing in logs login with the email method', () {
      final analytics = RecordingAnalytics();
      final auth = AuthController(analytics: analytics);

      auth.signIn();

      expect(analytics.has('login'), isTrue);
      expect(analytics.events.single.parameters['method'], 'email');
      expect(analytics.has('sign_up'), isFalse);
    });

    test('signing up logs sign_up, not login', () {
      final analytics = RecordingAnalytics();
      final auth = AuthController(analytics: analytics);

      auth.signIn(isSignUp: true);

      expect(analytics.has('sign_up'), isTrue);
      expect(analytics.has('login'), isFalse);
    });

    test('an SSO account logs login tagged with its provider', () {
      final analytics = RecordingAnalytics();
      final auth = AuthController(analytics: analytics);

      auth.signInWith(const SsoAccount(
        provider: SsoProviderId.google,
        id: 'g-1',
        email: 'adam@aurelia.care',
        name: 'Adam',
        photoUrl: null,
        idToken: 'token',
      ));

      expect(analytics.has('login'), isTrue);
      expect(analytics.events.single.parameters['method'], 'google');
    });

    test('signing out logs logout, and only while signed in', () {
      final analytics = RecordingAnalytics();
      final auth = AuthController(analytics: analytics)..signIn();
      analytics.events.clear();

      auth.signOut();
      expect(analytics.has('logout'), isTrue);

      analytics.events.clear();
      auth.signOut(); // already out — the guard in signOut, not a second event
      expect(analytics.events, isEmpty);
    });
  });

  group('PlaybackController', () {
    test('playing a track logs session_play with its slug', () {
      final analytics = RecordingAnalytics();
      final playback = PlaybackController(
        engine: SilentAudioEngine(),
        analytics: analytics,
      );

      playback.load(const Track(
        slug: 'dolphins-frequency',
        title: 'Dolphins frequency',
        author: 'Adam Nilson',
        photo: 'dolphins',
        gradient: [],
      ));
      playback.toggle(); // idle -> playing

      expect(analytics.has('session_play'), isTrue);
      expect(analytics.events.single.parameters['slug'], 'dolphins-frequency');

      playback.dispose();
    });
  });

  group('ChatSessionController', () {
    test('applying recommendations logs the count', () {
      final analytics = RecordingAnalytics();
      final chat = ChatSessionController(analytics: analytics);
      final pending = chat.applied.length;

      chat.applyChanges();

      expect(analytics.has('recommendations_applied'), isTrue);
      expect(
        analytics.events.firstWhere((e) => e.name == 'recommendations_applied').parameters['count'],
        pending,
      );

      chat.dispose();
    });

    test('publishing and unpublishing log their own events', () {
      final analytics = RecordingAnalytics();
      final chat = ChatSessionController(analytics: analytics);

      chat.markPublished();
      expect(analytics.has('session_published'), isTrue);

      chat.markUnpublished();
      expect(analytics.has('session_unpublished'), isTrue);

      chat.dispose();
    });

    test('sending a message records whether it was a voice note, never the words', () {
      final analytics = RecordingAnalytics();
      final chat = ChatSessionController(analytics: analytics);

      chat.send(text: 'Make it about twenty minutes');
      final typed = analytics.events.firstWhere((e) => e.name == 'chat_message_sent');
      expect(typed.parameters['has_voice'], isFalse);
      expect(typed.parameters.values, isNot(contains('Make it about twenty minutes')));

      chat.send(text: 'a transcript', voicePath: '/tmp/aurelia-voice-1.m4a');
      final voice = analytics.events.lastWhere((e) => e.name == 'chat_message_sent');
      expect(voice.parameters['has_voice'], isTrue);

      chat.dispose();
    });

    test('opening an existing session logs its slug, once', () {
      final analytics = RecordingAnalytics();
      final chat = ChatSessionController(analytics: analytics);
      final session = findSession('dolphins-frequency')!;

      chat.openSession(session);
      chat.openSession(session); // already open — the no-op guard, not a second event

      expect(
        analytics.events.where((e) => e.name == 'chat_session_opened').length,
        1,
      );

      chat.dispose();
    });

    test('a stated Recreate brief logs changes_stated: true', () {
      final analytics = RecordingAnalytics();
      final chat = ChatSessionController(analytics: analytics);

      chat.seedBrief(const RecreateBrief(
        slug: 'dolphins-frequency',
        title: 'Dolphins frequency',
        author: 'Adam Nilson',
        minutes: 22,
        changes: ['Slower pace'],
      ));

      final event = analytics.events.firstWhere((e) => e.name == 'session_recreate_started');
      expect(event.parameters['slug'], 'dolphins-frequency');
      expect(event.parameters['changes_stated'], isTrue);

      chat.dispose();
    });
  });
}
