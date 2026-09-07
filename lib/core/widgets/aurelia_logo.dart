import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// The Aurelia brand mark: a gold-to-orange spiral that opens at the lower left.
///
/// Drawn to match the web app's SVG path exactly — one continuous stroke
/// spiralling inward, painted with the same three-stop gradient. This is the
/// only place the mark is drawn, so replacing it with a designer's vector later
/// is one edit and every placement updates with it.
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
          child: CustomPaint(painter: _SpiralMarkPainter()),
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

class _SpiralMarkPainter extends CustomPainter {
  /// The web mark is authored in a 64x64 box; everything below is in that space
  /// and scaled to whatever size the widget was given.
  static const _viewBox = 64.0;

  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / _viewBox;
    canvas.save();
    canvas.scale(scale);

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 9.5
      ..strokeCap = StrokeCap.round
      ..shader = const LinearGradient(
        colors: [Color(0xFFFFD86B), Color(0xFFFCA22B), Color(0xFFF2801A)],
        stops: [0, 0.55, 1],
      ).createShader(const Rect.fromLTWH(10, 8, 44, 50));

    // Outer sweep, then the tighter inner turn — the same two arcs as the SVG.
    final path = Path()
      ..moveTo(18, 46)
      ..arcToPoint(const Offset(46, 50), radius: const Radius.circular(24), largeArc: true)
      ..arcToPoint(const Offset(32, 20), radius: const Radius.circular(13), largeArc: true);

    canvas.drawPath(path, paint);
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _SpiralMarkPainter oldDelegate) => false;
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
