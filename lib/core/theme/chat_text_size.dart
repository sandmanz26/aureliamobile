/// How large a message reads in the cockpit.
///
/// This started as a one-off experiment — bodySm swapped for bodyLg directly
/// in chat_screen.dart, to compare against ChatGPT/WhatsApp's reading size.
/// That answered "does 16px feel better than 14px" for one person testing it.
/// It does not answer it for everyone, so this replaces the hard swap with a
/// real control: three points already on [AppTextStyles]' own scale, chosen
/// from Settings, felt immediately in the thread.
library;

import 'package:flutter/material.dart';
import 'app_text_styles.dart';

enum ChatTextSize {
  small('Small', 14),
  medium('Medium', 16),
  large('Large', 18);

  const ChatTextSize(this.label, this.px);

  final String label;
  final int px;

  /// The style a bubble's `Text` builds from. Every case here is a style
  /// [AppTextStyles] already names for something else — nothing was invented
  /// for this control, the three names just point at three rungs already on
  /// the ladder.
  TextStyle get style => switch (this) {
        ChatTextSize.small => AppTextStyles.bodySm,
        ChatTextSize.medium => AppTextStyles.bodyLg,
        ChatTextSize.large => AppTextStyles.bodyLarge,
      };
}

/// Holds the chosen size for the life of the app. In memory only — like
/// everything else here except mute on web, a fresh launch starts back at the
/// shipped default, [ChatTextSize.small] (bodySm, the Figma value), not at
/// whatever was picked last time.
class ChatTextSizeController extends ChangeNotifier {
  ChatTextSize _size = ChatTextSize.small;

  ChatTextSize get size => _size;

  void setSize(ChatTextSize next) {
    if (_size == next) return;
    _size = next;
    notifyListeners();
  }
}

/// The mobile mirror of how AuthScope and PlaybackScope sit above the
/// navigator — one controller, read from wherever a bubble is built.
class ChatTextSizeScope extends InheritedNotifier<ChatTextSizeController> {
  const ChatTextSizeScope({
    super.key,
    required ChatTextSizeController super.notifier,
    required super.child,
  });

  static ChatTextSizeController of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<ChatTextSizeScope>();
    assert(scope?.notifier != null, 'ChatTextSizeScope is missing above this widget');
    return scope!.notifier!;
  }
}
