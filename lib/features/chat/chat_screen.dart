import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../shell/app_drawer.dart';
import 'widgets/voice_message.dart';
import 'widgets/voice_recorder.dart';

/// A brief handed over from the Recreate screen.
class RecreateBrief {
  const RecreateBrief({
    required this.title,
    required this.author,
    required this.minutes,
    required this.changes,
  });

  final String title;
  final String author;
  final int minutes;
  final List<String> changes;
}

/// What a route can hand the cockpit on arrival.
class ChatArgs {
  const ChatArgs({this.brief, this.startVoice = false});

  final RecreateBrief? brief;

  /// Opens the recorder immediately — set by Home's mic.
  final bool startVoice;
}

/// Delivery state, as a messaging app shows it: one tick sent, two ticks read.
enum DeliveryStatus { sending, sent, read }

class _Message {
  _Message({
    required this.id,
    required this.fromAurelia,
    required this.text,
    required this.at,
    this.voiceDuration,
    this.status,
  });

  final int id;
  final bool fromAurelia;
  final String text;
  final DateTime at;

  /// Set when the message is a voice note rather than typed text.
  final Duration? voiceDuration;

  DeliveryStatus? status;
}

/// The cockpit. Reads like a messaging app: runs grouped by sender and time,
/// one avatar and one timestamp per run, delivery ticks, a typing indicator,
/// and voice that produces a real message instead of ending silently.
class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key, this.brief, this.startVoice = false});

  final RecreateBrief? brief;
  final bool startVoice;

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  static const _suggestions = ['Add more white noise', 'Make it longer', 'Female voice'];

  final _scrollController = ScrollController();
  final _composer = TextEditingController();
  final _timers = <Timer>[];

  late final List<_Message> _messages;
  int _nextId = 5;
  bool _typing = false;
  late bool _listening = widget.startVoice;

  @override
  void initState() {
    super.initState();
    // The thread opens mid-conversation, so the first messages are backdated.
    final start = DateTime.now().subtract(const Duration(minutes: 9));
    _messages = [
      _Message(
        id: 1,
        fromAurelia: true,
        at: start,
        text: 'Good morning, Adam.\n\nLooks like you had a good sleep last night, '
            'score improved by 7% due to increased REM sleep.',
      ),
      _Message(
        id: 2,
        fromAurelia: true,
        at: start.add(const Duration(seconds: 4)),
        text: 'How did you find the sleep meditation we created?',
      ),
      _Message(
        id: 3,
        fromAurelia: false,
        at: start.add(const Duration(seconds: 96)),
        text: 'It was good, but it was to short, I had to repeat it multiple times.',
        status: DeliveryStatus.read,
      ),
      _Message(
        id: 4,
        fromAurelia: true,
        at: start.add(const Duration(seconds: 104)),
        text: 'Based on the diagnosis and your feedback, this is what I’d would recommend:',
      ),
    ];

    final brief = widget.brief;
    if (brief != null) {
      // A hand-off from Recreate opens the thread with the fork already stated,
      // so the user lands mid-conversation rather than at a blank prompt.
      final lines = brief.changes.isEmpty
          ? '• Keep it as it is'
          : brief.changes.map((line) => '• $line').join('\n');
      _messages.add(_Message(
        id: _nextId++,
        fromAurelia: false,
        at: DateTime.now(),
        status: DeliveryStatus.read,
        text: 'Recreate “${brief.title}” by ${brief.author}, at ${brief.minutes} minutes.\n$lines',
      ));
      _typing = true;
      _after(const Duration(milliseconds: 1600), () {
        setState(() {
          _typing = false;
          _messages.add(_Message(
            id: _nextId++,
            fromAurelia: true,
            at: DateTime.now(),
            text: 'Got it — forking ${brief.author}’s session and keeping them '
                'credited in the lineage. Tell me anything else you want changed '
                'and I’ll build your version.',
          ));
        });
        _scrollToEnd();
      });
    }
  }

  @override
  void dispose() {
    for (final timer in _timers) {
      timer.cancel();
    }
    _scrollController.dispose();
    _composer.dispose();
    super.dispose();
  }

  /// Schedules work that must not fire after the screen is gone.
  void _after(Duration delay, VoidCallback action) {
    _timers.add(Timer(delay, () {
      if (mounted) action();
    }));
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    });
  }

  /// Sends, then walks the message through sending → sent → read and brings
  /// back a reply — the rhythm a chat app has, rather than a bubble that just
  /// appears.
  void _send({required String text, Duration? voiceDuration}) {
    final id = _nextId++;
    setState(() {
      _messages.add(_Message(
        id: id,
        fromAurelia: false,
        text: text,
        at: DateTime.now(),
        voiceDuration: voiceDuration,
        status: DeliveryStatus.sending,
      ));
    });
    _scrollToEnd();

    void setStatus(DeliveryStatus status) {
      setState(() {
        for (final message in _messages) {
          if (message.id == id) message.status = status;
        }
      });
    }

    _after(const Duration(milliseconds: 400), () => setStatus(DeliveryStatus.sent));
    _after(const Duration(milliseconds: 900), () {
      setStatus(DeliveryStatus.read);
      setState(() => _typing = true);
      _scrollToEnd();
    });
    _after(const Duration(milliseconds: 2400), () {
      setState(() {
        _typing = false;
        _messages.add(_Message(
          id: _nextId++,
          fromAurelia: true,
          at: DateTime.now(),
          text: 'Got it — I’ve noted that for the next revision of your session.',
        ));
      });
      _scrollToEnd();
    });
  }

  String _clock(DateTime at) {
    final hour = at.hour % 12 == 0 ? 12 : at.hour % 12;
    final period = at.hour < 12 ? 'AM' : 'PM';
    return '$hour:${at.minute.toString().padLeft(2, '0')} $period';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const AppDrawer(current: '/chat'),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(AppPadding.md),
              child: Row(
                children: [
                  Builder(
                    builder: (context) => CircleSurfaceButton(
                      icon: Icons.menu,
                      tooltip: 'Open menu',
                      onPressed: () => Scaffold.of(context).openDrawer(),
                    ),
                  ),
                  const Spacer(),
                  const CoinPill(),
                  const SizedBox(width: AppSpacing.s2),
                  CircleSurfaceButton(
                    icon: Icons.more_horiz,
                    tooltip: 'More',
                    onPressed: () {},
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                controller: _scrollController,
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                children: [
                  Center(
                    child: Container(
                      margin: const EdgeInsets.only(bottom: AppSpacing.s2),
                      padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.s3, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.backgroundElevated,
                        borderRadius: BorderRadius.circular(AppRadius.full),
                      ),
                      child: Text('Today', style: AppTextStyles.caption),
                    ),
                  ),
                  for (var i = 0; i < _messages.length; i++) _bubble(i),
                  if (_typing) _typingIndicator(),
                  const SizedBox(height: AppSpacing.s4),
                ],
              ),
            ),
            if (_listening)
              VoiceRecorder(
                onSend: (transcript, duration) {
                  setState(() => _listening = false);
                  _send(text: transcript, voiceDuration: duration);
                },
                onCancel: () => setState(() => _listening = false),
              )
            else ...[
              SizedBox(
                height: 40,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: AppPadding.lg),
                  itemCount: _suggestions.length,
                  separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.s2),
                  itemBuilder: (context, index) => OutlinedButton.icon(
                    onPressed: () => _send(text: _suggestions[index]),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 40),
                      side: const BorderSide(color: AppColors.borderSubtle),
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
                    ),
                    icon: const Icon(Icons.auto_awesome, size: 13),
                    label: Text(_suggestions[index], style: AppTextStyles.label),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.s2),
              Padding(
                padding: const EdgeInsets.fromLTRB(
                    AppPadding.lg, 0, AppPadding.lg, AppSpacing.s2),
                child: _composerBar(),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _bubble(int index) {
    final message = _messages[index];
    final previous = index > 0 ? _messages[index - 1] : null;
    final next = index < _messages.length - 1 ? _messages[index + 1] : null;

    // A run is consecutive messages from the same sender inside two minutes:
    // only its first bubble gets the avatar, only its last gets the timestamp.
    final startsRun = previous == null ||
        previous.fromAurelia != message.fromAurelia ||
        message.at.difference(previous.at).inSeconds > 120;
    final endsRun = next == null ||
        next.fromAurelia != message.fromAurelia ||
        next.at.difference(message.at).inSeconds > 120;

    if (message.fromAurelia) {
      return Padding(
        padding: EdgeInsets.only(top: startsRun ? AppSpacing.s3 : 2, right: AppSpacing.s10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 24,
              child: startsRun ? const AureliaLogo(iconSize: 24, markOnly: true) : null,
            ),
            const SizedBox(width: AppSpacing.s2),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (startsRun) Text('Aurelia', style: AppTextStyles.caption),
                  Text(message.text,
                      style: AppTextStyles.bodySm.copyWith(color: AppColors.textPrimary)),
                  if (endsRun)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(_clock(message.at), style: AppTextStyles.caption),
                    ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    return Padding(
      padding: EdgeInsets.only(top: startsRun ? AppSpacing.s3 : 2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (message.voiceDuration != null)
            VoiceMessage(duration: message.voiceDuration!, transcript: message.text)
          else
            Container(
              constraints: const BoxConstraints(maxWidth: 283),
              padding: const EdgeInsets.symmetric(
                  horizontal: 17, vertical: AppSpacing.s2 + 2),
              decoration: BoxDecoration(
                color: AppColors.brandDefault,
                borderRadius: BorderRadius.circular(AppRadius.xl),
              ),
              child: Text(message.text,
                  style: AppTextStyles.bodySm.copyWith(color: AppColors.textStrong)),
            ),
          if (endsRun)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(_clock(message.at), style: AppTextStyles.caption),
                  if (message.status != null) ...[
                    const SizedBox(width: 4),
                    _StatusTicks(status: message.status!),
                  ],
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _typingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.s3),
      child: Row(
        children: [
          const SizedBox(width: 24, child: AureliaLogo(iconSize: 24, markOnly: true)),
          const SizedBox(width: AppSpacing.s2),
          Container(
            padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.s3, vertical: AppSpacing.s2),
            decoration: BoxDecoration(
              color: AppColors.backgroundElevated,
              borderRadius: BorderRadius.circular(AppRadius.xl),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const _TypingDots(),
                const SizedBox(width: AppSpacing.s2),
                Text('Aurelia is typing', style: AppTextStyles.caption),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _composerBar() {
    return Container(
      height: 59,
      padding: const EdgeInsets.fromLTRB(19, 0, AppSpacing.s3, 0),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: AppColors.borderSubtle),
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      child: Row(
        children: [
          const Icon(Icons.add, size: 16, color: AppColors.iconStrong),
          const SizedBox(width: AppSpacing.s3),
          Expanded(
            child: TextField(
              controller: _composer,
              textInputAction: TextInputAction.send,
              onSubmitted: (value) {
                if (value.trim().isEmpty) return;
                _send(text: value.trim());
                _composer.clear();
              },
              style: AppTextStyles.bodyLg,
              decoration: InputDecoration(
                hintText: 'Type here',
                hintStyle: AppTextStyles.bodyMd,
                isDense: true,
                filled: false,
                contentPadding: EdgeInsets.zero,
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
              ),
            ),
          ),
          IconButton(
            onPressed: () => setState(() => _listening = true),
            tooltip: 'Voice input',
            icon: Container(
              width: 35,
              height: 35,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.iconStrong, width: 1.5),
              ),
              child: const Icon(Icons.graphic_eq, size: 16, color: AppColors.iconStrong),
            ),
          ),
          IconButton(
            onPressed: () {
              if (_composer.text.trim().isEmpty) return;
              _send(text: _composer.text.trim());
              _composer.clear();
            },
            tooltip: 'Send',
            icon: Container(
              width: 35,
              height: 35,
              decoration: const BoxDecoration(
                color: AppColors.iconStrong,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.arrow_upward, size: 19, color: AppColors.iconInverse),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusTicks extends StatelessWidget {
  const _StatusTicks({required this.status});

  final DeliveryStatus status;

  @override
  Widget build(BuildContext context) {
    switch (status) {
      case DeliveryStatus.sending:
        return Text('Sending…', style: AppTextStyles.caption);
      case DeliveryStatus.sent:
        return const Icon(Icons.check, size: 13, color: AppColors.textSecondary);
      case DeliveryStatus.read:
        return const Icon(Icons.done_all, size: 13, color: AppColors.textBrand);
    }
  }
}

/// Three dots, the universal "still typing" tell.
class _TypingDots extends StatefulWidget {
  const _TypingDots();

  @override
  State<_TypingDots> createState() => _TypingDotsState();
}

class _TypingDotsState extends State<_TypingDots> with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
  )..repeat();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (var i = 0; i < 3; i++)
              Container(
                width: 6,
                height: 6,
                margin: const EdgeInsets.symmetric(horizontal: 1.5),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.textSecondary.withValues(
                    alpha: 0.35 +
                        0.65 * (((_controller.value + i / 3) % 1) < 0.5 ? 1 : 0),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}
