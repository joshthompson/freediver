## Achievement render order

Can we fix it so achievements are behind dialog and the countdown to them disappearing is paused whilst dialog is open.

### Decisions

- The achievement popup draws behind the dialog box.
- The countdown pauses whenever gameplay is paused: a blocking dialog, the pause menu or a modal.
- It keeps running during non-blocking dialog and background dialog, since gameplay continues.
- An achievement popup may cover a background dialog bubble.

## Corgi statue bone sign

Can we make sure the x/10 bones sign is in front of any plants so it can be read properly.

### Decisions

- Plants that overlap the sign are hidden, the same way plants overlapping the statue are. Foreground plants draw in front of the diver and corgi, so reordering couldn't put the sign in front of plants while keeping it behind anything that moves.

## Background Dialog

Can we make a system where "NPC"s can have dialog that comes up as they pass by that doesn't stop you. It just comes up in a little box near them as they move by. I want the cow or manatee to occasionally say hello as if you pass them whilst they swim around together. This can be called background dialog.

### Decisions

- **Scope:** background dialog is a separate system for ambient lines that never matter to a quest. The cow's existing non-blocking quest lines (`slowDown`, `halfWay`, `foundYou`) stay in the main dialog box.
- **Speakers:** characters (named creatures who can speak). "NPC" is not used. Linkosha never replies with a bubble.
- **Look:** a small speech bubble beside the character that moves with them and stays inside the screen edges. It shows only the text, with no portrait or name.
- **Trigger:** the corgi comes within about 250px, a chance roll succeeds, and the character's cooldown (about 20 seconds) has passed. Characters can also require game state, such as Wanda and Manny only after they're reunited.
- **Dismissal:** after roughly 3 seconds, longer for longer lines, or as soon as the character goes off screen. It takes no input, and Space never dismisses it.
- **Timing:** display time and cooldown count game frames, so both freeze while the game is paused.
- **With main dialog:** opening a main dialog hides any bubbles and stops new ones starting.
- **Overlap:** only one bubble shows at a time. A character blocked by another's bubble keeps trying (its cooldown only starts once it speaks), so the cow and manatee tend to take turns.
- **Content:** each character has a pool of lines in `Dialogs.ts`, and one is picked at random each time. English only for now.
- **First version:** the system works for any character, but only Wanda and Manny get lines, once they're reunited. Their starter lines (about 4 each, in the existing pun style) are placeholders for Josh to rewrite.
