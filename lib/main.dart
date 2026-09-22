import 'package:flutter/material.dart';
import 'core/audio/audio_engine.dart';
import 'core/audio/voice_capture.dart';
import 'core/audio/playback_controller.dart';
import 'core/auth/auth_scope.dart';
import 'core/auth/sso.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/chat_text_size.dart';
import 'features/auth/forgot_password_screen.dart';
import 'features/auth/reset_password_screen.dart';
import 'features/auth/sign_in_screen.dart';
import 'features/auth/sign_up_screen.dart';
import 'features/challenge/challenge_detail_screen.dart';
import 'features/credits/credits_screen.dart';
import 'features/chat/chat_screen.dart';
import 'features/chat/chat_session_controller.dart';
import 'features/help/help_screen.dart';
import 'features/home/home_screen.dart';
import 'features/invite/invite_screen.dart';
import 'features/notifications/notifications_screen.dart';
import 'features/progress/progress_screen.dart';
import 'features/player/player_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/recreate/recreate_handoff.dart';
import 'features/recreate/recreate_screen.dart';
import 'features/see_all/see_all_screen.dart';
import 'features/session_detail/session_detail_screen.dart';
import 'features/sessions/explore_screen.dart';
import 'features/sessions/session_list_screen.dart';
import 'features/settings/account_settings_screen.dart';
import 'core/data/sessions.dart' show Shelf, findSession;
import 'features/wellness/wellness_screen.dart';

void main() {
  runApp(const AureliaApp());
}

class AureliaApp extends StatefulWidget {
  const AureliaApp({super.key, this.audioEngine, this.voiceCapture, this.sso});

  /// The engine playback runs on. Null is the real one.
  ///
  /// It exists so the widget tests can hand in [SilentAudioEngine]: a test
  /// binding has no platform channels, so constructing the just_audio player
  /// there would fail before the first frame. Nothing else passes it.
  final AudioEngine? audioEngine;

  /// The microphone the cockpit's recorder opens. Null is the device's, and
  /// it is here for the same reason [audioEngine] is.
  final VoiceCapture? voiceCapture;

  /// Who signs you in through the Google and Apple buttons. Null is the dummy
  /// provider; the tests pass one that fails, to reach the branches a working
  /// provider never takes.
  final SsoProvider? sso;

  @override
  State<AureliaApp> createState() => _AureliaAppState();
}

class _AureliaAppState extends State<AureliaApp> {
  final _auth = AuthController();
  final _textSize = ChatTextSizeController();

  /// Both of these sit above the navigator on purpose.
  ///
  /// A session being built has to survive leaving the cockpit to play it, and
  /// a session that is playing has to survive walking back to the cockpit.
  /// Owned by their screens, each would be torn down by the other.
  late final _playback = PlaybackController(engine: widget.audioEngine);
  final _chat = ChatSessionController();

  @override
  void dispose() {
    _auth.dispose();
    _playback.dispose();
    _chat.dispose();
    _textSize.dispose();
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
    '/notifications',
    '/see-all',
    '/challenge',
    '/explore',
    '/sessions',
    '/wellness',
    '/play',
    '/settings',
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
          sso: widget.sso,
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
            sso: widget.sso,
          );
        case '/signup':
          return SignUpScreen(sso: widget.sso);
        case '/forgot-password':
          return const ForgotPasswordScreen();
        case '/reset-password':
          return const ResetPasswordScreen();
        case '/sessions':
          return const SessionListScreen();
        case '/explore':
          return const ExploreScreen();
        case '/chat':
          final args = settings.arguments;
          if (args is ChatArgs) {
            return ChatScreen(
              brief: args.brief,
              startVoice: args.startVoice,
              ask: args.ask,
              slug: args.slug,
              fresh: args.fresh,
              voiceCapture: widget.voiceCapture,
            );
          }
          return ChatScreen(
            brief: args is RecreateBrief ? args : null,
            voiceCapture: widget.voiceCapture,
          );
        case '/play':
          final args = settings.arguments;
          if (args is PlayRequest) {
            return PlayerScreen(
              slug: args.slug,
              origin: args.origin,
              versionId: args.versionId,
            );
          }
          return PlayerScreen(slug: args as String? ?? '');
        case '/session':
          return SessionDetailScreen(slug: settings.arguments as String? ?? '');
        case '/recreate':
          // Still a real route — the form is only switched off, not removed,
          // and a deep link to it should not answer with a dead end. It
          // forwards to the cockpit with the same brief the cards hand over,
          // so every route to a fork ends in one place.
          final slug = settings.arguments as String? ?? '';
          if (recreateFormEnabled) return RecreateScreen(slug: slug);
          final forked = findSession(slug);
          return ChatScreen(
            brief: forked == null ? null : briefFor(forked),
            voiceCapture: widget.voiceCapture,
          );
        case '/credits':
          return const CreditsScreen();
        case '/invite':
          return const InviteScreen();
        case '/notifications':
          return const NotificationsScreen();
        case '/see-all':
          final shelf = settings.arguments;
          return SeeAllScreen(shelf: shelf is Shelf ? shelf : Shelf.picked);
        case '/challenge':
          return ChallengeDetailScreen(slug: settings.arguments as String? ?? '');
        // Help is open: someone locked out of their account still needs it.
        case '/help':
          return const HelpScreen();
        case '/profile':
          // Null is your own profile; a slug is somebody else's. See
          // [profileArgument] for who decides which.
          return ProfileScreen(person: settings.arguments as String?);
        case '/settings':
          return const AccountSettingsScreen();
        case '/wellness':
          return const WellnessScreen();
        case '/progress':
          final args = settings.arguments;
          if (args is ProgressRequest) {
            return ProgressScreen(slug: args.slug, tab: args.tab);
          }
          return ProgressScreen(slug: args as String? ?? '');
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
      child: PlaybackScope(
        notifier: _playback,
        child: ChatSessionScope(
          notifier: _chat,
          child: ChatTextSizeScope(
            notifier: _textSize,
            child: MaterialApp(
              title: 'Aurelia',
              debugShowCheckedModeBanner: false,
              theme: AppTheme.light,
              initialRoute: '/home',
              onGenerateRoute: _onGenerateRoute,
            ),
          ),
        ),
      ),
    );
  }
}
