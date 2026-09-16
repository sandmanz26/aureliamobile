/**
 * What a screen calls the thing it is sending you off to play.
 *
 * Nothing is really generated here, so a session you have just built plays a
 * catalogue session standing in for it. That is a sound mock — the stand-in is
 * the same kind of session, picked for it — but it has a name and an author of
 * its own, and announcing those is the point at which the mock shows: you
 * watch "Sleep meditation v1.2" reach 100%, press play, and the deck reports
 * "Night Rain Sleep by Sophia Reynolds".
 *
 * So the screen that knows what it built says so, and the player and the mini
 * player believe it. The recording is borrowed; the name on it is not.
 */
export interface Named {
  title: string
  author: string
}
