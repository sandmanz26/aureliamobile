import 'package:flutter/widgets.dart';
import '../../core/data/sessions.dart';
import '../chat/chat_session_controller.dart' show ChatArgs, RecreateBrief;

/// Whether Recreate stops at the form on its way to the conversation.
///
/// **Off, and the web's is off too.** The form's own footer made the case
/// against it — "Opens in chat so you can keep tuning it out loud." It is a
/// screen you fill in to reach a conversation that takes the same answers:
/// every control on it is a sentence Aurelia already understands, and the
/// summary at the bottom was literally the brief being handed over.
///
/// The screen stays in the tree rather than being deleted, because a slider is
/// a better instrument than a sentence for "how long" and that argument may
/// yet win. On the web the switch is a feature flag in the /__demo console;
/// there is no such console here, so it is this constant — turn it on, and
/// every entry point below goes back to the form at once.
const recreateFormEnabled = false;

/// A fork with nothing said about it yet.
///
/// The whole brief when the form is skipped and the conversation is where the
/// differences get stated.
RecreateBrief briefFor(SessionRecord session) => RecreateBrief(
      slug: session.slug,
      title: session.title,
      author: session.author,
      minutes: session.minutes,
      changes: const [],
    );

/// Where Recreate goes, from wherever it was pressed.
///
/// One function, five call sites: a Recreate that behaved differently
/// depending on which card you pressed would be worse than either answer.
void openRecreate(BuildContext context, SessionRecord session) {
  if (recreateFormEnabled) {
    Navigator.of(context).pushNamed('/recreate', arguments: session.slug);
    return;
  }
  Navigator.of(context)
      .pushNamed('/chat', arguments: ChatArgs(brief: briefFor(session)));
}
