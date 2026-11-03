# Peer-to-peer multiplayer with no server

Multiplayer uses Trystero over public Nostr relays, with the Host's game relaying every Player's state, Chat Messages and the roster to the others, so the game stays a static GitHub Pages site with no server to host or pay for. We accepted slower, less reliable connections and no Host migration (a Room ends when its Host leaves) in exchange. Firebase/Supabase or a hosted server would fix both, but each needs an account, keys or a backend.

Trystero can't list rooms, so a single well-known Trystero room acts as the Lobby where each Host announces its Room every few seconds; each Room is its own Trystero room joined by id.
