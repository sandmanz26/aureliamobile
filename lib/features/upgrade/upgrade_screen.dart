import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';

/// What the plan is worth, said as the product would say it.
const _benefits = <(String, String)>[
  (
    'More AI sessions',
    'Create more sessions and keep exploring your wellness journey without hitting your current limit.',
  ),
  (
    'More room to explore',
    'Keep creating, reflecting, and discovering with Aurelia AI.',
  ),
];

const _brand = Color(0xFFFF881B);
const _muted = Color(0xFF525252);

/// Figma "Free Limit" — the paywall the cockpit's Upgrade button opens.
///
/// A full screen rather than a sheet: it is the only thing being asked, and a
/// sheet over a thread you have just been stopped from using would keep the
/// dead composer in view behind it.
///
/// It closes with an X and no other chrome — no back arrow, no menu. Nothing
/// here leads anywhere except back to what you were doing.
class UpgradeScreen extends StatefulWidget {
  const UpgradeScreen({super.key});

  @override
  State<UpgradeScreen> createState() => _UpgradeScreenState();
}

class _UpgradeScreenState extends State<UpgradeScreen> {
  bool _annual = false;

  @override
  Widget build(BuildContext context) {
    final amount = _annual ? '\$100' : '\$10';
    final per = _annual ? '/ year' : '/ month';

    return Scaffold(
      body: Container(
        // The warm wash is the only decoration, and it sits under the card
        // rather than behind the copy — the page argues in words, not colour.
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.white, Color(0xFFFFF6E9), Color(0xFFFFD9A3)],
            stops: [0, 0.62, 1],
          ),
        ),
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(
                AppPadding.page, AppSpacing.s3, AppPadding.page, AppSpacing.s10),
            children: [
              Align(
                alignment: Alignment.centerRight,
                child: Tooltip(
                  message: 'Close',
                  child: Material(
                    color: AppColors.surface,
                    shape: const CircleBorder(),
                    elevation: 1,
                    shadowColor: const Color(0x14000000),
                    child: InkWell(
                      customBorder: const CircleBorder(),
                      onTap: () => Navigator.of(context).maybePop(),
                      child: const SizedBox(
                        width: 44,
                        height: 44,
                        child: Icon(Icons.close,
                            size: 20, color: AppColors.iconDefault),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: AppPadding.md),
              const Text.rich(
                TextSpan(children: [
                  TextSpan(text: 'Upgrade for more access to '),
                  TextSpan(text: 'Aurelia AI', style: TextStyle(color: _brand)),
                ]),
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontSize: 28, height: 36 / 28, color: AppColors.textPrimary),
              ),
              const SizedBox(height: AppSpacing.s3),
              const Text('Save more with annual billing!',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      fontSize: 14,
                      height: 21 / 14,
                      fontWeight: FontWeight.w300,
                      color: _muted)),
              const SizedBox(height: AppSpacing.s6),
              // Segmented, not two buttons: they are one choice with two
              // positions, and the pill that moves says which one you are on.
              Center(
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.s1),
                  decoration: BoxDecoration(
                    color: AppColors.surface.withValues(alpha: 0.7),
                    borderRadius: BorderRadius.circular(AppRadius.full),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _CycleButton(
                        label: 'Monthly',
                        selected: !_annual,
                        onTap: () => setState(() => _annual = false),
                      ),
                      _CycleButton(
                        label: 'Annual',
                        selected: _annual,
                        onTap: () => setState(() => _annual = true),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.s6),
              Container(
                padding: const EdgeInsets.all(AppPadding.page),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  border: Border.all(color: const Color(0xFFFFD9A3)),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: const [
                    BoxShadow(
                        color: Color(0x0D000000),
                        blurRadius: 24,
                        spreadRadius: 4,
                        offset: Offset(0, 5)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Recommended',
                        style: TextStyle(
                            fontSize: 12, height: 16 / 12, color: _brand)),
                    const SizedBox(height: 4),
                    const Text('Aurelia AI Plus',
                        style: TextStyle(
                            fontSize: 20,
                            height: 28 / 20,
                            color: AppColors.textPrimary)),
                    const SizedBox(height: AppSpacing.s2),
                    const Text(
                        'More access to AI-powered sessions, insights, and personalized wellness support.',
                        style: TextStyle(
                            fontSize: 14,
                            height: 21 / 14,
                            fontWeight: FontWeight.w300,
                            color: _muted)),
                    const SizedBox(height: AppPadding.md),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(amount,
                            style: const TextStyle(
                                fontSize: 28,
                                height: 34 / 28,
                                color: AppColors.textPrimary)),
                        const SizedBox(width: 6),
                        Text(per,
                            style: const TextStyle(
                                fontSize: 14,
                                height: 19 / 14,
                                fontWeight: FontWeight.w300,
                                color: _muted)),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.s5),
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: () {},
                        child: const Text('Get Aurelia AI Plus'),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.s5),
                    const Divider(height: 1, color: Color(0xFFF0F0F0)),
                    const SizedBox(height: AppSpacing.s5),
                    const Row(
                      children: [
                        Icon(Icons.auto_awesome, size: 18, color: _brand),
                        SizedBox(width: AppSpacing.s2),
                        Text('Aurelia AI',
                            style: TextStyle(
                                fontSize: 16,
                                height: 24 / 16,
                                color: AppColors.textPrimary)),
                      ],
                    ),
                    const SizedBox(height: AppPadding.md),
                    for (final (title, body) in _benefits)
                      Padding(
                        padding: const EdgeInsets.only(bottom: AppPadding.md),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Padding(
                              padding: EdgeInsets.only(top: 3),
                              child: Icon(Icons.check,
                                  size: 18, color: AppColors.textPrimary),
                            ),
                            const SizedBox(width: AppSpacing.s2),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(title,
                                      style: const TextStyle(
                                          fontSize: 14,
                                          height: 19 / 14,
                                          color: AppColors.textPrimary)),
                                  const SizedBox(height: 4),
                                  Text(body,
                                      style: const TextStyle(
                                          fontSize: 12,
                                          height: 18 / 12,
                                          fontWeight: FontWeight.w300,
                                          color: _muted)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CycleButton extends StatelessWidget {
  const _CycleButton(
      {required this.label, required this.selected, required this.onTap});

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      inMutuallyExclusiveGroup: true,
      selected: selected,
      child: Material(
        color: selected ? AppColors.surface : Colors.transparent,
        shape: const StadiumBorder(),
        elevation: selected ? 1 : 0,
        shadowColor: const Color(0x14000000),
        child: InkWell(
          customBorder: const StadiumBorder(),
          onTap: onTap,
          child: SizedBox(
            width: 92,
            height: 36,
            child: Center(
              child: Text(label,
                  style: TextStyle(
                    fontSize: 14,
                    height: 19 / 14,
                    color: selected
                        ? AppColors.textPrimary
                        : AppColors.textSecondary,
                  )),
            ),
          ),
        ),
      ),
    );
  }
}
