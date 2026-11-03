# Multiplayer

I want to create a very simple multiple prototype.
Up to 4 players.

## Lobby 

Very simple lobby system using Trystero.

From main menu you select "Multi Player" instead of "Continue"

You can then choose a room from a list of current rooms or create your own room.

You must choose a username up to 12 chars long. When creating a room a room must have a name up to 20 chars long.

## Host

The host keeps all other player positions and other information and broadcasts them to all clients. It is the source of truth.

## Gameplay

You can swim around together in a world.

Each player has a small player name above there head. Each player has a different colour suit as does their corgi.

The multiplayer syncs the postions of all players and their corgis. This includes rotation and arms positions. These then show show as "puppets" to other players.

Multiplayer allows you to press tab to open a text field to type to other players. These messages appear as background dialog.

There is no objective - the level is an empty version of the first level.