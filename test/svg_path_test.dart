import 'dart:ui';

import 'package:flutter_test/flutter_test.dart';

import 'package:aurelia_mobile/core/widgets/svg_path.dart';

void main() {
  group('parseSvgPath', () {
    test('absolute and relative commands land in the same place', () {
      final absolute = parseSvgPath('M10 10 L30 10 L30 30 Z');
      final relative = parseSvgPath('m10 10 l20 0 l0 20 z');
      expect(relative.getBounds(), absolute.getBounds());
      expect(absolute.getBounds(), const Rect.fromLTRB(10, 10, 30, 30));
    });

    test('a repeated pair after a moveto is an implicit lineto', () {
      final implicit = parseSvgPath('M0 0 10 0 10 10');
      expect(implicit.getBounds(), const Rect.fromLTRB(0, 0, 10, 10));
    });

    test('numbers run together when a minus sign separates them', () {
      // No spaces around the negatives — the form the exported paths use.
      final path = parseSvgPath('M10 10c-5 0-5 5-5 5');
      expect(path.getBounds().left, closeTo(5, 0.001));
    });

    test('shorthand and vertical commands close the box', () {
      final path = parseSvgPath('M0 0 H20 V20 H0 Z');
      expect(path.getBounds(), const Rect.fromLTRB(0, 0, 20, 20));
      expect(path.contains(const Offset(10, 10)), isTrue);
    });

    test('the Google mark parses to four filled paths inside its box', () {
      // The four path strings the web component draws, in its 20x20 box.
      const marks = [
        'M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.23c1.9-1.75 2.97-4.33 2.97-7.32Z',
        'M10 20c2.7 0 4.96-.89 6.62-2.42l-3.23-2.5c-.9.6-2.05.96-3.4.96-2.6 0-4.8-1.76-5.6-4.12H1.06v2.58A10 10 0 0 0 10 20Z',
        'M4.4 11.92a6 6 0 0 1 0-3.84V5.5H1.06a10 10 0 0 0 0 9l3.34-2.58Z',
        'M10 3.96c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.6 9.6 0 0 0 10 0 10 10 0 0 0 1.06 5.5l3.34 2.58C5.2 5.72 7.4 3.96 10 3.96Z',
      ];
      for (final mark in marks) {
        final bounds = parseSvgPath(mark).getBounds();
        expect(bounds.isEmpty, isFalse);
        // Loose: getBounds is conservative and takes in the cubics' control
        // points, which sit outside the curve they steer.
        expect(bounds.left, greaterThanOrEqualTo(-2));
        expect(bounds.top, greaterThanOrEqualTo(-2));
        expect(bounds.right, lessThanOrEqualTo(22));
        expect(bounds.bottom, lessThanOrEqualTo(22));
      }
    });

    test('an unsupported command is refused rather than half-drawn', () {
      expect(() => parseSvgPath('M0 0 Q5 5 10 0'), throwsFormatException);
    });
  });
}
