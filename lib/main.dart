import 'package:flutter/material.dart';
import 'core/auth/auth_scope.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/forgot_password_screen.dart';
import 'features/auth/reset_password_screen.dart';
import 'features/auth/sign_in_screen.dart';
import 'features/auth/sign_up_screen.dart';
import 'features/chat/chat_screen.dart';
import 'features/home/home_screen.dart';
import 'features/invite/invite_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/recreate/recreate_screen.dart';
import 'features/session_detail/session_detail_screen.dart';
import 'features/sessions/sessions_screen.dart';
import 'features/shell/placeholder_screen.dart';

void main() {
  runApp(const AureliaApp());
}

class AureliaApp extends StatefulWidget {
  const AureliaApp({super.key});

  @override
  State<AureliaApp> createState() => _AureliaAppState();
}

class _AureliaAppState extends State<AureliaApp> {
  final _auth = AuthController();

  @override
  void dispose() {
    _auth.dispose();
    super.dispose();
  }

  /// Screens that need an account. Home is deliberately not among them — a
  /// visitor reads the whole pitch before being asked for an email.
  static const _protected = {
    '/chat',
    '/profile',
    '/session',
    '/recreate',
    '/invite',
    '/explore',
    '/sessions',
    '/wellness',
  };

  Route<dynamic>? _onGenerateRoute(RouteSettings settings) {
    final name = settings.name ?? '/home';

    // A guarded route with no account behind it becomes the sign-in screen,
    // carrying where it was headed so signing in continues there.
    if (_protected.contains(name) && !_auth.signedIn) {
      return MaterialPageRoute(
        settings: settings,
        builder: (_) => SignInScreen(
          redirect: AuthRedirect(route: name, arguments: settings.arguments),
        ),
      );
    }

    Widget build() {
      switch (name) {
        case '/login':
          final redirect = settings.arguments;
          return SignInScreen(
            redirect: redirect is Map<String, dynamic>
                ? AuthRedirect(
                    route: redirect['route'] as String?,
                    arguments: redirect['arguments'],
                  )
                : null,
          );
        case '/signup':
          return const SignUpScreen();
        case '/forgot-password':
          return const ForgotPasswordScreen();
        case '/reset-password':
          return const ResetPasswordScreen();
        case '/sessions':
          return const SessionsScreen();
        case '/chat':
          final brief = settings.arguments;
          return ChatScreen(brief: brief is RecreateBrief ? brief : null);
        case '/session':
          return SessionDetailScreen(slug: settings.arguments as String? ?? '');
        case '/recreate':
          return RecreateScreen(slug: settings.arguments as String? ?? '');
        case '/invite':
          return const InviteScreen();
        case '/profile':
          return const ProfileScreen();
        case '/explore':
          return const PlaceholderScreen(
            route: '/explore',
            title: 'Explore',
            description: 'Browse and search the wider session catalogue.',
          );
        case '/wellness':
          return const PlaceholderScreen(
            route: '/wellness',
            title: 'My wellness',
            description:
                'Progress tracking — chapters, mood baseline and social impact.',
          );
        default:
          return const HomeScreen();
      }
    }

    return MaterialPageRoute(settings: settings, builder: (_) => build());
  }

  @override
  Widget build(BuildContext context) {
    return AuthScope(
      notifier: _auth,
      child: MaterialApp(
        title: 'Aurelia',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        initialRoute: '/home',
        onGenerateRoute: _onGenerateRoute,
      ),
    );
  }
}
