import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
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
class CoinPill extends StatelessWidget {
  const CoinPill({super.key, this.amount = '1,323'});

  final String amount;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s3),
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
            width: 16,
            height: 16,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFFFFE682), Color(0xFFFF881B)],
              ),
            ),
            child: const Icon(Icons.monetization_on_outlined,
                size: 10, color: AppColors.textInverse),
          ),
          const SizedBox(width: AppSpacing.s2),
          Text(
            amount,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
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

/// Kept for the sign-in screen's Google button — a real brand asset would
/// replace this, but third-party marks are not part of the token system.
class GoogleMark extends StatelessWidget {
  const GoogleMark({super.key});

  @override
  Widget build(BuildContext context) {
    return Transform.rotate(
      angle: math.pi / 8,
      child: const Text(
        'G',
        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF4285F4)),
      ),
    );
  }
}
