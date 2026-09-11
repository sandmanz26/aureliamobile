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
  'affirmations': '1506126613408-eca07ce68773',  // sunrise yoga
  'breathwork': '1544367567-0f2fcb009e0b',  // stretching at dawn
  'dolphins': '1439066615861-d1af74d74000',  // deep ocean
  'vibration': '1465146344425-f00d5f5c8f07',  // wildflowers, warm light
  'mindDance': '1502134249126-9f3755a50d78',  // night sky
  'sleep': '1519681393784-d120267933ba',  // mountains under stars
  'morning': '1470071459604-3b5ec3a7fe05',  // fog over pines
  'stress': '1447752875215-b2761acb3c5d',  // forest path
  'forest': '1441974231531-c6227db76b6e',  // sunlit canopy
  'calm': '1499209974431-9dddcece7f88',  // still water
  'mountains': '1506905925346-21bda4d32df4',  // dawn ridgeline
  'water': '1518241353330-0f7941c2d9b5',  // rippled surface
  'avatar': '1500648767791-00dcc994a43e',  // portrait, for the demo profile
  'underwater': '1544551763-46a013bb70d5',  // figure suspended underwater
  'glow': '1470252649378-9c29740c9fa8',  // warm dusk light
  'cosmic': '1462331940025-496dfbfc7564',  // galaxy, for Cosmic Flow
  'bloom': '1490750967868-88aa4486c946',  // wildflower field, the Explore hero
  'creatorEthan': '1507003211169-0a1dd7228f2d',
  'creatorDaniel': '1552374196-c4e7ffc6e126',
  'creatorSophia': '1494790108377-be9c29b29330',
  'creatorMaya': '1438761681033-6461ffad8d80',
  'creatorNoah': '1633332755192-727a05c4013d',
  'creatorAria': '1544005313-94ddf0286df2',
  'creatorTheo': '1531427186611-ecfd6d936c79',
  'creatorAmara': '1531123897727-8f129e1688ce',
  'creatorJonas': '1519345182560-3f2917c472ef',
  'creatorLily': '1487412720507-e7ab37603c6f',
  'creatorChloe': '1517841905240-472988babdf9',
  'creatorNina': '1524504388940-b1c1722653e1',
  'creatorLucas': '1500648767791-00dcc994a43e',
  'creatorMia': '1502823403499-6ccfcf4fb453',  // Covers for the Picked for You grid.
  'waves': '1439405326854-014607f694d7',  // open ocean swell
  'rain': '1428592953211-077101b2021b',  // rain on glass, bokeh
  'stones': '1507525428034-b723cf961d3e',  // balanced stones
  'meadow': '1444927714506-8492d94b4e3d',  // white flowers in grass
  'neural': '1559757148-5c350d0d3c56',  // filament network, the challenge hero
};

String photoUrl(String key, {int width = 600, int height = 600}) =>
    unsplash(coverPhotos[key] ?? coverPhotos['calm']!, width: width, height: height);
