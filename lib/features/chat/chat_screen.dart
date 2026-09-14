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
  const ChatArgs({this.brief, this.startVoice = false, this.ask});

  final RecreateBrief? brief;

  /// Opens the recorder immediately — set by Home's mic.
  final bool startVoice;

  /// What the visitor typed on Home before they were sent here.
  final String? ask;
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
  const ChatScreen({super.key, this.brief, this.startVoice = false, this.ask});

  final RecreateBrief? brief;
  final bool startVoice;

  /// What the visitor typed on Home before they were sent here.
  final String? ask;

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

/// Where a session is in its rebuild — the three cards below only make sense
/// while nothing is being generated, and the progress card only while it is.
enum SessionState { idle, updating, generating, ready }

/// One of the three adjustments Aurelia proposes after its diagnosis.
class _Recommendation {
  const _Recommendation({
    required this.id,
    required this.title,
    required this.description,
    required this.improveScore,
    required this.orb,
  });

  final String id;
  final String title;
  final String description;
  final String improveScore;
  final String orb;
}

const _recommendations = <_Recommendation>[
  _Recommendation(
    id: 'yellow',
    title: 'Increase Yellow',
    description: 'Helps bring joy, aligned with your goal',
    improveScore: '12%',
    orb: 'assets/images/orb-increase-yellow.png',
  ),
  _Recommendation(
    id: 'movement',
    title: 'Less movement',
    description: 'Reduced movement helps your nervous system to calm down',
    improveScore: '12%',
    orb: 'assets/images/orb-less-movement.png',
  ),
  _Recommendation(
    id: 'frequency',
    title: '432Hz',
    description: 'Your body responds positively to this frequency.',
    improveScore: '12%',
    orb: 'assets/images/orb-432hz.png',
  ),
];

class _ChatScreenState extends State<ChatScreen> {
  static const _suggestions = ['Add more white noise', 'Make it longer', 'Female voice'];

  /// Every recommendation starts applied — Aurelia proposed them, and the
  /// user's job is to take away what they do not want, not to opt in to each.
  final _applied = _recommendations.map((r) => r.id).toSet();
  SessionState _session = SessionState.idle;
  /// The rebuild rate here is 22 a second. Held in a notifier rather than in
  /// state so only the progress card listens: a setState would rebuild every
  /// message, the deck and the composer for a number two digits wide.
  final _progress = ValueNotifier<int>(0);

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

    // What was typed on Home arrives as the first thing said here, so the
    // visitor does not have to write it again — including after a detour
    // through sign-in.
    final ask = widget.ask?.trim();
    if (ask != null && ask.isNotEmpty) {
      _messages.add(_Message(
        id: _nextId++,
        fromAurelia: false,
        at: DateTime.now(),
        status: DeliveryStatus.read,
        text: ask,
      ));
      _typing = true;
      _after(const Duration(milliseconds: 1400), () {
        setState(() {
          _typing = false;
          _messages.add(_Message(
            id: _nextId++,
            fromAurelia: true,
            at: DateTime.now(),
            text: 'Good place to start. Give me a moment and I’ll shape '
                'something around that.',
          ));
        });
        _scrollToEnd();
      });
    }

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
    _progress.dispose();
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

  /// Publishing is a bottom sheet, not a page: the session is still on screen
  /// behind it, and the sheet swaps its spinner for a tick in place.
  void _publish() {
    var published = false;
    late StateSetter refresh;
    final timer = Timer(const Duration(milliseconds: 2200), () {
      published = true;
      refresh(() {});
    });

    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: AppColors.iconStrong.withValues(alpha: 0.4),
      isDismissible: false,
      enableDrag: false,
      builder: (sheetContext) => StatefulBuilder(
        builder: (context, setSheetState) {
          refresh = setSheetState;
          return _PublishSheet(
            published: published,
            onCancel: () => Navigator.of(sheetContext).pop(),
            onView: () {
              Navigator.of(sheetContext).pop();
              Navigator.of(context).pushNamedAndRemoveUntil(
                  '/home', (route) => route.isFirst);
            },
          );
        },
      ),
    ).whenComplete(timer.cancel);
  }

  bool get _showApplyChip =>
      _applied.isNotEmpty &&
      (_session == SessionState.idle || _session == SessionState.updating);

  void _toggleRecommendation(String id) {
    setState(() => _applied.contains(id) ? _applied.remove(id) : _applied.add(id));
  }

  /// Applying is not instant and does not pretend to be: a beat of "Updating..",
  /// then Aurelia says something, then the percentage climbs on its own card.
  void _applyChanges() {
    if (_applied.isEmpty || _session == SessionState.updating) return;
    setState(() => _session = SessionState.updating);
    _timers.add(Timer(const Duration(milliseconds: 1400), () {
      if (!mounted) return;
      _progress.value = 0;
      setState(() {
        _session = SessionState.generating;
        _messages.add(_Message(
          id: _nextId++,
          fromAurelia: true,
          at: DateTime.now(),
          text: 'Sure, here it is:',
        ));
      });
      _scrollToEnd();
      _timers.add(Timer.periodic(const Duration(milliseconds: 45), (timer) {
        if (!mounted) return timer.cancel();
        if (_progress.value >= 100) {
          timer.cancel();
          // Only the last tick touches the screen's own state.
          setState(() => _session = SessionState.ready);
        } else {
          _progress.value++;
        }
      }));
    }));
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
              padding: const EdgeInsets.symmetric(
                  horizontal: AppPadding.page, vertical: AppPadding.md),
              child: Row(
                children: [
                  Builder(
                    builder: (context) => CircleSurfaceButton(
                      icon: Icons.menu,
                      tooltip: 'Open menu',
                      size: 44,
                      onPressed: () => Scaffold.of(context).openDrawer(),
                    ),
                  ),
                  const Spacer(),
                  CircleSurfaceButton(
                    icon: Icons.play_arrow_rounded,
                    tooltip: 'Play session',
                    size: 44,
                    onPressed: () {},
                  ),
                  const SizedBox(width: AppSpacing.s2),
                  const CoinPill.ringed(),
                  const SizedBox(width: AppSpacing.s2),
                  _ChatMenuButton(onPublish: _publish),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                controller: _scrollController,
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
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
                  // The cards are the recommendation: they belong in the
                  // thread, under the message that proposes them, and they go
                  // away once a rebuild is under way.
                  if (_session == SessionState.idle ||
                      _session == SessionState.updating) ...[
                    const SizedBox(height: AppSpacing.s3),
                    SizedBox(
                      height: 245,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(
                            horizontal: AppPadding.page),
                        itemCount: _recommendations.length,
                        separatorBuilder: (_, __) =>
                            const SizedBox(width: 11),
                        itemBuilder: (context, index) => _RecommendationCard(
                          recommendation: _recommendations[index],
                          applied: _applied.contains(_recommendations[index].id),
                          onToggle: () =>
                              _toggleRecommendation(_recommendations[index].id),
                        ),
                      ),
                    ),
                  ],
                  if (_session == SessionState.generating ||
                      _session == SessionState.ready) ...[
                    const SizedBox(height: AppSpacing.s3),
                    ValueListenableBuilder<int>(
                      valueListenable: _progress,
                      builder: (context, progress, _) => _SessionProgressCard(
                        title: 'Sleep meditation v1.2',
                        status: _session == SessionState.ready
                            ? 'Ready to play'
                            : 'Creating your new session..',
                        progress:
                            _session == SessionState.ready ? null : progress,
                      ),
                    ),
                  ],
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
                  padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                  // The apply chip leads the rail whenever something is
                  // waiting to be applied, then steps out of the way.
                  itemCount: _suggestions.length + (_showApplyChip ? 1 : 0),
                  separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.s2),
                  itemBuilder: (context, index) {
                    if (_showApplyChip && index == 0) {
                      final updating = _session == SessionState.updating;
                      return OutlinedButton.icon(
                        onPressed: updating ? null : _applyChanges,
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(0, 40),
                          side: const BorderSide(color: AppColors.borderSubtle),
                          foregroundColor: AppColors.textStrong,
                          padding:
                              const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
                        ),
                        icon: const Icon(Icons.auto_awesome, size: 13),
                        label: Text(
                          updating
                              ? 'Updating..'
                              : 'Apply new changes (${_applied.length})',
                          style: AppTextStyles.label,
                        ),
                      );
                    }
                    final suggestion =
                        _suggestions[index - (_showApplyChip ? 1 : 0)];
                    return OutlinedButton.icon(
                      onPressed: () => _send(text: suggestion),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(0, 40),
                        side: const BorderSide(color: AppColors.borderSubtle),
                        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s4),
                      ),
                      icon: const Icon(Icons.auto_awesome, size: 13),
                      label: Text(suggestion, style: AppTextStyles.label),
                    );
                  },
                ),
              ),
              const SizedBox(height: AppSpacing.s2),
              Padding(
                padding: const EdgeInsets.fromLTRB(
                    AppPadding.page, 0, AppPadding.page, AppSpacing.s2),
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

/// The chat header's ⋯ button and its dropdown (Figma node "dropdown",
/// 140x175). Settings and Insights are inert until those screens ship.
class _ChatMenuButton extends StatelessWidget {
  const _ChatMenuButton({required this.onPublish});

  final VoidCallback onPublish;

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      tooltip: 'More options',
      offset: const Offset(0, 52),
      color: AppColors.surface,
      elevation: 8,
      padding: EdgeInsets.zero,
      constraints: const BoxConstraints.tightFor(width: 140),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.xl),
      ),
      onSelected: (item) {
        if (item == 'Publish') onPublish();
      },
      itemBuilder: (context) => [
        for (final item in ['Insights', 'Settings', 'Publish'])
          PopupMenuItem(
            value: item,
            height: 44,
            padding: const EdgeInsets.symmetric(horizontal: AppPadding.md),
            child: Text(item, style: AppTextStyles.bodySm),
          ),
      ],
      child: Container(
        width: 44,
        height: 44,
        alignment: Alignment.center,
        decoration: const BoxDecoration(
          color: AppColors.surface,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(color: Color(0x14000000), blurRadius: 8, offset: Offset(0, 2)),
          ],
        ),
        child: const Icon(Icons.more_horiz, size: 20, color: AppColors.iconStrong),
      ),
    );
  }
}

/// Figma "Section" 402x292 — the publishing / published bottom sheet.
class _PublishSheet extends StatelessWidget {
  const _PublishSheet({
    required this.published,
    required this.onCancel,
    required this.onView,
  });

  final bool published;
  final VoidCallback onCancel;
  final VoidCallback onView;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(
          AppPadding.page, AppSpacing.s10, AppPadding.page, AppSpacing.s6),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl2)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (published)
            Container(
              width: 64,
              height: 64,
              alignment: Alignment.center,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFFFF881B), Color(0xFFFFD242), Colors.white],
                ),
              ),
              child: const Icon(Icons.check_rounded,
                  size: 32, color: AppColors.textInverse),
            )
          else
            const SizedBox(
              width: 64,
              height: 64,
              child: CircularProgressIndicator(
                strokeWidth: 6,
                color: Color(0xFFFF881B),
                backgroundColor: Color(0x1AFF881B),
              ),
            ),
          const SizedBox(height: AppSpacing.s8),
          Text(
            published ? 'Session Published!' : 'Publishing your Session…',
            textAlign: TextAlign.center,
            style: AppTextStyles.titleMd,
          ),
          const SizedBox(height: AppSpacing.s2),
          Text(
            published
                ? 'Your session is now ready to view.'
                : 'Hang tight! This’ll only take a moment.',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodySm.copyWith(
              fontWeight: FontWeight.w300,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.s8),
          if (published)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onView,
                child: const Text('View Session'),
              ),
            )
          else
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: onCancel,
                child: const Text('Cancel'),
              ),
            ),
        ],
      ),
    );
  }
}

/// Figma "Frame 45/46/47" — 173x245, on a gradient hairline border, 16px
/// padding, 12px gap. The orb is a 73px circle with a play affordance
/// overlapping its lower right.
class _RecommendationCard extends StatelessWidget {
  const _RecommendationCard({
    required this.recommendation,
    required this.applied,
    required this.onToggle,
  });

  final _Recommendation recommendation;
  final bool applied;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 173,
      padding: const EdgeInsets.all(1),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        // A gradient hairline: the border is the gradient and the card paints
        // its own surface on top, which is what the web's double background
        // does with background-clip.
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFFFE682), Color(0xFFFF881B)],
        ),
      ),
      child: Container(
        padding: const EdgeInsets.all(AppPadding.md),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(19),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 77,
              height: 77,
              child: Stack(
                children: [
                  ClipOval(
                    child: Image.asset(
                      recommendation.orb,
                      width: 73,
                      height: 73,
                      fit: BoxFit.cover,
                    ),
                  ),
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Container(
                      width: 32,
                      height: 32,
                      alignment: Alignment.center,
                      decoration: const BoxDecoration(
                        color: AppColors.surface,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                              color: Color(0x14000000),
                              blurRadius: 8,
                              offset: Offset(0, 2)),
                        ],
                      ),
                      child: const Icon(Icons.play_arrow_rounded,
                          size: 16, color: AppColors.iconStrong),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.s3),
            Text(
              recommendation.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.bodySm.copyWith(color: AppColors.textPrimary),
            ),
            const SizedBox(height: 2),
            Expanded(
              child: Text(
                recommendation.description,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: AppTextStyles.caption.copyWith(color: AppColors.textPrimary),
              ),
            ),
            Row(
              children: [
                Flexible(
                  child: Text(
                    'Improve Score',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.caption
                        .copyWith(color: AppColors.textPrimary),
                  ),
                ),
                const SizedBox(width: AppSpacing.s2),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.s2, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFBED),
                    borderRadius: BorderRadius.circular(AppRadius.full),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.arrow_upward,
                          size: 12, color: AppPrimitives.success600),
                      Text(
                        recommendation.improveScore,
                        style: AppTextStyles.caption
                            .copyWith(color: AppColors.textPrimary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.s3),
            OutlinedButton.icon(
              onPressed: onToggle,
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(0, 36),
                side: const BorderSide(color: AppColors.borderSubtle),
                foregroundColor: AppColors.textPrimary,
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s3),
              ),
              icon: Icon(applied ? Icons.delete_outline : Icons.add,
                  size: 12, color: AppColors.iconDefault),
              label: Text(applied ? 'Remove' : 'Add', style: AppTextStyles.label),
            ),
          ],
        ),
      ),
    );
  }
}

/// Figma "Frame 10" inside the generating state — a 70px pill carrying the
/// session being rebuilt, its status, and the percentage while it climbs.
class _SessionProgressCard extends StatelessWidget {
  const _SessionProgressCard({
    required this.title,
    required this.status,
    required this.progress,
  });

  final String title;
  final String status;
  final int? progress;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppPadding.page),
      padding: const EdgeInsets.fromLTRB(14, AppSpacing.s3, 23, AppSpacing.s3),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 45,
            height: 45,
            child: Stack(
              alignment: Alignment.center,
              children: [
                ClipOval(
                  child: Image.asset('assets/images/session-thumb.png',
                      width: 45, height: 45, fit: BoxFit.cover),
                ),
                const Icon(Icons.play_arrow_rounded,
                    size: 22, color: AppColors.iconInverse),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.bodySm
                        .copyWith(color: AppColors.textPrimary)),
                Text(status,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.caption),
              ],
            ),
          ),
          if (progress != null)
            Text('$progress%', style: AppTextStyles.caption),
          const Icon(Icons.chevron_right, size: 19, color: AppColors.iconDefault),
        ],
      ),
    );
  }
}
