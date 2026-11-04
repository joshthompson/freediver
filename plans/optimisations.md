## Engine performance

This document details plans for future optinisations

### Future optimisations

Most of what's left is style recalculation for visual effects that change every frame. Each of these changes how something looks, so check it by eye before keeping it.

- **Fish jitter:** `FishController` sets a new random `translate` every tick with `transition: translate 0.1s linear`, so each fish starts a new transition 25 times a second.
  - Swap it for a CSS keyframe wobble on `translate`, with a random `animation-delay` and duration per fish. The browser can run that off the main thread, with no work per tick.
  - Or pick a new jitter every 3–4 ticks with a matching transition length.
  - `TriggerFishController` and `FriedEggFish` copy the same pattern.
- **Starfish glow:** on-screen starfish rebuild a `filter` of `drop-shadow`, `brightness` and `hue-rotate` every tick. `drop-shadow` is also slow to paint.
  - Draw the glow as a pre-blurred child image, or a pseudo-element, and pulse its `opacity` with a CSS animation. Keep `hue-rotate` as a filter that only changes when a starfish respawns.
  - The bob and wobble (`y`, `rotation`) could be a CSS animation too. Hit testing would still work, since `getBoundingClientRect` includes animated transforms.
- **Light rays:** the `lightRay` opacity animation runs on the main thread, about 600 style recalcs a second for 10 rays. Making its keyframe a literal (no `var(--fade-opacity)`) didn't change that, so the cause is something else.
  - Look in real Chrome with a GPU (DevTools → Performance → "Non-composited animations", or the Animations panel). Suspects are the `filter: blur()` on the same element and `left: calc(var(--ray) …)`. Headless Chrome may also composite less than a real browser.
  - Animating `opacity` on a blurred wrapper or child, rather than on the element that has the filter, may let it be composited.
  - Bug: `width: () => Math.random() * 30 + 70` and the random `animation-delay` are re-rolled whenever the ray's style recomputes (when it wraps around the screen). Pick them once in `init`.
- **Plant sway:** in the Cave, about 80 plants set `rotation` every tick. A CSS keyframe sway with a random delay per plant would remove that per-tick work. Plants already wrap around the camera, so they're all on or near the screen.
- **Off-screen work in general:** `scene.isOnCanvas` could gate purely visual per-tick work for other creatures that roam the whole level. Check with the mutation counter (below) which ones write styles while off screen, especially in the realm levels. A generic engine-level cull is riskier, because `hitTest` reads the DOM and a hidden element has an empty rect.
- **Maths-based hitTest:** most hit tests are between unrotated boxes and could use `x`/`y`/`width`/`height` directly, with no DOM read and no 1-tick lag. Rotated children such as the diver's arms (used for catching starfish) would need their transform chain worked out, or keep the DOM check.
- **Solid rects per tick:** `getSolidControllerRects()` builds a new array for every `blockedBySolid` controller each tick. Build it once per tick and reuse it. This is small now, but grows with more solid walls or divers in multiplayer.
- **Not yet profiled:** the realm levels (Corgosphere, Trigger Fish Lair, Fried Egg, Depths, Hell), the Surface, and Multiplayer with several Puppets.
- **Real devices:** all numbers so far come from headless Chrome on an M-series Mac. Check a phone, especially Safari, where filters like `drop-shadow` and `blur` cost more on the GPU.
- **Benchmark harness:** the Playwright scripts used for this weren't added to the repo. A `scripts/bench` that builds, opens each level from a saved game, and reports Chrome's `Performance.getMetrics` per second would make regressions easy to catch. Useful pieces:
  - A `MutationObserver` that counts style writes per `data-controller-type`, for finding which controllers write the most.
  - A trace with `disabled-by-default-devtools.timeline.invalidationTracking`, which says why elements are restyled.
- **Load time and memory:** the biggest images are PNGs of 0.8–1.9 MB: the two menu backgrounds, the scrambled egg monster, the cave wall and `alert`. WebP or AVIF would cut download size, the PWA precache (about 26 MB) and decode time. The 2.6 MB `ocean1.mp3` is the largest file of all. This doesn't affect frame time.
