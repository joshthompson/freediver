## Corgi King's Quest

The corgi king wants you to find the 5 crystal corgis. These are glass corgi statues in different colours.

They will stand on 5 plinths in the corgi kingdom behind the king.

When you bring them back one by one they will be delivered to their plinth and the next part of the quest is revealed.

The corgi king opens a portal. When you swim onto it you are given a modal that asks you where you want to travel to. There are 5 options. Each level is ticked off when completely but can be replayed.

Once you collect all the 5 crystal corgis the corgi king congratulates you and tells gives his crown to Linkosha instead. The credits roll. After you are returned to the game.

## Crystal Corgi Levels

Each level has a different method to complete. If you fail you restart at the beginning of this level with progress reset.

You always enter in via a portal and exit via a different portal after finding the crystal corgi.

There is always a themed corgi at the start and end. The start one explains the level and might also give you an item.
The one at the end congratulates you.

### Corgosphere - The Ruby Crystal Corgi

This kingdom is in space - you can swim up down, left right. The camera will also track you "swimming" down vertically (as well as the standard horizontal tracking). You do not need to equalise in space.
There are space jelly fish, space fish, space crabs

When you exit the portal, you are in a weird big air bubble. There is a space corgi that introduces to you the theme of this level.

Whenever in an air bubble you replenish oxygen quickly. (Maybe 2s to fully restore 0->100)
When you are not in an airbubble you see oxygen depletes quickly. Maybe 10s to go fully down.
You must navigate a maze of connected air bubbles. It will take around 2 mins maybe to swim through them all. There will also be hazards along the way. Moving asteroids to dodge, stationary space urchins. Other stuff like that - some space themed, some sea themed but with a space twist. Hazards reduce your oxygen immediately.

When you reach the end you find the Ruby Crystal Corgi and Link will swim to collect it. Then there is a portal to take you back to the corgi kingdom.

### Lair of Trigger Fish - The Yellow Crystal Corgi

This zone is a deep underwater area that allows you to swim about 4x deeper than the current depth/4x height of a standard screen of the first two zones. The camera also tracks you vertically as well horizontally here. There are large rock formations that force you to travel up and down like a big curve.

Here there are many trigger fish you must avoid. There are also mini trigger fish which stick to a specific radius around their centre.

This level introduces a trick to avoid trigger fish - bait.

When you enter the level you find a Corgi that introduces you to the level and gives you 10 bait. These items appear with a x10 on screen in the UI. The corgi explains that pressing "E" releases a bait. This item then appears near you. Any trigger fish nearby will be drawn to the bait instead of you. Bait lasts around 5s of being attacked by trigger fish. The distance it draws them from is about half the game display width.

You must use bait at the correct places to avoid trigger fish and make it to the end. You can swim up to the top of the level to regain oxygen and it will show a kind of surface, but you will not exist to a surface scene. You will need to equalise a lot in this level.

When you reach the end you get a portal that takes you back.

### Fried Egg Dimension - The White Crystal Corgi

This level looks weird, everything is eggy. It's like your in a weird artist that is obsessed with eggs imagination.
And eggy corgi greets you and explains that the scrambled egg monster is throwing a party and you have 60 seconds to find all the fried eggs. You need 100.
This kingdom is full of egg fish.

Once you start, there is a 60 second timer and an egg-o-meter. You must collect fried eggs that are floating all over the level. Egg fish also swim about a lot here.

If you manage to fill up the egg-o-meter the scrambled egg monster swims over you see all your eggs filling him up and he grows bigger and enters a rage.

Oh no - it was a trick - now the bigger egg monster speaks to you and says he will turn you into an egg. You must swim away avoiding his egg weapons like a bullet hell game. Every egg he fires at you decreases his size. After a minute he exits the rage and apologies - he gives you the crystal corgi and opens the portal for you to return.

All the dialog is full of very bad egg puns.

### Depths - The Black Crystal Corgi

This is a proper free diving level. You must swim as deep as possible and the sea gets deeper and deeper until you're super deep. You must equalise properly to make it to the bottom. There you get a ribbon from the bottom of the rope (the rope is much longer and rigid). This level tracks you vertically.

When you reach the bottom you find the crystal corgi and then have to try and return to the surface on that one breath.

Because 100 ozygen depletes slowly, it would be quite boring so lets have it deplete faster the deeper you are so it takes ~40 seconds to swim to the bottom.

When at the top the corgi congratulates you and opens the exit portal.

This looks like a proper constant weight free diving contest.

### Hell - The Fire Crystal Corgi

Hell is a steaming underwater level with so many hazards. Dangerous fish, steaming vents of hot water that go on and off that you must time correctly to get through. It should somehow look like an underwater hell. You need to get air bubbles to regain oxygen. This level is about 2x height of a screen.

This level you must race a demon-corgi-fish mutation. The demon is faster than you but will stop to mock you in background dialog.

There should be a bunch of fun hazards and ways to get ahead in this race.

If you defeat the demon in the race you see it transform in the devil-corgi-fish and then you have a final boss fight. It will be bigger but much slower and will follow you. You must swim around it to get it to chase you into egg fish which will kiss it and reduce it's health. It will have attack phases you need to learn and dodge. You will see a health bar for the devil below it.

When you defeat it it stops looking angry and smiles and apologies and says actually we should be friends and gives you the fire crystal corgi and opens the portal home.

# Art

Can all art be PNGs for these as it retains the style of the existing levels

### Decisions

Terms follow [GLOSSARY.md](../GLOSSARY.md): Corgi Kingdom, Crystal Realm, King's Portal, Entry Portal, Exit Portal, Crystal Corgi, Plinth, Realm Failure, Realm Guide, Air Pocket, Air Bubble, Hazard, Bait, Fried Egg, Egg Fish, Egg-o-meter, Scrambled Egg Monster, Egg Bullet.

#### Corgi Kingdom

- **Order:** the five Crystal Realms can be done in any order. Each is ticked off once done and can be replayed.
- **King's Portal:** swimming onto it opens a modal that pauses gameplay. It lists the five realms in the order above, ticks the done ones, and has a "Stay" button that closes it and moves you just off the portal so it doesn't reopen straight away.
- **Winning a Crystal Corgi:** Linkosha picks it up at the end of the realm, but it only counts once Linkosha carries it through the Exit Portal. Blacking out before then loses it.
- **Delivery:** on arrival back through the King's Portal, Linkosha swims it to its Plinth automatically, like bones to the statue. The king then has one short line for that crystal and a line about how many are left. He doesn't point you to a next realm.
- **Points:** finishing a realm adds 10 points to the current dive the first time and 5 on each replay. They're banked on surfacing, like starfish. Collectibles inside a realm, such as Fried Eggs, give no points.
- **Replays:** a realm plays exactly the same, but the Crystal Corgi appears as a see-through ghost that Linkosha doesn't pick up.
- **Realm Failure:** blacking out, or failing a realm's own goal, plays a short "Realm failed" fade and puts you back at the King's Portal. That realm's progress is lost, but your dive points are kept and the `blackout` achievement isn't earned.
- **Quitting mid-realm:** quitting to the menu or reloading during a realm resumes in the Corgi Kingdom in front of the King's Portal. Realm progress isn't saved.
- **Ending:** after the fifth delivery the king steps down and gives his crown to Linkosha. The credits play in their own view, then you're taken back to the Corgi Kingdom. From then on Linkosha wears the crown everywhere, and the old king stays bare-headed with new background dialog.

#### Every Crystal Realm

- **Controls:** unchanged (rotate and thrust). "Up, down, left, right" means free movement with a camera that tracks vertically as well as horizontally. Bait is dropped with E, with a matching mobile button.
- **Realm Guides** (placeholder names): Cosmo the Space Corgi, Captain Chum, Yolko the Eggy Corgi, Judge Fathom and Ember. Each greets you at the Entry Portal and congratulates you by the Exit Portal.
- **Hazards:** each hit takes 15 oxygen, then gives about 1s of invulnerability with a flash.
- **Achievements:** one for each Crystal Corgi and one for completing the king's quest.
- **Text:** new UI text (portal modal, timer, Egg-o-meter, bait count, "Realm failed", boss health bar, credits headings) is translated into all four locales, and so is all dialog, including speaker names and background dialog.
- **Art and sound:** placeholder PNGs and sound effects at final sizes and file names, with a checklist of every asset to replace with hand-drawn art. No new music yet, see [music.md](./music.md).

#### Corgosphere

- About 6 screens wide and 3 tall, and roughly 2 minutes through the maze.
- In an Air Pocket, oxygen goes from 0 to 100 in about 2s. Outside one, it runs out in about 10s.
- No equalising.
- Asteroids (moving), space urchins (stationary) and space jellyfish are Hazards. Space fish and space crabs are harmless scenery.

#### Lair of Trigger Fish

- About 8 screens wide and 4 screens deep, with rock formations forcing big up-and-down curves. You equalise a lot.
- Swimming to the top refills oxygen at a surface that doesn't lead to the surface scene.
- The Realm Guide hands over 10 bait, shown as "x10" in the UI. There's no way to get more, and leftover bait is gone when you leave.
- Trigger fish keep their bite of 5, repeated while they're on you. They aren't Hazards.
- Bait draws trigger fish from about half the screen width and lasts about 5s of being attacked. Mini trigger fish are drawn to it too: they leave their circle to chase it and swim back to their centre when it's gone.

#### Fried Egg Dimension

- About 3 screens wide and 2 tall.
- No oxygen use and no equalising, so only hits drain oxygen. Egg Fish swim about and heal you as usual.
- Collect 100 Fried Eggs in 60s to fill the Egg-o-meter. If time runs out first, it's a Realm Failure.
- During the rage, the Scrambled Egg Monster fires three harder patterns, about 20s each: aimed shots, rings, then spirals. His shrinking is only for show: the rage ends after 60s whatever his size. During the rage you can only fail by blacking out.

#### Depths

- A single column about 100m deep. The camera tracks vertically only.
- No creatures or hazards: just depth, equalising and oxygen use that speeds up the deeper you are. No ribbon, just the Black Crystal Corgi at the bottom of the rope.
- Tuned so a diver who equalises well reaches the bottom with about 55% oxygen and surfaces with about 10%. Poor equalising should mean a blackout.

#### Hell

- About 10 screens wide and 2 tall for the race, ending in a one-screen boss arena. You equalise.
- If the demon finishes first, it's a Realm Failure. Current streams, timed vent shortcuts and the demon stopping to mock you (as background dialog) let you catch up.
- The devil boss cycles three attacks: a glowing charge, a fireball spread of Hazard shots, and an eruption of every arena vent in a pattern. Between attacks he slowly follows you, so you can lead him into Egg Fish.
- In the boss fight Egg Fish only kiss the devil, each kiss taking 20% of his health. They don't heal you, so Air Bubbles appearing now and then are your only oxygen.

#### Build order

1. The Corgi Kingdom: portal modal, Plinths, delivery, ending and credits.
2. Corgosphere, which brings in the shared parts: vertical camera, Entry and Exit Portals, Realm Failure and Hazards.
3. The other realms, one per pass.
