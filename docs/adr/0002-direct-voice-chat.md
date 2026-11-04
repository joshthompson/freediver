# Voice Chat goes straight between Players, not through the Host

Unlike everything else in a Room, Voice Chat audio is sent directly from each Player to each other Player over the peer connections Trystero already makes between everyone in a Trystero room. The requests to start and stop hearing someone go directly too. Relaying audio through the Host would add delay and multiply the Host's upload by the number of Players, for no gain: the Host's authority over the roster doesn't need to extend to audio, and a Room still ends when its Host leaves.

To save bandwidth, a listener only asks for a Player's audio while their Diver is near enough to be heard soon, and never from a Player they've muted. The sender keeps the connection set up but sends silence otherwise, so the audio comes back quickly when they swim closer.
