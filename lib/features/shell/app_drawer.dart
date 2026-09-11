import 'package:flutter/material.dart';
import '../../core/auth/auth_scope.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../../core/widgets/photo_circle.dart';

/// The navigation drawer — the mobile counterpart of the web sidebar.
///
/// Nav items are never greyed out for a visitor: tapping one navigates, and the
/// destination itself asks for an account. That keeps the app's shape visible
/// before sign-up instead of hiding it behind disabled rows.
class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key, required this.current});

  /// Route name of the screen showing the drawer, so it can mark itself.
  final String current;

  static const _recent = [
    ('Sleep Meditation', 'Adam Nilson', 'sleep'),
    ('Morning Mindfulness', 'Adam Nilson', 'morning'),
    ('Stress relief techniques', 'Marcus Lee', 'stress'),
  ];

  static const _nav = [
    ('/chat', Icons.chat_bubble_outline, 'Chat'),
    ('/explore', Icons.explore_outlined, 'Explore'),
    ('/sessions', Icons.library_music_outlined, 'Sessions'),
    ('/wellness', Icons.waves_outlined, 'My wellness'),
  ];

  void _go(BuildContext context, String route) {
    Navigator.of(context).pop();
    if (route == current) return;
    Navigator.of(context).pushNamed(route);
  }

  @override
  Widget build(BuildContext context) {
    final auth = AuthScope.of(context);

    return Drawer(
      backgroundColor: AppColors.surface,
      width: 313,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: AppSpacing.s6),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const AureliaLogo(iconSize: 30),
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).pop();
                      requireSignIn(context,
                          destination: '/notifications',
                          then: () => Navigator.of(context)
                              .pushNamed('/notifications'));
                    },
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        const Icon(Icons.notifications_none,
                            color: AppColors.iconDefault, size: 22),
                        // Unread marker. A real build drives this from the feed.
                        Positioned(
                          right: -1,
                          top: -1,
                          child: Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: AppColors.feedbackError,
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.surface, width: 2),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.s6),
              Expanded(
                child: ListView(
                  padding: EdgeInsets.zero,
                  children: [
                    if (auth.signedIn)
                      _NavItem(
                        icon: Icons.person_outline,
                        avatar: 'avatar',
                        label: 'Profile',
                        active: current == '/profile',
                        onTap: () => _go(context, '/profile'),
                      )
                    else
                      _NavItem(
                        icon: Icons.person_outline,
                        label: 'Sign In',
                        active: false,
                        onTap: () {
                          Navigator.of(context).pop();
                          Navigator.of(context).pushNamed('/login');
                        },
                      ),
                    for (final (route, icon, label) in _nav)
                      _NavItem(
                        icon: icon,
                        label: label,
                        active: route == current,
                        onTap: () => _go(context, route),
                      ),
                    const SizedBox(height: AppSpacing.s6),
                    if (auth.signedIn) ...[
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s3),
                        child: Text('Latest', style: AppTextStyles.bodySm),
                      ),
                      const SizedBox(height: AppSpacing.s3),
                      for (final (title, author, photo) in _recent)
                        Padding(
                          padding: const EdgeInsets.fromLTRB(
                              AppSpacing.s3, 0, AppSpacing.s3, AppSpacing.s4),
                          child: Row(
                            children: [
                              PhotoCircle(
                                photo: photo,
                                size: 40,
                                gradient: const [
                                  AppPrimitives.info300,
                                  AppPrimitives.primary300,
                                ],
                              ),
                              const SizedBox(width: AppSpacing.s3),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(title,
                                        overflow: TextOverflow.ellipsis,
                                        style: AppTextStyles.label),
                                    Text(author,
                                        overflow: TextOverflow.ellipsis,
                                        style: AppTextStyles.caption),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                    const SizedBox(height: AppSpacing.s2),
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.of(context).pop();
                        requireSignIn(context,
                            destination: '/chat',
                            then: () => Navigator.of(context).pushNamed('/chat'));
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.brandEmphasis,
                        foregroundColor: AppColors.textInverse,
                      ),
                      icon: const Icon(Icons.add, size: 18),
                      label: const Text('New session'),
                    ),
                  ],
                ),
              ),
              const Divider(),
              _NavItem(
                icon: Icons.person_add_alt,
                label: 'Invite a Friend',
                active: current == '/invite',
                onTap: () {
                  Navigator.of(context).pop();
                  requireSignIn(context,
                      destination: '/invite',
                      then: () => Navigator.of(context).pushNamed('/invite'));
                },
              ),
              _NavItem(
                icon: Icons.help_outline,
                label: 'Help',
                active: current == '/help',
                onTap: () {
                  Navigator.of(context).pop();
                  Navigator.of(context).pushNamed('/help');
                },
              ),
              _NavItem(
                icon: auth.signedIn ? Icons.logout : Icons.login,
                label: auth.signedIn ? 'Sign out' : 'Sign in',
                active: false,
                onTap: () {
                  Navigator.of(context).pop();
                  if (auth.signedIn) {
                    auth.signOut();
                  } else {
                    Navigator.of(context).pushNamed('/login');
                  }
                },
              ),
              const SizedBox(height: AppSpacing.s3),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.label,
    required this.active,
    required this.onTap,
    this.avatar,
  });

  final IconData icon;

  /// Photo key to show in place of the icon — the Profile row wears the
  /// user's own face, as on web.
  final String? avatar;
  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: active ? AppColors.backgroundElevated : Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.s3, vertical: AppSpacing.s3),
          child: Row(
            children: [
              if (avatar != null)
                PhotoCircle(
                  photo: avatar!,
                  size: 20,
                  gradient: const [AppPrimitives.primary300, AppPrimitives.info300],
                )
              else
                Icon(icon, size: 20, color: AppColors.iconDefault),
              const SizedBox(width: AppSpacing.s3),
              // Expanded, not bare: the drawer is a fixed 313 wide and a long
              // label — or a larger system text size — otherwise overflows the
              // row rather than wrapping.
              Expanded(
                child: Text(
                  label,
                  style: AppTextStyles.bodyLg.copyWith(
                    fontWeight: active ? FontWeight.w600 : FontWeight.w400,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
