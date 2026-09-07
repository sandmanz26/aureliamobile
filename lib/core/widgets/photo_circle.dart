import 'package:flutter/material.dart';
import '../data/photos.dart';

/// Circular counterpart to [CoverImage] — same contract. The gradient is always
/// painted, the photo layers over it, and a failed load leaves a gradient disc
/// that still reads as an avatar rather than a hole in the row.
class PhotoCircle extends StatelessWidget {
  const PhotoCircle({
    super.key,
    required this.photo,
    required this.size,
    required this.gradient,
  });

  final String photo;
  final double size;
  final List<Color> gradient;

  @override
  Widget build(BuildContext context) {
    final pixels = (size * 2).round();
    return Container(
      width: size,
      height: size,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: gradient,
        ),
      ),
      child: Image.network(
        photoUrl(photo, width: pixels, height: pixels),
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => const SizedBox.shrink(),
      ),
    );
  }
}
