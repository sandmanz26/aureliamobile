import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aurelia_mobile/core/audio/audio_engine.dart';
import 'package:aurelia_mobile/core/audio/playback_controller.dart';

const _track = Track(
  slug: 'dolphins-frequency',
  title: 'Dolphins frequency',
  author: 'Adam Nilson',
  photo: 'dolphins',
  gradient: [Color(0xFF1E3A8A), Color(0xFF60A5FA)],
);

const _other = Track(
  slug: 'ocean-breath',
  title: 'Ocean Breath',
  author: 'Maya Chen',
  photo: 'ocean',
  gradient: [Color(0xFF1E3A8A), Color(0xFF60A5FA)],
);

void main() {
  group('PlaybackController drives an engine', () {
    late SilentAudioEngine engine;
    late PlaybackController playback;

    setUp(() {
      engine = SilentAudioEngine(clipLength: const Duration(seconds: 4));
      playback = PlaybackController(engine: engine);
    });

    tearDown(() => playback.dispose());

    test('the clock comes from the engine, not from a timer here',
        () async {
      playback.load(_track);
      // load() is async under the notify, so let it land before asserting on
      // the length it measured.
      await Future<void>.delayed(Duration.zero);
      expect(playback.length, const Duration(seconds: 4));

      expect(playback.playing, isFalse);
      expect(playback.elapsed.value, Duration.zero);

      playback.toggle();
      expect(playback.playing, isTrue);

      await Future<void>.delayed(const Duration(milliseconds: 250));
      final moved = playback.elapsed.value;
      expect(moved, greaterThan(Duration.zero),
          reason: 'the bar follows the engine position stream');

      playback.toggle();
      expect(playback.playing, isFalse);
      await Future<void>.delayed(const Duration(milliseconds: 200));
      expect(playback.elapsed.value, moved,
          reason: 'a paused engine stops reporting, so the bar holds');
    });

    test('loading the session already on the deck does not restart it',
        () async {
      playback.load(_track);
      playback.toggle();
      await Future<void>.delayed(const Duration(milliseconds: 250));
      final position = playback.elapsed.value;

      // Walking back into the player must not rewind what is running.
      playback.load(_track);
      await Future<void>.delayed(Duration.zero);
      expect(playback.elapsed.value, greaterThanOrEqualTo(position));
      expect(playback.playing, isTrue);
    });

    test('a different session takes the deck from the start', () async {
      playback.load(_track);
      playback.toggle();
      await Future<void>.delayed(const Duration(milliseconds: 250));
      expect(playback.elapsed.value, greaterThan(Duration.zero));

      playback.load(_other);
      await Future<void>.delayed(Duration.zero);
      expect(playback.track?.slug, 'ocean-breath');
      expect(playback.elapsed.value, Duration.zero);
      expect(playback.playing, isFalse,
          reason: 'a new track is loaded onto the deck, not started on it');
    });

    test('length never reports zero, because every bar divides by it',
        () async {
      // An engine that cannot measure the clip — a bed that failed to load.
      final broken = PlaybackController(engine: SilentAudioEngine(clipLength: Duration.zero));
      broken.load(_track);
      await Future<void>.delayed(Duration.zero);
      expect(broken.length.inMilliseconds, greaterThan(0));
      broken.dispose();
    });
  });
}
