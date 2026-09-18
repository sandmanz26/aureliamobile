import 'dart:ui';
import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';

/// A session with nothing in it yet — Figma 16658:28872.
///
/// The thread is where the product happens, so an empty one cannot just be
/// blank space above a text field: it has to say what the field is for. The
/// orb is Aurelia present and waiting, and the question names what this screen
/// is actually asking ("creating", not "searching").
///
/// New session used to open on the demo conversation, on the grounds that a
/// blank scroll is a worse first screen than one already mid-conversation. The
/// frame disagrees, and it is right: that conversation was about a session the
/// user had not made, so "New session" opened on somebody else's and the first
/// thing the screen did was misrepresent itself.
class EmptyThread extends StatelessWidget {
  const EmptyThread({super.key, required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: AppSpacing.s8),
        // Three layers, not one: a 160 radial wash at half opacity with a 52
        // gold disc and a 64 orange disc blurred inside it and deliberately
        // off-centre from each other. That offset is the whole effect — one
        // centred blur reads as a dot, where these read as light with a
        // direction in it.
        //
        // Drawn rather than an image: it is the largest warm thing on the
        // screen and a raster of a blur bands badly on a phone.
        SizedBox(
          width: 160,
          height: 160,
          child: Stack(
            children: [
              Opacity(
                opacity: 0.5,
                child: Container(
                  width: 160,
                  height: 160,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        Color(0xFFFF9E49),
                        Color(0x80FDBC56),
                        Color(0x00FFF1DB),
                      ],
                      stops: [0, 0.5, 1],
                    ),
                  ),
                ),
              ),
              Positioned(
                left: 45,
                top: 45,
                child: ImageFiltered(
                  imageFilter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
                  child: Container(
                    width: 52,
                    height: 52,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Color(0xFFFFE682),
                    ),
                  ),
                ),
              ),
              Positioned(
                left: 52,
                top: 52,
                child: ImageFiltered(
                  imageFilter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                  child: Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFFFF881B).withValues(alpha: 0.8),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.s8),
        // 24 Regular at 28, written out because the frame's leading is 115%
        // rather than the scale's. 295 wide is what breaks it after "you", as
        // the frame does.
        SizedBox(
          width: 295,
          child: Text(
            'Hello $name, What are you creating today?',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 24,
              height: 28 / 24,
              color: AppColors.textPrimary,
            ),
          ),
        ),
      ],
    );
  }
}
