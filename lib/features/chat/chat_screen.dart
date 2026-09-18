import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/audio/playback_controller.dart';
import '../../core/data/people.dart';
import '../../core/audio/voice_capture.dart';
import '../../core/data/recommendations.dart';
import '../../core/data/sessions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/widgets/aurelia_logo.dart';
import '../player/player_screen.dart';
import '../progress/progress_screen.dart';
import '../shell/app_drawer.dart';
import 'chat_session_controller.dart';
import '../upgrade/upgrade_screen.dart';
import 'widgets/attached_session.dart';
import 'widgets/empty_thread.dart';
import 'widgets/free_limit_notice.dart';
import 'widgets/mini_player.dart';
import 'widgets/recommendation_card.dart';
import 'widgets/recommendation_deck.dart';
import 'widgets/voice_message.dart';
import 'widgets/voice_recorder.dart';

/// The cockpit. Reads like a messaging app: runs grouped by sender and time,
/// one avatar and one timestamp per run, delivery ticks, a typing indicator,
/// and voice that produces a real message instead of ending silently.
///
/// The thread itself is not here — it lives in [ChatSessionController], above
/// the navigator, so a session being built survives going off to play it. This
/// screen draws that state and sends events into it; everything it holds of
/// its own is about the screen (scroll position, the composer, whether the
/// recorder is open).
class ChatScreen extends StatefulWidget {
  const ChatScreen({
    super.key,
    this.brief,
    this.startVoice = false,
    this.ask,
    this.slug,
    this.fresh = false,
    this.voiceCapture,
  });

  final RecreateBrief? brief;
  final bool startVoice;

  /// What the visitor typed on Home before they were sent here.
  final String? ask;

  /// An existing session this thread is about. Null is a new one.
  final String? slug;

  /// Start from an empty thread — what "New session" means.
  final bool fresh;

  /// The microphone the recorder opens. Null is the device's; the tests pass
  /// a silent one, because a test binding has no platform channels.
  final VoiceCapture? voiceCapture;

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  static const _suggestions = ['Add more white noise', 'Make it longer', 'Female voice'];

  /// Openers for a session with nothing in it yet — the hardest part of a
  /// blank chat is the first sentence, so the screen offers a few.
  static const _openers = [
    'Good morning, how did I sleep?',
    'Create a meditation for tonight',
    'Something for a restless afternoon',
  ];

  /// Sends the free plan allows in one thread before it pauses.
  static const _freeSends = 3;

  /// How long until the allowance comes back.
  static const _freeResetMinutes = 30;

  /// When the allowance comes back, fixed at the moment the limit trips.
  ///
  /// Recomputed on every build it would tick forward as you looked at it,
  /// which reads as the product moving the goalposts.
  String? _resetAt;

  final _scrollController = ScrollController();
  final _composer = TextEditingController();
  late bool _listening = widget.startVoice;

  ChatSessionController? _chat;
  int _lastMessageCount = 0;

  @override
  void initState() {
    super.initState();
    // Seeding runs after the first frame because it reaches the controller
    // through the scope. Both seeds are idempotent, so arriving back here from
    // the player does not replay the opening.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final chat = ChatSessionScope.read(context);
      // Before everything else: the controller outlives this screen, so
      // without it "New session" would reopen the session you last had here.
      if (widget.fresh) chat.reset();
      // Before the seeds: a session's own opening replaces the thread, so a
      // brief or an ask seeded first would be wiped by it.
      final session = findSession(widget.slug);
      if (session != null) chat.openSession(session);
      chat.seedAsk(widget.ask);
      chat.seedBrief(widget.brief);
      _scrollToEnd();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // The thread grows while this screen is not looking — a reply lands on a
    // timer the controller owns — so the scroll follows the message count
    // rather than the send that caused it.
    final chat = ChatSessionScope.of(context);
    if (!identical(chat, _chat)) {
      _chat?.removeListener(_followThread);
      _chat = chat..addListener(_followThread);
      _lastMessageCount = chat.messages.length;
    }
  }

  @override
  void dispose() {
    _chat?.removeListener(_followThread);
    _scrollController.dispose();
    _composer.dispose();
    super.dispose();
  }

  void _followThread() {
    final chat = _chat;
    if (chat == null) return;
    if (chat.messages.length == _lastMessageCount) return;
    _lastMessageCount = chat.messages.length;
    _scrollToEnd();
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

  /// Publishing is a bottom sheet, not a page: the session is still on screen
  /// behind it, and the sheet swaps its spinner for a tick in place.
  void _publish() {
    final chat = ChatSessionScope.read(context);
    var state = _PublishState.publishing;
    late StateSetter refresh;
    final timer = Timer(const Duration(milliseconds: 2200), () {
      // The record, not just the sheet. Pressing Publish used to move a sheet
      // and nothing else: Social Impact stayed empty for good and the Sessions
      // list went on calling a published session "Not Published".
      chat.markPublished();
      state = _PublishState.published;
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
            state: state,
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

  /// Taking it back down says so, in the same place publishing did.
  ///
  /// Unpublishing is the one action here with no visible consequence on this
  /// screen — the thread does not change, the card does not change — so
  /// without a word for it you cannot tell whether it worked.
  void _unpublish() {
    ChatSessionScope.read(context).markUnpublished();
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: AppColors.iconStrong.withValues(alpha: 0.4),
      builder: (sheetContext) => _PublishSheet(
        state: _PublishState.unpublished,
        onCancel: () => Navigator.of(sheetContext).pop(),
        onView: () => Navigator.of(sheetContext).pop(),
      ),
    );
  }

  /// The session this cockpit is building. It has no catalogue entry of its
  /// own yet, so it plays against the one it was recreated from — and the
  /// entry point says the result is the user's own work, which is what keeps
  /// the player's byline honest.
  /// The transport plays the session the cockpit is about. It used to play one
  /// fixed session whichever thread was open, which nobody could see until
  /// rows started opening their own.
  void _playSession() {
    final open = ChatSessionScope.read(context).sessionSlug;
    Navigator.of(context).pushNamed(
      '/play',
      arguments: PlayRequest(
        slug: open ?? 'dolphins-frequency',
        origin: ProfileOrigin.own,
      ),
    );
  }

  /// Insights opens what this session has done since it was made. A thread
  /// with no session behind it has nothing to show, so the row is inert there
  /// rather than absent — the frame draws it either way.
  void _openProgress() {
    final open = ChatSessionScope.read(context).sessionSlug;
    if (open == null) return;
    Navigator.of(context)
        .pushNamed('/progress', arguments: ProgressRequest(slug: open));
  }

  String _clock(DateTime at) {
    final hour = at.hour % 12 == 0 ? 12 : at.hour % 12;
    final period = at.hour < 12 ? 'AM' : 'PM';
    return '$hour:${at.minute.toString().padLeft(2, '0')} $period';
  }

  @override
  Widget build(BuildContext context) {
    final chat = ChatSessionScope.of(context);
    final playback = PlaybackScope.of(context);
    final showApplyChip = chat.applied.isNotEmpty && chat.canApply;
    final empty = chat.messages.isEmpty;
    // Attachments do not count: a forked session arrives as a message the user
    // did not type, and charging them for it would be the app billing itself.
    final sends = chat.messages
        .where((m) => !m.fromAurelia && m.attachedSlug == null)
        .length;
    final limited = sends >= _freeSends;
    if (limited) {
      _resetAt ??= _clock(
          DateTime.now().add(const Duration(minutes: _freeResetMinutes)));
    } else {
      _resetAt = null;
    }

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
                  // Once a session is on the deck the card below carries the
                  // transport, so a second play glyph here would be two
                  // controls for one thing.
                  if (playback.track == null) ...[
                    CircleSurfaceButton(
                      icon: Icons.play_arrow_rounded,
                      tooltip: 'Play session',
                      size: 44,
                      onPressed: _playSession,
                    ),
                    const SizedBox(width: AppSpacing.s2),
                  ],
                  const CoinPill.ringed(),
                  const SizedBox(width: AppSpacing.s2),
                  _ChatMenuButton(
                    publishLabel: chat.publishLabel,
                    onPublish: _publish,
                    onUnpublish:
                        chat.publishedVersionId == null ? null : _unpublish,
                    onInsights: _openProgress,
                  ),
                ],
              ),
            ),

            // The running session, parked above the thread. It stays while you
            // carry on talking, which is what starting one is for.
            if (playback.track != null)
              const Padding(
                padding: EdgeInsets.fromLTRB(
                    AppPadding.page, 0, AppPadding.page, AppSpacing.s3),
                child: MiniPlayer(),
              ),

            Expanded(
              child: ListView(
                controller: _scrollController,
                padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                children: [
                  if (empty)
                    const EmptyThread(name: 'Adam')
                  else
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
                  for (var i = 0; i < chat.messages.length; i++) _bubble(chat, i),
                  // The recommendations belong in the thread, under the message
                  // that proposes them, and they go away once a rebuild is
                  // under way. Folded by default: three cards laid open take
                  // the screen the conversation is happening in.
                  if (chat.canApply) ...[
                    const SizedBox(height: AppSpacing.s3),
                    if (chat.deckOpen)
                      SizedBox(
                        height: 246,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          clipBehavior: Clip.none,
                          itemCount: kRecommendations.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 11),
                          itemBuilder: (context, index) => RecommendationCard(
                            recommendation: kRecommendations[index],
                            applied:
                                chat.applied.contains(kRecommendations[index].id),
                            onToggle: () => chat
                                .toggleRecommendation(kRecommendations[index].id),
                          ),
                        ),
                      )
                    else
                      // 32 = the avatar column plus its gap, so the deck lines
                      // up under the words that hand it over.
                      Padding(
                        padding: const EdgeInsets.only(left: 32),
                        child: RecommendationDeck(
                          recommendations: kRecommendations,
                          count: chat.applied.isEmpty
                              ? kRecommendations.length
                              : chat.applied.length,
                          onOpen: chat.openDeck,
                        ),
                      ),
                  ],
                  if (chat.session == SessionState.generating ||
                      chat.session == SessionState.ready) ...[
                    const SizedBox(height: AppSpacing.s3),
                    ValueListenableBuilder<int>(
                      valueListenable: chat.progress,
                      builder: (context, progress, _) => _SessionProgressCard(
                        title: chat.draft.title,
                        status: chat.session == SessionState.ready
                            ? 'Ready to play'
                            : 'Creating your new session..',
                        progress:
                            chat.session == SessionState.ready ? null : progress,
                        onPlay: chat.session == SessionState.ready
                            ? _playSession
                            : null,
                      ),
                    ),
                  ],
                  if (chat.typing) _typingIndicator(),
                  const SizedBox(height: AppSpacing.s4),
                ],
              ),
            ),
            if (_listening)
              VoiceRecorder(
                capture: widget.voiceCapture,
                onSend: (transcript, duration, path) {
                  setState(() => _listening = false);
                  chat.send(
                      text: transcript,
                      voiceDuration: duration,
                      voicePath: path);
                },
                onCancel: () => setState(() => _listening = false),
              )
            else ...[
              if (limited)
                Padding(
                  padding: const EdgeInsets.fromLTRB(
                      AppPadding.page, 0, AppPadding.page, AppSpacing.s3),
                  child: FreeLimitNotice(
                    resetAt: _resetAt!,
                    onNewSession: () {
                      chat.reset();
                      setState(() => _resetAt = null);
                    },
                    onUpgrade: () => Navigator.of(context).push(
                      MaterialPageRoute<void>(
                          builder: (_) => const UpgradeScreen()),
                    ),
                  ),
                ),
              if (empty && !limited)
                SizedBox(
                  height: 44,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(
                        horizontal: AppPadding.page),
                    itemCount: _openers.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(width: AppSpacing.s2),
                    itemBuilder: (context, index) => OutlinedButton(
                      onPressed: () => chat.send(text: _openers[index]),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(0, 44),
                        side: const BorderSide(color: AppColors.borderSubtle),
                        foregroundColor: AppColors.textPrimary,
                        padding: const EdgeInsets.symmetric(
                            horizontal: AppPadding.page),
                      ),
                      child: Text(_openers[index], style: AppTextStyles.bodySm),
                    ),
                  ),
                )
              else if (!limited)
              SizedBox(
                height: 40,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: AppPadding.page),
                  // The apply chip leads the rail whenever something is
                  // waiting to be applied, then steps out of the way.
                  itemCount: _suggestions.length + (showApplyChip ? 1 : 0),
                  separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.s2),
                  itemBuilder: (context, index) {
                    if (showApplyChip && index == 0) {
                      final updating = chat.session == SessionState.updating;
                      return OutlinedButton.icon(
                        onPressed: updating ? null : chat.applyChanges,
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
                              : 'Apply new changes (${chat.applied.length})',
                          style: AppTextStyles.label,
                        ),
                      );
                    }
                    final suggestion =
                        _suggestions[index - (showApplyChip ? 1 : 0)];
                    return OutlinedButton.icon(
                      onPressed: () => chat.send(text: suggestion),
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
                child: _composerBar(chat),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _bubble(ChatSessionController chat, int index) {
    final message = chat.messages[index];
    final previous = index > 0 ? chat.messages[index - 1] : null;
    final next =
        index < chat.messages.length - 1 ? chat.messages[index + 1] : null;

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
                  // Questions handed back instead of an answer, each one a
                  // tap. Being stuck should cost a tap rather than a sentence.
                  if (message.prompts != null)
                    Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.s2),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          for (final prompt in message.prompts!)
                            Padding(
                              padding: const EdgeInsets.only(bottom: AppSpacing.s2),
                              child: _PromptCard(
                                prompt: prompt,
                                onTap: () => chat.send(text: prompt),
                              ),
                            ),
                        ],
                      ),
                    ),
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
            VoiceMessage(
                duration: message.voiceDuration!,
                transcript: message.text,
                path: message.voicePath)
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
          // Under the message that carries it, not at the end of the thread,
          // so everything said afterwards comes after it.
          if (message.attachedSlug != null)
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.s2),
              child: AttachedSession(slug: message.attachedSlug!),
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

  Widget _composerBar(ChatSessionController chat) {
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
                chat.send(text: value.trim());
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
              chat.send(text: _composer.text.trim());
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
/// 140x175). Settings is inert until that screen ships.
class _ChatMenuButton extends StatelessWidget {
  const _ChatMenuButton({
    required this.publishLabel,
    required this.onPublish,
    required this.onUnpublish,
    required this.onInsights,
  });

  /// "Publish", "Republish", or null when what is live is already what you
  /// are looking at — a button that would do nothing is worse than no button.
  final String? publishLabel;
  final VoidCallback onPublish;

  /// Null until something is live. There is nothing to take down otherwise.
  final VoidCallback? onUnpublish;
  final VoidCallback onInsights;

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
        if (item == 'Insights') return onInsights();
        if (item == 'Unpublish') return onUnpublish?.call();
        if (item == 'Publish' || item == 'Republish') return onPublish();
        // Settings is inert until that screen ships — and falling through to
        // Publish rather than doing nothing would be the worse failure.
      },
      itemBuilder: (context) => [
        for (final item in [
          'Insights',
          'Settings',
          if (publishLabel != null) publishLabel!,
          if (onUnpublish != null) 'Unpublish',
        ])
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

enum _PublishState { publishing, published, unpublished }

/// Figma "Section" 402x292 — the publishing / published / unpublished sheet.
class _PublishSheet extends StatelessWidget {
  const _PublishSheet({
    required this.state,
    required this.onCancel,
    required this.onView,
  });

  final _PublishState state;
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
          if (state == _PublishState.published)
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
          // Neutral, not the brand's warm disc: taking a session down is a
          // reversal, not a failure and not an achievement.
          else if (state == _PublishState.unpublished)
            Container(
              width: 64,
              height: 64,
              alignment: Alignment.center,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.backgroundElevated,
              ),
              child: const Icon(Icons.cancel_outlined,
                  size: 32, color: AppColors.iconStrong),
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
            switch (state) {
              _PublishState.published => 'Session Published!',
              _PublishState.unpublished => 'Session Unpublished',
              _PublishState.publishing => 'Publishing your Session…',
            },
            textAlign: TextAlign.center,
            style: AppTextStyles.titleMd,
          ),
          const SizedBox(height: AppSpacing.s2),
          Text(
            switch (state) {
              _PublishState.published => 'Your session is now ready to view.',
              _PublishState.unpublished =>
                'It is out of the community feed and nobody new can play it. '
                    'Yours to publish again whenever you want.',
              _PublishState.publishing => 'Hang tight! This’ll only take a moment.',
            },
            textAlign: TextAlign.center,
            style: AppTextStyles.bodySm.copyWith(
              fontWeight: FontWeight.w300,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.s8),
          if (state == _PublishState.published)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onView,
                child: const Text('View Session'),
              ),
            )
          else if (state == _PublishState.unpublished)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onView,
                child: const Text('Done'),
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

/// Figma "Frame 10" inside the generating state — a 70px pill carrying the
/// session being rebuilt, its status, and the percentage while it climbs.
class _SessionProgressCard extends StatelessWidget {
  const _SessionProgressCard({
    required this.title,
    required this.status,
    required this.progress,
    this.onPlay,
  });

  final String title;
  final String status;
  final int? progress;

  /// Set once the rebuild is finished. Until then the disc is a thumbnail,
  /// not a control — "Ready to play" is the moment it becomes one.
  final VoidCallback? onPlay;

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
          Tooltip(
            message: onPlay == null ? '' : 'Play $title',
            child: InkWell(
              onTap: onPlay,
              customBorder: const CircleBorder(),
              child: SizedBox(
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

/// One of the questions Aurelia offers when you say you do not know.
///
/// Full width and stacked rather than a chip row: they are sentences, and a
/// horizontal scroller would hide the ones you have not read.
class _PromptCard extends StatelessWidget {
  const _PromptCard({required this.prompt, required this.onTap});

  final String prompt;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: AppPadding.md, vertical: 14),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.borderSubtle),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(prompt,
              style: const TextStyle(
                  fontSize: 14, height: 20 / 14, color: AppColors.textPrimary)),
        ),
      ),
    );
  }
}
