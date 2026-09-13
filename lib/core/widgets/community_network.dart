import 'dart:ui' as ui;

import 'package:flutter/material.dart';

/// The figure standing inside a network, above the closing CTA on Home.
///
/// Painted rather than shipped as a PNG, for the same reason the web draws it
/// as an SVG: it is the widest element on the page, so a raster would either
/// band on a phone or cost a large file, and the palette has to follow the
/// theme rather than bake one set of oranges into pixels.
///
/// Every coordinate below is the web component's, in its 402x240 authoring
/// box, scaled to whatever width the widget is given — the two platforms draw
/// the same picture, not two drawings of the same idea.
class CommunityNetwork extends StatelessWidget {
  const CommunityNetwork({super.key});

  /// The authoring box, so callers can reserve height before layout.
  static const aspectRatio = 402 / 240;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _NetworkPainter(),
      child: const AspectRatio(aspectRatio: aspectRatio),
    );
  }
}

/// Ringed nodes — the people. Hand-placed; an arc, not a random scatter.
const _nodes = <Offset>[
  Offset(74, 116),
  Offset(128, 52),
  Offset(201, 36),
  Offset(276, 56),
  Offset(330, 110),
  Offset(48, 176),
  Offset(352, 172),
];

/// Which people are connected. Indices into [_nodes].
const _links = <(int, int)>[
  (0, 1), (1, 2), (2, 3), (3, 4),
  (0, 2), (1, 3), (2, 4),
  (5, 0), (4, 6), (5, 2), (6, 3), (5, 6),
];

/// Loose dots — the crowd the named nodes sit in: centre, radius, opacity.
const _dots = <(double, double, double, double)>[
  (30, 92, 2.5, 0.5), (96, 62, 2, 0.35),
  (160, 74, 3, 0.55), (232, 30, 2, 0.4),
  (300, 34, 2.5, 0.45), (368, 74, 2, 0.35),
  (388, 128, 3, 0.5), (20, 146, 2, 0.4),
  (86, 190, 2.5, 0.45), (140, 206, 2, 0.3),
  (262, 200, 2.5, 0.4), (312, 196, 2, 0.3),
  (56, 62, 2, 0.3), (246, 92, 2, 0.3),
  (152, 34, 2, 0.35), (348, 48, 2, 0.3),
  (108, 148, 2, 0.28), (296, 142, 2, 0.28),
  (12, 112, 2, 0.3), (392, 176, 2, 0.3),
];

const _accent = Color(0xFFFF881B);

class _NetworkPainter extends CustomPainter {
  static const _boxWidth = 402.0;
  static const _boxHeight = 240.0;

  /// Vertical wash shared by the head and the shoulders, mapped to whichever
  /// shape is being filled — the web gradient is objectBoundingBox, so each
  /// shape gets its own run of the same three stops.
  Shader _figureShader(Rect bounds) => const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          Color(0xD9FFC7A6),
          Color(0x80FFD9C2),
          Color(0x00FFE8D8),
        ],
        stops: [0, 0.55, 1],
      ).createShader(bounds);

  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    canvas.scale(size.width / _boxWidth);

    // The figure: head and shoulders, blurred so it reads as presence rather
    // than as a portrait competing with the headline below.
    canvas.saveLayer(
      const Rect.fromLTWH(-40, -40, _boxWidth + 80, _boxHeight + 80),
      Paint()..imageFilter = ui.ImageFilter.blur(sigmaX: 4, sigmaY: 4),
    );

    final shoulders = Path()
      ..moveTo(201, 128)
      ..relativeCubicTo(-38, 0, -62, 26, -70, 60)
      ..relativeCubicTo(-4, 18, -6, 34, -7, 52)
      ..relativeLineTo(154, 0)
      ..relativeCubicTo(-1, -18, -3, -34, -7, -52)
      ..relativeCubicTo(-8, -34, -32, -60, -70, -60)
      ..close();
    canvas.drawPath(
      shoulders,
      Paint()..shader = _figureShader(shoulders.getBounds()),
    );

    final head = Rect.fromCenter(
        center: const Offset(201, 112), width: 66, height: 80);
    canvas.drawOval(head, Paint()..shader = _figureShader(head));

    final halo = Rect.fromCenter(
        center: const Offset(201, 112), width: 148, height: 172);
    canvas.drawOval(
      halo,
      Paint()
        ..shader = const RadialGradient(
          center: Alignment(0, -0.2),
          radius: 0.58,
          colors: [
            Color(0x52FFC0CE),
            Color(0x29FFD2B0),
            Color(0x00FFE0CC),
          ],
          stops: [0, 0.45, 1],
        ).createShader(halo),
    );

    canvas.restore();

    // Links first, so a node always sits on top of the lines it joins.
    final link = Paint()
      ..color = _accent.withValues(alpha: 0.38)
      ..strokeWidth = 1
      ..strokeCap = StrokeCap.round;
    for (final (a, z) in _links) {
      _dashedLine(canvas, _nodes[a], _nodes[z], link);
    }

    for (final (x, y, r, opacity) in _dots) {
      canvas.drawCircle(
        Offset(x, y),
        r,
        Paint()..color = _accent.withValues(alpha: opacity),
      );
    }

    final nodeFill = Paint()..color = const Color(0xFFFFF6E6);
    final nodeRing = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..color = _accent.withValues(alpha: 0.55);
    final nodeCore = Paint()..color = _accent;
    for (final node in _nodes) {
      canvas.drawCircle(node, 11, nodeFill);
      canvas.drawCircle(node, 11, nodeRing);
      canvas.drawCircle(node, 5.5, nodeCore);
    }

    canvas.restore();
  }

  /// The web draws these with `stroke-dasharray="3 4"`; Flutter has no dash
  /// support on Canvas, so walk the segment and lay the dashes down by hand.
  void _dashedLine(Canvas canvas, Offset from, Offset to, Paint paint) {
    const dash = 3.0;
    const gap = 4.0;
    final span = to - from;
    final length = span.distance;
    if (length == 0) return;
    final step = span / length;
    for (var at = 0.0; at < length; at += dash + gap) {
      canvas.drawLine(
        from + step * at,
        from + step * (at + dash).clamp(0.0, length),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(_NetworkPainter oldDelegate) => false;
}
