import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/data/recommendations.dart';
import '../../core/data/replies.dart';
import '../../core/data/sessions.dart';

/// Delivery state, as a messaging app shows it: one tick sent, two ticks read.
enum DeliveryStatus { sending, sent, read }

/// Where a session is in its rebuild — the cards below only make sense while
/// nothing is being generated, and the progress card only while it is.
enum SessionState { idle, updating, generating, ready }

class ChatMessage {
  ChatMessage({
    required this.id,
    required this.fromAurelia,
    required this.text,
    required this.at,
    this.voiceDuration,
    this.voicePath,
    this.attachedSlug,
    this.prompts,
    this.status,
  });

  final int id;
  final bool fromAurelia;
  final String text;
  final DateTime at;

  /// Set when the message is a voice note rather than typed text.
  final Duration? voiceDuration;

  /// Where that note's audio is on disk. Empty when the capture produced no
  /// file — a simulator with no mic, or the silent capture the tests use — in
  /// which case the bubble draws and scrubs but stays quiet.
  final String? voicePath;

  /// Questions offered under this message, each one tappable — for the case
  /// where the user has said they have nothing to say. See [Reply.prompts].
  final List<String>? prompts;

  /// A session shown under this message. Set by a Recreate hand-off, which
  /// used to arrive as a sentence — it named the session but did not show it,
  /// and gave you no way to hear the thing you were about to change.
  final String? attachedSlug;

  DeliveryStatus? status;
}

/// A brief handed over when a session is forked.
class RecreateBrief {
  const RecreateBrief({
    required this.slug,
    required this.title,
    required this.author,
    required this.minutes,
    required this.changes,
  });

  /// The session being forked. Carried so the thread can attach it rather
  /// than only naming it — you can see what you are about to change, and
  /// hear it, without leaving the conversation.
  final String slug;
  final String title;
  final String author;
  final int minutes;

  /// What should be different. Empty means the brief was never stated.
  final List<String> changes;
}

/// What a route can hand the cockpit on arrival.
class ChatArgs {
  const ChatArgs({
    this.brief,
    this.startVoice = false,
    this.ask,
    this.slug,
    this.fresh = false,
  });

  final RecreateBrief? brief;

  /// Opens the recorder immediately — set by Home's mic.
  final bool startVoice;

  /// What the visitor typed on Home before they were sent here.
  final String? ask;

  /// An existing session to open the thread on. Null is a new one.
  final String? slug;

  /// Clear the thread first — what "New session" means. Without it the
  /// cockpit would reopen on whatever session you last had in it, because the
  /// controller outlives the screen on purpose.
  final bool fresh;
}

/// The cockpit thread, held above the navigator — the mobile mirror of the web
/// app's `ChatSessionContext`.
///
/// A session being built is not screen state. Generating one, applying changes
/// and then going off to play it are three steps of the same task, and for a
/// while the second was thrown away by the third: the chat screen was popped
/// on navigation, its `State` went with it, and coming back handed the user a
/// fresh conversation with nothing to publish.
///
/// The timers live here too, not on the screen. A generation that stops
/// because someone opened the player is the same bug wearing a different hat.
///
/// In memory rather than storage, which matches how the rest of the app treats
/// a visit: it survives moving around the product, and a relaunch starts over.
/// When there is a backend this is what a draft session persists into.
class ChatSessionController extends ChangeNotifier {
  ChatSessionController() {
    _seedOpening();
  }

  final messages = <ChatMessage>[];

  /// Every recommendation starts applied — Aurelia proposed them, and the
  /// user's job is to take away what they do not want, not to opt in to each.
  final applied = kRecommendations.map((r) => r.id).toSet();

  /// The rebuild rate here is 22 a second. Held in a notifier rather than on
  /// the controller so only the progress card listens: notifying everything
  /// would rebuild every message, the deck and the composer for a number two
  /// digits wide.
  final progress = ValueNotifier<int>(0);

  SessionState _session = SessionState.idle;
  bool _typing = false;
  bool _deckOpen = false;
  int _nextId = 1;

  /// Which session the thread is about. Null is a new one.
  String? _sessionSlug;

  /// Seeds already taken, so re-entering the cockpit does not say the same
  /// opening line twice.
  final _seeded = <String>{};

  final _timers = <Timer>[];
  bool _disposed = false;

  SessionState get session => _session;
  bool get typing => _typing;
  bool get deckOpen => _deckOpen;
  String? get sessionSlug => _sessionSlug;

  /// True while the set can still be changed and applied.
  bool get canApply =>
      _session == SessionState.idle || _session == SessionState.updating;

  void openDeck() {
    if (_deckOpen || !canApply) return;
    _deckOpen = true;
    notifyListeners();
  }

  void toggleRecommendation(String id) {
    applied.contains(id) ? applied.remove(id) : applied.add(id);
    notifyListeners();
  }

  void _seedOpening() {
    // The thread opens mid-conversation, so the first messages are backdated.
    final start = DateTime.now().subtract(const Duration(minutes: 9));
    messages.addAll([
      ChatMessage(
        id: _nextId++,
        fromAurelia: true,
        at: start,
        text: 'Good morning, Adam.\n\nLooks like you had a good sleep last night, '
            'score improved by 7% due to increased REM sleep.',
      ),
      ChatMessage(
        id: _nextId++,
        fromAurelia: true,
        at: start.add(const Duration(seconds: 4)),
        text: 'How did you find the sleep meditation we created?',
      ),
      ChatMessage(
        id: _nextId++,
        fromAurelia: false,
        at: start.add(const Duration(seconds: 96)),
        text: 'It was good, but it was to short, I had to repeat it multiple times.',
        status: DeliveryStatus.read,
      ),
      ChatMessage(
        id: _nextId++,
        fromAurelia: true,
        at: start.add(const Duration(seconds: 104)),
        text: 'Based on the diagnosis and your feedback, this is what I’d '
            'would recommend:',
      ),
    ]);
  }

  /// The opening exchange for a session that already exists, rather than the
  /// one Aurelia says when there is nothing yet.
  ///
  /// Only Aurelia's lines carry the session; the rest of the exchange is the
  /// demo's own texture and stays put.
  List<ChatMessage> _messagesForSession(SessionRecord session) {
    final start = DateTime.now().subtract(const Duration(minutes: 9));
    final draft = !session.published;
    final outcome = session.outcome.isEmpty ? null : session.outcome.first;

    final opening = draft
        ? 'Good morning, Adam.\n\n“${session.title}” is built — '
            '${session.totalMinutes} minutes, ${session.layers.length} layers — '
            'and still yours only. Nobody has played it, so there is nothing to '
            'report back yet.'
        : 'Good morning, Adam.\n\n“${session.title}” is built and running — '
            '${session.totalMinutes} minutes, by ${session.author}'
            '${outcome == null ? '.' : ', and people report ${outcome.label.toLowerCase()} ${outcome.value}.'}';

    var id = 1;
    return [
      ChatMessage(id: id++, fromAurelia: true, at: start, text: opening),
      ChatMessage(
        id: id++,
        fromAurelia: true,
        at: start.add(const Duration(seconds: 4)),
        text: draft
            ? 'Anything you want to change before it goes out?'
            : 'How did you find ${session.title}?',
      ),
      ChatMessage(
        id: id++,
        fromAurelia: false,
        at: start.add(const Duration(seconds: 96)),
        status: DeliveryStatus.read,
        text: draft
            ? 'The ending is still too bright. Everything before it is right.'
            : 'It was good, but it was to short, I had to repeat it multiple times.',
      ),
      ChatMessage(
        id: id++,
        fromAurelia: true,
        at: start.add(const Duration(seconds: 104)),
        text: 'Based on the diagnosis and your feedback, this is what I’d '
            'would recommend:',
      ),
    ];
  }

  /// Opens an existing session's conversation, already made.
  ///
  /// Opening the session you are already in is a no-op, and that is the whole
  /// point: you go off to play it, or to its creator's profile, and coming
  /// back returns the thread exactly as you left it rather than rebuilding it
  /// under you. Same bargain as `load()` on the playback controller.
  void openSession(SessionRecord session) {
    if (_sessionSlug == session.slug) return;
    for (final timer in _timers) {
      timer.cancel();
    }
    _timers.clear();
    _sessionSlug = session.slug;
    final opening = _messagesForSession(session);
    messages
      ..clear()
      ..addAll(opening);
    applied
      ..clear()
      ..addAll(kRecommendations.map((r) => r.id));
    _session = SessionState.idle;
    _typing = false;
    // Laid open, not folded. A folded deck is Aurelia handing over a proposal;
    // this session exists, so its changes are what you came to look at.
    _deckOpen = true;
    _seeded.clear();
    _nextId = opening.length + 1;
    progress.value = 0;
    notifyListeners();
  }

  /// What was typed on Home arrives as the first thing said here, so the
  /// visitor does not have to write it again — including after a detour
  /// through sign-in. Seeded once: coming back from the player must not
  /// re-ask the question.
  void seedAsk(String? ask) {
    final text = ask?.trim();
    if (text == null || text.isEmpty || !_seeded.add('ask:$text')) return;
    messages.add(ChatMessage(
      id: _nextId++,
      fromAurelia: false,
      at: DateTime.now(),
      status: DeliveryStatus.read,
      text: text,
    ));
    _typing = true;
    notifyListeners();
    _after(const Duration(milliseconds: 1400), () {
      _typing = false;
      _say('Good place to start. Give me a moment and I’ll shape '
          'something around that.');
    });
  }

  /// A hand-off from Recreate opens the thread with the fork already stated,
  /// so the user lands mid-conversation rather than at a blank prompt.
  void seedBrief(RecreateBrief? brief) {
    if (brief == null || !_seeded.add('brief:${brief.title}/${brief.author}')) {
      return;
    }
    // With the Recreate form skipped, nothing has been asked for yet — so the
    // opening line states the fork and stops. "Keep it as it is" belongs to
    // someone who went through the form and changed nothing; putting those
    // words in the mouth of someone who never saw it is the app answering its
    // own question.
    final stated = brief.changes.isNotEmpty;
    messages.add(ChatMessage(
      id: _nextId++,
      fromAurelia: false,
      at: DateTime.now(),
      status: DeliveryStatus.read,
      attachedSlug: brief.slug,
      text: stated
          ? 'Recreate “${brief.title}” by ${brief.author}, '
              'at ${brief.minutes} minutes.\n'
              '${brief.changes.map((line) => '• $line').join('\n')}'
          : 'Recreate “${brief.title}” by ${brief.author}.',
    ));
    _typing = true;
    notifyListeners();
    _after(const Duration(milliseconds: 1600), () {
      _typing = false;
      // The question the Recreate screen used to ask in a heading, asked here
      // instead — it is the one thing that screen was for, and it survives it.
      _say(stated
          ? 'Got it — forking ${brief.author}’s session and keeping them '
              'credited in the lineage. Tell me anything else you want changed '
              'and I’ll build your version.'
          : 'Got it — forking ${brief.author}’s session, and they stay '
              'credited in the lineage. Tell me what should be different; '
              'anything you leave alone stays as ${brief.author} made it.');
    });
  }

  /// Sends, then walks the message through sending → sent → read and brings
  /// back a reply — the rhythm a chat app has, rather than a bubble that just
  /// appears.
  void send({required String text, Duration? voiceDuration, String? voicePath}) {
    final id = _nextId++;
    messages.add(ChatMessage(
      id: id,
      fromAurelia: false,
      text: text,
      at: DateTime.now(),
      voiceDuration: voiceDuration,
      voicePath: voicePath,
      status: DeliveryStatus.sending,
    ));
    notifyListeners();

    void setStatus(DeliveryStatus status) {
      for (final message in messages) {
        if (message.id == id) message.status = status;
      }
      notifyListeners();
    }

    _after(const Duration(milliseconds: 400), () => setStatus(DeliveryStatus.sent));
    _after(const Duration(milliseconds: 900), () {
      setStatus(DeliveryStatus.read);
      _typing = true;
      notifyListeners();
    });
    _after(const Duration(milliseconds: 2400), () {
      _typing = false;
      // Aurelia answers what was said. Every message used to get the same
      // sentence, whatever it was — which is the thing that makes a demo feel
      // like one: the screen is clearly not reading you, so you stop writing
      // anything real into it.
      final reply = replyTo(text);
      // The deck comes over once, with the first reply that is a proposal —
      // and never under a set of questions, which are the alternative to
      // handing anything over.
      final hands = reply.prompts == null && reply.proposes && canApply;
      _say(
        hands ? '${reply.text}\n\nHere is what I would put in it:' : reply.text,
        prompts: reply.prompts,
      );
      if (hands) _deckOpen = true;
      notifyListeners();
    });
  }

  /// Applying is not instant and does not pretend to be: a beat of
  /// "Updating..", then Aurelia says something, then the percentage climbs on
  /// its own card.
  void applyChanges() {
    if (applied.isEmpty || _session == SessionState.updating) return;
    _session = SessionState.updating;
    notifyListeners();

    _after(const Duration(milliseconds: 1400), () {
      progress.value = 0;
      _session = SessionState.generating;
      _say('Sure, here it is:');

      _timers.add(Timer.periodic(const Duration(milliseconds: 45), (timer) {
        if (_disposed) return timer.cancel();
        if (progress.value >= 100) {
          timer.cancel();
          // Only the last tick notifies; the rest ride the ValueNotifier.
          _session = SessionState.ready;
          notifyListeners();
        } else {
          progress.value++;
        }
      }));
    });
  }

  /// Back to a thread with nothing in it — what "New session" means.
  void reset() {
    for (final timer in _timers) {
      timer.cancel();
    }
    _timers.clear();
    messages.clear();
    applied
      ..clear()
      ..addAll(kRecommendations.map((r) => r.id));
    _session = SessionState.idle;
    _typing = false;
    _deckOpen = false;
    _sessionSlug = null;
    _seeded.clear();
    _nextId = 1;
    progress.value = 0;
    _seedOpening();
    notifyListeners();
  }

  void _say(String text, {List<String>? prompts}) {
    messages.add(ChatMessage(
      id: _nextId++,
      fromAurelia: true,
      at: DateTime.now(),
      text: text,
      prompts: prompts,
    ));
    notifyListeners();
  }

  /// Schedules work that must not fire after the controller is gone. It may
  /// fire while no chat screen is mounted — that is the point.
  void _after(Duration delay, VoidCallback action) {
    _timers.add(Timer(delay, () {
      if (!_disposed) action();
    }));
  }

  @override
  void dispose() {
    _disposed = true;
    for (final timer in _timers) {
      timer.cancel();
    }
    progress.dispose();
    super.dispose();
  }
}

class ChatSessionScope extends InheritedNotifier<ChatSessionController> {
  const ChatSessionScope({
    super.key,
    required ChatSessionController super.notifier,
    required super.child,
  });

  static ChatSessionController of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<ChatSessionScope>();
    assert(scope?.notifier != null, 'ChatSessionScope is missing above this widget');
    return scope!.notifier!;
  }

  /// The controller without subscribing — for a handler that calls into it and
  /// does not want to rebuild when it does.
  static ChatSessionController read(BuildContext context) {
    final scope = context.getInheritedWidgetOfExactType<ChatSessionScope>();
    assert(scope?.notifier != null, 'ChatSessionScope is missing above this widget');
    return scope!.notifier!;
  }
}
