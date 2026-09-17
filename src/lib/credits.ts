// The credit ledger — Figma "Profile/Credits" (16658:29260).
//
// Credits are the app's own currency: earned by inviting someone, spent on
// things the product has not built yet. The balance is shown on nine screens
// and this is the only place that says where it came from.

/** The referral link the Invite card offers. The frame's own copy. */
export const INVITE_LINK = 'https://www.aurellia.ai/inviteafriend'

/** What both sides get when an invite is taken up. */
export const INVITE_REWARD = 500

export const TOTAL_CREDITS = '1,323'

export interface CreditEntry {
  id: string
  /** Underlined in the frame — the person is the subject of the sentence. */
  who: string
  /** What they did, as it reads after the name. */
  what: string
  /** Compact age, matching the notification feed's own format. */
  age: string
  amount: number
}

export const CREDIT_HISTORY: CreditEntry[] = [
  { id: 'c1', who: 'Aria Moon', what: 'registered using your referral link!', age: '1s', amount: 500 },
  { id: 'c2', who: 'Maya Rivers', what: 'registered using your referral link!', age: '2m', amount: 500 },
  { id: 'c3', who: 'Theo Waves', what: 'registered using your referral link!', age: '2m', amount: 500 },
  { id: 'c4', who: 'Jonas Weber', what: 'registered using your referral link!', age: '2m', amount: 500 },
  { id: 'c5', who: 'Daniel Kim', what: 'registered using your referral link!', age: '2m', amount: 500 },
]
