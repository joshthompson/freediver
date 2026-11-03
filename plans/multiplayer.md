# Multiplayer

A very simple multiplayer prototype: up to 4 Players swim together in the Empty Ocean. There is no objective.

Terms (Room, Lobby, Host, Player, Display Name, Puppet, Chat Message, Pointer, Empty Ocean) are defined in [GLOSSARY.md](../GLOSSARY.md). The networking choice is recorded in [ADR 0001](../docs/adr/0001-peer-to-peer-multiplayer.md).

## Networking

- Peer-to-peer with Trystero over the default public Nostr relays. There is no game server, and the game stays a static GitHub Pages site.
- The Lobby is a single well-known Trystero room. Each Host announces its Room there every few seconds (id, name, Host Display Name, player count, protocol version). A Room drops off the list when its announcements stop.
- Each Room is its own Trystero room, joined by id.
- Every Room carries a protocol version. The Lobby only lists Rooms on your version.
- Rooms are fully open: no passwords, no kicking, no chat filtering.

## Host

- The Host is the Player who created the Room and counts as one of the 4.
- The Host decides the roster: who is in, each Player's slot/colour and Display Name, and join/leave. It passes every Player's state and Chat Messages on to the others.
- Movement is owned by each Player. Each game simulates its own Diver and corgi and sends their state to the Host, which passes it on.
- The Host passes each message on the moment it arrives, not on the game loop, so a hidden Host tab still keeps the Room running.
- If more than 4 try to join, the Host rejects the extra Player, who returns to the Lobby with "Room is full".
- A Player who sends nothing for 5 seconds is dropped, the same as leaving.
- When the Host leaves, the Room ends. Everyone returns to the Lobby with "The host left". There is no host migration.

## Menu and Lobby

- A new "Multiplayer" button sits below Start/Continue on the main menu.
- Flow: Menu → enter username → Lobby → Room. "Leave room" returns to the Lobby, and "Back" in the Lobby returns to the menu.
- Usernames are 1–12 characters, trimmed and required. The username is remembered on this device and pre-filled next time. This is the only thing multiplayer saves.
- Room names are 1–20 characters, trimmed and required. The default is "<username>'s room". Room names don't need to be unique.
- Each Lobby row shows the Room name, the Host's Display Name and "n/4", newest first. Full Rooms are greyed out and can't be joined.
- With no Rooms, the list says "No rooms yet: create one".
- The "Multiplayer" button is greyed out with "Needs internet" when the browser reports being offline.
- Every new on-screen label is translated into all 4 languages. Chat Messages, usernames and Room names are always shown as typed.

## Players

- Display Names: the first Player with a username shows it as is, and later ones get " (2)", " (3)" and so on. Display Names never change while you're in a Room. A newcomer gets the lowest free number.
- Each slot has a fixed colour for both suit and corgi: Teal (Host, today's look), Red, Yellow, Pink. A Player keeps their slot for the session, and a freed slot goes to the next Player who joins.
- The colour is used for the suit, the corgi's suit, the name tag, the Pointer and join/leave notices.
- In multiplayer no corgi is Linkosha. Each is "<Display Name>'s corgi", including your own.
- A name tag in the Player's colour sits above every Diver, your own included. Corgis have no tag.

## Gameplay

- The Empty Ocean: the ocean of the first dive with every Character, creature, item and trigger removed. Keep the floor, walls, light rays, background/parallax and the ocean music.
- Multiplayer starts straight in the Empty Ocean, with no Surface scene.
- A ceiling stops Players from surfacing.
- No oxygen, no blackout and no equalising. It's pure swimming.
- Multiplayer never writes to the single-player save: no score, no dives recorded, no Achievements.
- Players appear at the ocean's usual start point. Late joiners see the others where they currently are.
- Players don't interact at all. Puppets pass through you and the world.
- Escape opens the pause menu as an overlay ("Resume", "Leave room"). The world keeps running and Puppets keep moving.
- Your own Diver and corgi are drawn in front of Puppets. Name tags and Pointers are always on top.
- "<name> joined" and "<name> left" show briefly at the top of the screen in the Player's colour.

## Puppets

- Each Player sends their state about 12 times a second. Puppets are drawn about 100ms behind and glide between updates.
- Synced Diver state: `x`, `y`, `rotation`, `speed` (drives body animation rate and head tilt), and per arm: `swimPosition`, `rotation`, `isSwimming`. Facing follows from rotation.
- Synced corgi state: `x`, `y`, `rotation`.
- Not synced: the exact body animation frame (each screen animates from `speed`) and damage/heal flashes.
- A Player whose tab is hidden just floats still for the others.

## Pointers

- One Pointer per off-screen Puppet Diver, on the screen edge in their direction, in their colour, labelled with their Display Name. There's no distance shown and no Pointer for corgis.
- It hides when the Puppet is on screen. It works the same on mobile.

## Chat

- Tab opens a text field. Enter sends, and Escape or an empty Enter closes it.
- While the field is open, game keys are ignored and your Diver drifts.
- Chat Messages are at most 80 characters. They appear in a speech bubble above the speaker's Diver, styled like Background Dialog, for 2s + length/25s.
- Each Player can show one bubble at a time, and several Players' bubbles can show at once. A new message replaces that Player's previous bubble. You see your own messages too.
- An off-screen Player's bubble shows next to their Pointer.
- Earlier messages aren't replayed to late joiners. There's no chat log.
- On mobile you can read chat but not send it.

## Art

- Generate recoloured copies of the diver body, arm, head and corgi sprite sheets, one set per slot colour. Only the teal suit changes. The purple trim, skin, hair, goggles and corgi fur stay the same.

## Implementation notes (from the code)

- Menu button: [MenuScene.tsx](../src/game/freediver/scene/MenuScene.tsx). Scenes are switched by string in [FreediverGame.tsx](../src/game/freediver/FreediverGame.tsx).
- The Empty Ocean can be derived from [OceanLevel.ts](../src/game/freediver/scene/levels/OceanLevel.ts). Drop `setGameState('diver','level','ocean')`. Surfacing at `y < -50` calls `registerCurrentDive()` every frame, so the ceiling matters.
- Oxygen and equalising can be turned off with the existing `canBreathe` / `oxygenUse` / `equalise` options on `createDiverController`.
- [DiverController.ts](../src/game/freediver/controllers/main/DiverController.ts) reads the global `Key` for movement and for the arms' `isSwimming`. Puppets need their state injected instead of reading keyboard input.
- [CorgiController.ts](../src/game/freediver/controllers/main/CorgiController.ts) hardcodes its target as `'diver'`, and `'corgi'` is looked up by id elsewhere. These need to take ids for multiple Players.
- Background Dialog in [Scene.ts](../src/engine/Scene.ts) shows one bubble at a time, refuses new ones while one is showing, and needs text in all locales. Chat needs several bubbles at once and untranslated text.
- Every key handler listens on `window` (Key, Scene pause on `p`/Escape, Dialog, PortalMenu). They must ignore events while the chat field is focused.
- Pause sets `isActive()` false, which stops every controller. Multiplayer pause must not do this.
- The game loop is a 40ms `setInterval`, which browsers throttle in hidden tabs.
