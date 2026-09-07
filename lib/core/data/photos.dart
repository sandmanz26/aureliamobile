/// Cover art, served from the Unsplash CDN — the mobile mirror of the web
/// app's `src/lib/photos.ts`. Same ids, so a session looks the same on both.
///
/// Every consumer goes through [CoverImage] or [PhotoCircle], which keep the
/// design-token gradient underneath. If a photo 404s or the network is gone,
/// the card still reads as designed instead of going blank.
///
/// Attribution: free to use under the Unsplash License. Before this ships to
/// real users, replace these with licensed or generated artwork — hotlinking a
/// third party's CDN is fine for a demo, not for production.
library;

String unsplash(String id, {int width = 600, int height = 600}) =>
    'https://images.unsplash.com/photo-$id?auto=format&fit=crop&w=$width&h=$height&q=75';

/// Photo id per subject, so the same session looks the same everywhere.
const coverPhotos = <String, String>{
  'affirmations': '1506126613408-eca07ce68773',
  'breathwork': '1544367567-0f2fcb009e0b',
  'dolphins': '1439066615861-d1af74d74000',
  'vibration': '1465146344425-f00d5f5c8f07',
  'mindDance': '1502134249126-9f3755a50d78',
  'sleep': '1519681393784-d120267933ba',
  'morning': '1470071459604-3b5ec3a7fe05',
  'stress': '1447752875215-b2761acb3c5d',
  'forest': '1441974231531-c6227db76b6e',
  'calm': '1499209974431-9dddcece7f88',
  'mountains': '1506905925346-21bda4d32df4',
  'water': '1518241353330-0f7941c2d9b5',
  'avatar': '1500648767791-00dcc994a43e',
  'underwater': '1544551763-46a013bb70d5',
  'glow': '1470252649378-9c29740c9fa8',
  'cosmic': '1462331940025-496dfbfc7564',
  'bloom': '1490750967868-88aa4486c946',
  'creatorEthan': '1507003211169-0a1dd7228f2d',
  'creatorDaniel': '1552374196-c4e7ffc6e126',
  'creatorSophia': '1494790108377-be9c29b29330',
  'creatorMaya': '1438761681033-6461ffad8d80',
};

String photoUrl(String key, {int width = 600, int height = 600}) =>
    unsplash(coverPhotos[key] ?? coverPhotos['calm']!, width: width, height: height);
