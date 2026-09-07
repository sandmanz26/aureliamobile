import 'package:flutter/material.dart';
import '../data/photos.dart';

/// A remote cover photo over a gradient floor.
///
/// The gradient is not a fallback path, it is the floor: it is always painted
/// and the photo layers over it once decoded. A failed load — 404, no network,
/// a blocking proxy — simply leaves the card looking the way it did before
/// photos existed, instead of a broken-image box.
class CoverImage extends StatelessWidget {
  const CoverImage({
    super.key,
    required this.photo,
    required this.gradient,
    this.width = 600,
    this.height = 600,
    this.scrim = true,
  });

  final String photo;
  final List<Color> gradient;
  final int width;
  final int height;

  /// Darkens the photo so overlaid white text stays legible.
  final bool scrim;

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: gradient,
          ),
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              photoUrl(photo, width: width, height: height),
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => const SizedBox.shrink(),
              frameBuilder: (_, child, frame, wasSynchronous) {
                if (wasSynchronous || frame != null) return child;
                return const SizedBox.shrink();
              },
            ),
            if (scrim)
              const DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [Color(0xA6000000), Color(0x26000000), Color(0x1A000000)],
                    stops: [0, 0.55, 1],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
