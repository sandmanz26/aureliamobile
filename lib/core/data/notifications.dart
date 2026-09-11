/// The notification feed — the mobile mirror of the web app's
/// `src/lib/notifications.ts`.
///
/// Every row is somebody doing something to a session of yours, so each carries
/// both the person and the session: the feed is the clearest place the
/// community loop is visible from.
library;

enum NotificationBucket { today, yesterday, week, month }

class NotificationRecord {
  const NotificationRecord({
    required this.id,
    required this.actor,
    required this.actorPhoto,
    required this.action,
    required this.age,
    required this.bucket,
    required this.sessionSlug,
    required this.sessionPhoto,
  });

  final String id;
  final String actor;
  final String actorPhoto;

  /// What they did, as it reads after the name.
  final String action;

  /// Compact age — "1s", "2m", "3h", "2d".
  final String age;

  final NotificationBucket bucket;

  /// The session it happened to, so the row can be opened.
  final String sessionSlug;
  final String sessionPhoto;
}

/// Chips across the top. `null` is the "All" view, not a bucket.
const kNotificationFilters = <(NotificationBucket?, String)>[
  (null, 'All'),
  (NotificationBucket.today, 'Today'),
  (NotificationBucket.yesterday, 'Yesterday'),
  (NotificationBucket.week, 'Last 7 days'),
  (NotificationBucket.month, 'Last 30 days'),
];

const kBucketTitles = <NotificationBucket, String>{
  NotificationBucket.today: 'Today',
  NotificationBucket.yesterday: 'Yesterday',
  NotificationBucket.week: 'Last 7 days',
  NotificationBucket.month: 'Last 30 days',
};

/// Buckets are cumulative: last 7 days includes today and yesterday.
List<NotificationBucket> bucketsFor(NotificationBucket? filter) {
  switch (filter) {
    case null:
      return NotificationBucket.values;
    case NotificationBucket.today:
      return const [NotificationBucket.today];
    case NotificationBucket.yesterday:
      return const [NotificationBucket.yesterday];
    case NotificationBucket.week:
      return const [
        NotificationBucket.today,
        NotificationBucket.yesterday,
        NotificationBucket.week,
      ];
    case NotificationBucket.month:
      return NotificationBucket.values;
  }
}

const kNotifications = <NotificationRecord>[
  NotificationRecord(
    id: 'n1',
    actor: 'Aria Moon',
    actorPhoto: 'creatorAria',
    action: 'listens to your session',
    age: '1s',
    bucket: NotificationBucket.today,
    sessionSlug: 'dolphins-frequency',
    sessionPhoto: 'dolphins',
  ),
  NotificationRecord(
    id: 'n2',
    actor: 'Maya Rivers',
    actorPhoto: 'creatorMaya',
    action: 'recreated your session',
    age: '2m',
    bucket: NotificationBucket.today,
    sessionSlug: 'ocean-breath',
    sessionPhoto: 'waves',
  ),
  NotificationRecord(
    id: 'n3',
    actor: 'Theo Waves',
    actorPhoto: 'creatorTheo',
    action: 'saved your session',
    age: '18m',
    bucket: NotificationBucket.today,
    sessionSlug: 'mind-dance',
    sessionPhoto: 'mindDance',
  ),
  NotificationRecord(
    id: 'n4',
    actor: 'Nina Harper',
    actorPhoto: 'creatorNina',
    action: 'started following you',
    age: '1h',
    bucket: NotificationBucket.today,
    sessionSlug: 'golden-hour',
    sessionPhoto: 'glow',
  ),
  NotificationRecord(
    id: 'n5',
    actor: 'Chloe Anderson',
    actorPhoto: 'creatorChloe',
    action: 'listens to your session',
    age: '3h',
    bucket: NotificationBucket.today,
    sessionSlug: 'rainy-mind',
    sessionPhoto: 'rain',
  ),
  NotificationRecord(
    id: 'n6',
    actor: 'Jonas Webber',
    actorPhoto: 'creatorJonas',
    action: 'joined the challenge with you',
    age: '9h',
    bucket: NotificationBucket.yesterday,
    sessionSlug: 'inner-balance',
    sessionPhoto: 'stones',
  ),
  NotificationRecord(
    id: 'n7',
    actor: 'Lucas Martin',
    actorPhoto: 'creatorLucas',
    action: 'recreated your session',
    age: '16h',
    bucket: NotificationBucket.yesterday,
    sessionSlug: 'quiet-space',
    sessionPhoto: 'meadow',
  ),
  NotificationRecord(
    id: 'n8',
    actor: 'Amara Osei',
    actorPhoto: 'creatorAmara',
    action: 'listens to your session',
    age: '22h',
    bucket: NotificationBucket.yesterday,
    sessionSlug: 'deep-grounding',
    sessionPhoto: 'forest',
  ),
  NotificationRecord(
    id: 'n9',
    actor: 'Sara Trezeguat',
    actorPhoto: 'creatorSophia',
    action: 'saved your session',
    age: '2d',
    bucket: NotificationBucket.week,
    sessionSlug: 'raise-your-vibration',
    sessionPhoto: 'vibration',
  ),
  NotificationRecord(
    id: 'n10',
    actor: 'Adam Nilson',
    actorPhoto: 'avatar',
    action: 'recreated your session',
    age: '3d',
    bucket: NotificationBucket.week,
    sessionSlug: 'cosmic-flow',
    sessionPhoto: 'cosmic',
  ),
  NotificationRecord(
    id: 'n11',
    actor: 'Mia Parker',
    actorPhoto: 'creatorMia',
    action: 'started following you',
    age: '4d',
    bucket: NotificationBucket.week,
    sessionSlug: 'dream-drift',
    sessionPhoto: 'underwater',
  ),
  NotificationRecord(
    id: 'n12',
    actor: 'Daniel Kim',
    actorPhoto: 'creatorEthan',
    action: 'listens to your session',
    age: '6d',
    bucket: NotificationBucket.week,
    sessionSlug: 'inner-balance',
    sessionPhoto: 'stones',
  ),
  NotificationRecord(
    id: 'n13',
    actor: 'Emma Carter',
    actorPhoto: 'creatorAria',
    action: 'recreated your session',
    age: '11d',
    bucket: NotificationBucket.month,
    sessionSlug: '528-hz-reset',
    sessionPhoto: 'water',
  ),
  NotificationRecord(
    id: 'n14',
    actor: 'Sofia Martinez',
    actorPhoto: 'creatorAmara',
    action: 'saved your session',
    age: '17d',
    bucket: NotificationBucket.month,
    sessionSlug: 'inner-frequency',
    sessionPhoto: 'glow',
  ),
  NotificationRecord(
    id: 'n15',
    actor: 'Daniel Brooks',
    actorPhoto: 'creatorDaniel',
    action: 'started following you',
    age: '26d',
    bucket: NotificationBucket.month,
    sessionSlug: 'deep-grounding',
    sessionPhoto: 'forest',
  ),
];
