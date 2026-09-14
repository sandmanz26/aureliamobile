import 'package:flutter/material.dart';
import '../../core/auth/auth_scope.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';

/// Figma 16523:13934 — what the gear on your own profile opens.
///
/// This is also where sign-out lives. It had been unreachable from anywhere in
/// the UI since it left the drawer, which meant the only way out of an account
/// was to relaunch the app.
class AccountSettingsScreen extends StatefulWidget {
  const AccountSettingsScreen({super.key});

  @override
  State<AccountSettingsScreen> createState() => _AccountSettingsScreenState();
}

class _AccountSettingsScreenState extends State<AccountSettingsScreen> {
  bool _accountsOpen = true;
  bool _connected = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(
              AppPadding.page, AppPadding.md, AppPadding.page, AppSpacing.s10),
          children: [
            Row(
              children: [
                CircleSurfaceButton(
                  icon: Icons.arrow_back,
                  tooltip: 'Back',
                  size: 44,
                  onPressed: () => Navigator.of(context).maybePop(),
                ),
                const SizedBox(width: AppSpacing.s3),
                Expanded(child: Text('Settings', style: AppTextStyles.titleLg)),
                const CoinPill(),
              ],
            ),

            const SizedBox(height: AppSpacing.s8),
            InkWell(
              onTap: () => setState(() => _accountsOpen = !_accountsOpen),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.s1),
                child: Row(
                  children: [
                    const Icon(Icons.person_outline,
                        size: 24, color: AppColors.iconDefault),
                    const SizedBox(width: AppPadding.md),
                    Expanded(
                      child: Text('Connected Accounts',
                          style: AppTextStyles.bodyLg),
                    ),
                    Icon(
                      _accountsOpen ? Icons.expand_less : Icons.expand_more,
                      size: 20,
                      color: AppColors.iconDefault,
                    ),
                  ],
                ),
              ),
            ),

            if (_accountsOpen) ...[
              const SizedBox(height: AppPadding.md),
              Container(
                padding: const EdgeInsets.all(AppPadding.md),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(AppRadius.xl),
                  boxShadow: const [
                    BoxShadow(
                        color: Color(0x0D000000),
                        blurRadius: 24,
                        spreadRadius: 4,
                        offset: Offset(0, 5)),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      alignment: Alignment.center,
                      decoration: const BoxDecoration(
                        color: Color(0xFFFDF1E3),
                        shape: BoxShape.circle,
                      ),
                      child: const GoogleMark(),
                    ),
                    const SizedBox(width: AppPadding.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('Adam Nilson',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppTextStyles.bodyLg),
                          Text('adamnilson@gmail.com',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppTextStyles.bodySm),
                        ],
                      ),
                    ),
                    // The account stays listed when switched off —
                    // disconnecting is a separate, heavier thing than pausing
                    // the sign-in.
                    Switch(
                      value: _connected,
                      onChanged: (value) => setState(() => _connected = value),
                      activeTrackColor: AppColors.iconStrong,
                      thumbColor:
                          const WidgetStatePropertyAll(AppColors.surface),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppPadding.md),
              Material(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(AppRadius.xl),
                child: InkWell(
                  onTap: () {},
                  borderRadius: BorderRadius.circular(AppRadius.xl),
                  child: Padding(
                    padding: const EdgeInsets.all(AppPadding.page),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.add,
                            size: 20, color: AppColors.iconDefault),
                        const SizedBox(width: AppPadding.sm),
                        Flexible(
                          child: Text('Add another Google account',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppTextStyles.bodyLg),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],

            const SizedBox(height: AppSpacing.s8),
            const _SettingsRow(
                icon: Icons.paid_outlined, label: 'Coin Redemption'),
            const _SettingsRow(
                icon: Icons.person_off_outlined, label: 'Account Deletion'),
            _SettingsRow(
              icon: Icons.logout,
              label: 'Log Out',
              danger: true,
              onTap: () {
                AuthScope.of(context).signOut();
                Navigator.of(context)
                    .pushNamedAndRemoveUntil('/home', (route) => false);
              },
            ),
          ],
        ),
      ),
    );
  }
}

/// One tappable line in the list under the accounts block.
class _SettingsRow extends StatelessWidget {
  const _SettingsRow({
    required this.icon,
    required this.label,
    this.onTap,
    this.danger = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final color = danger ? AppPrimitives.danger600 : AppColors.textPrimary;
    return InkWell(
      onTap: onTap,
      child: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppColors.borderSubtle)),
        ),
        padding: const EdgeInsets.symmetric(vertical: AppPadding.page),
        child: Row(
          children: [
            Icon(icon, size: 24, color: color),
            const SizedBox(width: AppPadding.md),
            Expanded(
              child: Text(label,
                  style: AppTextStyles.bodyLg.copyWith(color: color)),
            ),
          ],
        ),
      ),
    );
  }
}
