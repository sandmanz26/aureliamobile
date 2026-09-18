/// The credit ledger — Figma "Profile/Credits" (16658:29260).
///
/// Credits are the app's own currency: earned by inviting someone, spent on
/// things the product has not built yet. The balance is shown on ten screens
/// and this is the only place that says where it came from.
library;

/// The referral link the Invite card offers. The frame's own copy.
const kInviteLink = 'https://www.aurellia.ai/inviteafriend';

/// What both sides get when an invite is taken up.
const kInviteReward = 500;

const kTotalCredits = '1,323';

class CreditEntry {
  const CreditEntry({
    required this.id,
    required this.who,
    required this.what,
    required this.age,
    required this.amount,
  });

  final String id;

  /// Underlined in the frame — the person is the subject of the sentence.
  final String who;

  /// What they did, as it reads after the name.
  final String what;

  /// Compact age, matching the notification feed's own format.
  final String age;
  final int amount;
}

const kCreditHistory = <CreditEntry>[
  CreditEntry(id: 'c1', who: 'Aria Moon', what: 'registered using your referral link!', age: '1s', amount: 500),
  CreditEntry(id: 'c2', who: 'Maya Rivers', what: 'registered using your referral link!', age: '2m', amount: 500),
  CreditEntry(id: 'c3', who: 'Theo Waves', what: 'registered using your referral link!', age: '2m', amount: 500),
  CreditEntry(id: 'c4', who: 'Jonas Weber', what: 'registered using your referral link!', age: '2m', amount: 500),
  CreditEntry(id: 'c5', who: 'Daniel Kim', what: 'registered using your referral link!', age: '2m', amount: 500),
];
