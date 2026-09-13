import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import 'svg_path.dart';
import '../theme/app_spacing.dart';

/// The Aurelia brand mark: a gold-to-orange tile with a sweep and a dot.
///
/// Traced from the supplied logo artwork, to match the web app's drawing of it
/// shape for shape. This is the only place the mark is drawn, so replacing it
/// with a designer's vector later is one edit and every placement updates.
class AureliaLogo extends StatelessWidget {
  const AureliaLogo({super.key, this.iconSize = 40, this.markOnly = false});

  final double iconSize;

  /// Mark only, no wordmark — for tight spots like an app-bar leading slot.
  final bool markOnly;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: iconSize,
          height: iconSize,
          child: CustomPaint(painter: _TileMarkPainter()),
        ),
        if (!markOnly) ...[
          const SizedBox(width: AppSpacing.s2),
          ShaderMask(
            shaderCallback: (bounds) => const LinearGradient(
              colors: [Color(0xFFFCA22B), Color(0xFFF2801A)],
            ).createShader(bounds),
            child: Text(
              'aurelia',
              style: TextStyle(
                fontSize: iconSize * 0.62,
                fontWeight: FontWeight.w500,
                height: 1,
                letterSpacing: -iconSize * 0.02,
                color: AppColors.surface,
              ),
            ),
          ),
        ],
      ],
    );
  }
}

class _TileMarkPainter extends CustomPainter {
  /// The web mark is authored in a 64x64 box; everything below is in that space
  /// and scaled to whatever size the widget was given.
  static const _viewBox = 64.0;

  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / _viewBox;
    canvas.save();
    canvas.scale(scale);

    final tile = RRect.fromRectAndRadius(
      const Rect.fromLTWH(2, 2, 60, 60),
      const Radius.circular(17),
    );
    canvas.drawRRect(
      tile,
      Paint()
        ..shader = const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFFFCB63), Color(0xFFF9A331), Color(0xFFEF7C14)],
          stops: [0, 0.5, 1],
        ).createShader(const Rect.fromLTWH(6, 4, 52, 56)),
    );

    final white = Paint()..color = Colors.white;

    // The sweep: wide at the upper right, tapering to a point at the lower left.
    final sweep = Path()
      ..moveTo(56, 9)
      ..cubicTo(42, 15, 27, 26, 10, 47)
      ..cubicTo(25, 34, 40, 26, 58, 20)
      ..close();
    canvas.drawPath(sweep, white);

    // The dot it sweeps around.
    canvas.drawCircle(const Offset(33, 41), 8.5, white);

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// The coin balance pill in the app bars.
///
/// Two shapes, as in Figma: the app bars carry a 16px coin with the currency
/// glyph, and the chat header carries a larger coin drawn as a ring. Both sit
/// in the same 44px pill so the header trio lines up.
class CoinPill extends StatelessWidget {
  const CoinPill({super.key, this.amount = '1,323'}) : ringed = false;

  /// The chat header's variant — a 20px coin drawn as a ring.
  const CoinPill.ringed({super.key, this.amount = '1,323'}) : ringed = true;

  final String amount;
  final bool ringed;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 44,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.full),
        boxShadow: const [
          BoxShadow(color: Color(0x14000000), blurRadius: 8, offset: Offset(0, 2)),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: ringed ? 20 : 16,
            height: ringed ? 20 : 16,
            alignment: Alignment.center,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFFFFE682), Color(0xFFFF881B)],
              ),
            ),
            child: ringed
                ? Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.textInverse, width: 2),
                    ),
                  )
                : const Icon(Icons.monetization_on_outlined,
                    size: 10, color: AppColors.textInverse),
          ),
          const SizedBox(width: AppSpacing.s2),
          Text(
            amount,
            style: TextStyle(
              fontSize: ringed ? 14 : 12,
              fontWeight: ringed ? FontWeight.w400 : FontWeight.w500,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

/// Rounded rectangle that carries the app's soft elevation, used for the
/// circular icon buttons in the headers.
class CircleSurfaceButton extends StatelessWidget {
  const CircleSurfaceButton({
    super.key,
    required this.icon,
    required this.onPressed,
    this.tooltip,
    this.size = 40,
  });

  final IconData icon;
  final VoidCallback onPressed;
  final String? tooltip;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip ?? '',
      child: Material(
        color: AppColors.surface,
        shape: const CircleBorder(),
        elevation: 1,
        shadowColor: const Color(0x14000000),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onPressed,
          child: SizedBox(
            width: size,
            height: size,
            child: Icon(icon, size: 20, color: AppColors.iconStrong),
          ),
        ),
      ),
    );
  }
}

/// The Google mark on the sign-in screen's continue button — the same four
/// paths the web draws, in the same 20x20 box, so the two builds show the
/// same brand asset rather than a letter standing in for one.
class GoogleMark extends StatelessWidget {
  const GoogleMark({super.key, this.size = 20});

  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _GooglePainter()),
    );
  }
}

class _GooglePainter extends CustomPainter {
  /// path data, colour — lifted from the web component unchanged.
  static const _paths = <(String, int)>[
    (
      'M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.23c1.9-1.75 2.97-4.33 2.97-7.32Z',
      0xFF4285F4,
    ),
    (
      'M10 20c2.7 0 4.96-.89 6.62-2.42l-3.23-2.5c-.9.6-2.05.96-3.4.96-2.6 0-4.8-1.76-5.6-4.12H1.06v2.58A10 10 0 0 0 10 20Z',
      0xFF34A853,
    ),
    (
      'M4.4 11.92a6 6 0 0 1 0-3.84V5.5H1.06a10 10 0 0 0 0 9l3.34-2.58Z',
      0xFFFBBC05,
    ),
    (
      'M10 3.96c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.6 9.6 0 0 0 10 0 10 10 0 0 0 1.06 5.5l3.34 2.58C5.2 5.72 7.4 3.96 10 3.96Z',
      0xFFEA4335,
    ),
  ];

  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    canvas.scale(size.width / 20);
    for (final (data, colour) in _paths) {
      canvas.drawPath(parseSvgPath(data), Paint()..color = Color(colour));
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(_GooglePainter oldDelegate) => false;
}
