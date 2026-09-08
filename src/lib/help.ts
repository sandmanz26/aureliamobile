// Help centre content.
//
// Answers live here rather than in the page so they can be reviewed as copy
// without reading JSX, and so support can own them later without touching the
// component.

export interface HelpTopic {
  question: string
  answer: string
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    question: 'What is Aurelia AI?',
    answer:
      'Aurelia turns a conversation into a session. You describe how you feel or what you need, and it builds a meditation, soundscape or breathwork piece around that — then keeps adjusting it as you tell it what worked.',
  },
  {
    question: 'How do I create a new session?',
    answer:
      'Start a new session by selecting New Session, then follow the prompts to begin your conversation with Aurelia.',
  },
  {
    question: 'Where can I find my previous sessions?',
    answer:
      'Everything you have made or saved is under Sessions in the menu. Your published ones also appear on your profile.',
  },
  {
    question: 'How do I continue a previous session?',
    answer:
      'Open it from Sessions and choose Recreate. That starts a new version from where the last one left off, so the original stays untouched.',
  },
  {
    question: 'Can I delete a session?',
    answer:
      'Yes. Open the session, then use the menu in the top right. Deleting removes it from your library and from anyone browsing the community, but versions other people already forked from it stay with them.',
  },
  {
    question: 'Why can’t I see my previous sessions?',
    answer:
      'The most common reason is being signed into a different account than the one that made them. If the account is right and they are still missing, contact support before creating them again — nothing is deleted automatically.',
  },
  {
    question: 'How do I update my profile?',
    answer: 'Open Profile from the menu and edit your name, photo and bio there. Changes show on your published sessions straight away.',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'Profile, then Settings, then Delete account. It removes your sessions, your check-in history and your voice recordings. Anything you published that other people have already recreated keeps your name in its lineage — that credit cannot be removed without rewriting their versions too.',
  },
  {
    question: 'Does Aurelia remember my previous sessions?',
    answer:
      'Yes, within your account. It uses what you have made and how you rated it to shape what it suggests next. You can see and clear what it holds under Settings.',
  },
  {
    question: 'Why does Aurelia give different responses?',
    answer:
      'Generation is not deterministic, so the same prompt will not produce an identical session twice — and it also adapts to your recent check-ins. If you want one exact version back, open the saved session rather than asking for it again.',
  },
]
