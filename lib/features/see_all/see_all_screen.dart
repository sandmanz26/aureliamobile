import 'package:flutter/material.dart';
import '../../core/data/sessions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../../core/widgets/session_grid_card.dart';

/// The full contents of one shelf, as a two-column grid.
///
/// The Sessions screen shows the first few of each shelf in a rail; this is the
/// rest. One screen serves every shelf rather than one per shelf, so a new
/// shelf gets its See All for free.
class SeeAllScreen extends StatelessWidget {
  const SeeAllScreen({super.key, required this.shelf});

  final Shelf shelf;

  static const _titles = <Shelf, String>{
    Shelf.community: 'Recreate from Community',
    Shelf.picked: 'Picked for You',
    Shelf.impact: 'Sessions with Biggest Impact',
  };

  @override
  Widget build(BuildContext context) {
    final sessions = sessionsOnShelf(shelf);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(AppPadding.md),
              child: Row(
                children: [
                  CircleSurfaceButton(
                    icon: Icons.arrow_back,
                    tooltip: 'Back',
                    onPressed: () => Navigator.of(context).maybePop(),
                  ),
                  const SizedBox(width: AppSpacing.s3),
                  Expanded(
                    child: Text(
                      _titles[shelf]!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.titleLg,
                    ),
                  ),
                  const CoinPill(),
                ],
              ),
            ),
            Expanded(
              child: sessions.isEmpty
                  ? Center(
                      child: Text('Nothing on this shelf yet.',
                          style: AppTextStyles.bodySm),
                    )
                  : GridView.builder(
                      padding: const EdgeInsets.fromLTRB(
                          AppPadding.lg, 0, AppPadding.lg, AppSpacing.s10),
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        mainAxisSpacing: AppSpacing.s3,
                        crossAxisSpacing: AppSpacing.s3,
                        childAspectRatio: 164 / 205,
                      ),
                      itemCount: sessions.length,
                      itemBuilder: (context, index) => SessionGridCard(
                        session: sessions[index],
                        onOpen: () => Navigator.of(context)
                            .pushNamed('/session', arguments: sessions[index].slug),
                        onRecreate: () => Navigator.of(context)
                            .pushNamed('/recreate', arguments: sessions[index].slug),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
