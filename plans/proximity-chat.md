# Voice Chat

Players in a Room hear each other's microphones, louder the nearer their Divers are. See [GLOSSARY.md](../GLOSSARY.md) for Voice Chat, Earshot, Mic Button and Mic Check, and [ADR 0002](../docs/adr/0002-direct-voice-chat.md) for why audio skips the Host.

## Hearing

- Distance is from your Diver to theirs, the same fixed distances for everyone (the game is 700px wide)
- Full volume within 350px, then an eased fade to silent at 900px (Earshot). Tune by ear
- Gentle left/right panning by which side they're on
- Voices follow the game's Volume option
- Voices keep playing, and your mic keeps sending, while your pause menu is open

## Network

- Audio goes straight between Players over Trystero's existing peer connections, not through the Host
- The listener asks a Player for their audio when that Player's Diver comes within 1100px, and stops asking beyond 1300px. The gap stops it flicking on and off
- A Player you've muted is never asked
- When a listener stops asking, the connection stays set up but nothing is sent, so it comes back quickly
- `PROTOCOL_VERSION` goes to 2, so a Room only holds Players whose game has Voice Chat

## Lobby

- A Microphone switch, remembered like the username, along with the chosen input
- Turning it on asks the browser for permission and shows the Mic Check: an input picker and five level bars (low to high pitch). It never plays your voice back
- The switch sets whether your mic is on when you create or join a Room
- If permission is denied, the switch says the mic is blocked

## Room

- The Mic Button sits bottom-right. **M** toggles it on desktop. The open chat input stops short of it
- Joining with the mic off still shows the Mic Button. Tapping it asks for permission then
- Turning it off fully releases the mic, so the browser's recording light goes out
- If permission is denied, the button is crossed out with a tooltip saying the mic is blocked
- The pause menu has the Mic Check and a mute toggle beside each Player
- A speaker icon shows on a Player's name tag or Pointer while they're talking. It only lights up for Players you're receiving audio from
