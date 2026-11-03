## Crystal Realm Assets

Every asset below is a placeholder, at its final file name in `src/assets/realms/`. Replace each file with hand-drawn art of the same name, keeping the same proportions (the game sizes them itself, so a bigger image at the same aspect ratio is fine).

Tinted placeholders are recoloured copies of existing art. Drawn placeholders are simple shapes.

In dev builds, **Art Checklist** on the main menu shows every placeholder with its path, pixel size and file size, and marks each one replaced once its file changes. It also lists the Corgi Kingdom art and the statue sign, which were SVGs and are now PNGs rendered from them. The list lives in `src/game/freediver/data/PlaceholderArt.ts`.

### Common

- [ ] `common/crystal-corgi-ruby.png`: Ruby Crystal Corgi (170×120, drawn)
- [ ] `common/crystal-corgi-yellow.png`: Yellow Crystal Corgi (170×120, drawn)
- [ ] `common/crystal-corgi-white.png`: White Crystal Corgi (170×120, drawn)
- [ ] `common/crystal-corgi-black.png`: Black Crystal Corgi (170×120, drawn)
- [ ] `common/crystal-corgi-fire.png`: Fire Crystal Corgi (170×120, drawn)
- [ ] `common/plinth.png`: Plinth (180×140, drawn)

### Realm Guides

Each guide is a 3-frame sprite sheet laid out like `kingdom/corgi-citizen.png` (1902×394), plus a 320×320 dialog portrait. All are tinted from the corgi citizen and Linkosha's portrait.

- [ ] `corgosphere/space-corgi.png` and `corgosphere/space-corgi-dialog.png`: Cosmo the Space Corgi
- [ ] `trigger-fish-lair/captain-chum.png` and `trigger-fish-lair/captain-chum-dialog.png`: Captain Chum
- [ ] `fried-egg/eggy-corgi.png` and `fried-egg/eggy-corgi-dialog.png`: Yolko the Eggy Corgi
- [ ] `depths/judge-corgi.png` and `depths/judge-corgi-dialog.png`: Judge Fathom
- [ ] `hell/hell-corgi.png` and `hell/hell-corgi-dialog.png`: Ember

### Corgosphere

- [ ] `corgosphere/asteroid.png` (200×200, drawn)
- [ ] `corgosphere/space-urchin.png` (160×160, drawn)
- [ ] `corgosphere/space-jellyfish.png` (120×170, drawn)
- [ ] `corgosphere/space-fish.png` (157×150, tinted from `fish1.png`)
- [ ] `corgosphere/space-crab.png`: 4-frame sheet like `crab.png` (600×127, tinted)

Air Pockets are drawn in CSS, so they need no image.

### Lair of Trigger Fish

- [ ] `trigger-fish-lair/bait.png` (70×50, drawn). Also used for the bait count.
- [ ] `trigger-fish-lair/rock.png`: stretched over each rock wall (300×300, drawn)
- [ ] `trigger-fish-lair/mini-trigger-fish.png` (200×110, tinted from `evil.png`)

### Fried Egg Dimension

- [ ] `fried-egg/fried-egg.png` (130×110, drawn)
- [ ] `fried-egg/egg-bullet.png` (50×64, drawn)
- [ ] `fried-egg/scrambled-egg-monster.png`: angry, also its dialog portrait (400×360, drawn)
- [ ] `fried-egg/scrambled-egg-monster-happy.png`: sorry (400×360, drawn)

### Depths

- [ ] `depths/buoy.png` (200×170, drawn)
- [ ] `depths/rope-segment.png`: tiles down the rope (24×96, drawn)

### Hell

- [ ] `hell/steam-vent.png` (160×70, drawn)
- [ ] `hell/steam.png`: stretched over each steam column (120×400, drawn)
- [ ] `hell/fireball.png` (64×64, drawn)
- [ ] `hell/hell-rock.png` (300×300, drawn)
- [ ] `hell/hell-fish.png` (200×110, tinted from `evil.png`)
- [ ] `hell/demon-corgi-fish.png`: also its dialog portrait (256×160, drawn)
- [ ] `hell/devil-corgi-fish.png`: also its dialog portrait (448×280, drawn)
- [ ] `hell/devil-corgi-fish-happy.png`: friends (448×280, drawn)

### Sounds

No new sounds yet. Hits use `thud.mp3` and collecting a Fried Egg uses `starfish.mp3`. These are still needed:

- [ ] Crystal Corgi picked up
- [ ] Portal opening and travelling through
- [ ] Bait dropped
- [ ] Egg Bullet fired
- [ ] Boss hit by an Egg Fish kiss

Music is planned separately in [music.md](./music.md).
