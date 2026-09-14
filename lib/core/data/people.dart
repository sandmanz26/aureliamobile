/// Creators, and which of them is you — the mobile mirror of the web app's
/// `src/lib/people.ts`.
library;

import 'sessions.dart';

/// Who is signed in. One string, in one place: "is this mine?" was being
/// answered by comparing against a name literal repeated across the profile
/// screen, the notification feed and the challenge board, which is how a
/// rename turns into three bugs.
///
/// When there is a backend this becomes the account on the session token.
const kCurrentUser = 'Adam Nilson';

/// A creator, assembled from what they have published.
class Person {
  const Person({
    required this.name,
    required this.slug,
    required this.photo,
    required this.role,
    required this.sessions,
  });

  final String name;
  final String slug;
  final String photo;
  final String role;
  final List<SessionRecord> sessions;

  /// True for the signed-in user, which is what decides own-profile chrome.
  bool get isSelf => name == kCurrentUser;
}

String personSlug(String name) => name
    .toLowerCase()
    .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
    .replaceAll(RegExp(r'^-|-$'), '');

final kCurrentUserSlug = personSlug(kCurrentUser);

/// Everyone who has published something, keyed by slug. Built from [kSessions]
/// rather than kept as its own list — a creator with no sessions has no
/// profile to show, and a second list would drift from the first.
final Map<String, Person> _people = () {
  final people = <String, Person>{};
  for (final session in kSessions) {
    final slug = personSlug(session.author);
    final existing = people[slug];
    if (existing != null) {
      existing.sessions.add(session);
      continue;
    }
    people[slug] = Person(
      name: session.author,
      slug: slug,
      photo: session.authorPhoto,
      role: session.authorRole,
      sessions: [session],
    );
  }
  return people;
}();

/// Null resolves to the signed-in user, so a bare `/profile` keeps working.
Person? findPerson(String? slug) =>
    _people[slug == null || slug.isEmpty ? kCurrentUserSlug : slug];

/// How a screen was reached, when that changes whose work it is showing.
///
/// The author answers "whose session is this" for anything in the catalogue.
/// It cannot answer it for a session the user has just built in the cockpit —
/// that one has no catalogue entry and borrows a slug to play against — so the
/// entry point says so directly rather than being guessed at.
enum ProfileOrigin { own, community }

/// Which profile a creator's name should open, from anywhere in the app.
/// Returns the argument for the `/profile` route: null is your own.
String? profileArgument(String author, [ProfileOrigin? origin]) {
  if (origin == ProfileOrigin.own) return null;
  if (origin == ProfileOrigin.community) return personSlug(author);
  return author == kCurrentUser ? null : personSlug(author);
}
