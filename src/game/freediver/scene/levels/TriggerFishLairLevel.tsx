import { createSignal, JSX } from 'solid-js'
import { Key, Scene } from '@/engine'
import { baitAsset, captainChumAsset, equalisationSound, rockAsset, surfaceAsset, thudSound } from '@/assets'
import { Translations } from '../../data/Translations'
import { RealmDialogs } from '../../data/Dialogs'
import {
  createBaitController,
  createLairTriggerFishController,
  createMiniTriggerFishController,
  createRockController,
} from '../../controllers/realm/LairControllers'
import { getDiver } from '../../controllers/realm/Hazard'
import { HudItem, HudStack } from '../../ui/RealmHud'
import {
  addRealmArrival,
  addRealmFinish,
  addRealmGuide,
  createRealm,
  createRealmDirector,
  followDiver,
  RealmLevel,
  RealmLevelProps,
  seconds,
} from './realm'

const bounds = { x: 0, y: 0, width: 5600, height: 2800 }
const startingBait = 10
const surfaceDepth = 150 // Breathe when your middle is this close to the top
const refillPerFrame = 100 / seconds(3)

// Great walls of rock hanging from the roof and rising from the floor, so the way through snakes deep and shallow
const rocks: Rect[] = [
  { x: 900, y: -100, width: 260, height: 2000 },
  { x: 1900, y: 850, width: 260, height: 2050 },
  { x: 2900, y: -100, width: 260, height: 2100 },
  { x: 3900, y: 800, width: 260, height: 2100 },
  { x: 4800, y: -100, width: 260, height: 2000 },
  // Boulders to weave around
  { x: 1400, y: 2350, width: 300, height: 500 },
  { x: 2450, y: 1300, width: 220, height: 260 },
  { x: 3400, y: 2400, width: 320, height: 450 },
  { x: 4400, y: 1500, width: 200, height: 240 },
]

const triggerFish: Vector[] = [
  { x: 1000, y: 2250 }, { x: 1150, y: 2550 }, { x: 1550, y: 1500 },
  { x: 2000, y: 450 }, { x: 2100, y: 650 },
  { x: 2950, y: 2300 }, { x: 3100, y: 2550 }, { x: 3550, y: 1600 },
  { x: 4000, y: 400 }, { x: 4100, y: 600 }, { x: 3950, y: 250 },
  { x: 4850, y: 2200 }, { x: 5000, y: 2500 }, { x: 4600, y: 2550 },
]
const miniTriggerFish: Vector[] = [
  { x: 650, y: 1300 }, { x: 1650, y: 900 }, { x: 2450, y: 900 }, { x: 2550, y: 1900 },
  { x: 3550, y: 600 }, { x: 4450, y: 1000 }, { x: 4500, y: 2100 }, { x: 5300, y: 1900 },
]

export function TriggerFishLairLevel(props: RealmLevelProps): RealmLevel {
  const realm = createRealm('triggerFishLair', props)
  const end = { x: 5330, y: 2450 }
  const [bait, setBait] = createSignal(0)
  const t = () => Translations[props.state.gameState.options.locale]
  let baitDropped = 0
  let baitKeyDown = false
  let endSaid = false

  const scene = new Scene('triggerFishLair', {
    ...props.state,
    width: 700,
    height: 700,
    setup($scene: Scene) {
      rocks.forEach((rect, n) => $scene.addController(createRockController('rock-' + n, { ...rect, asset: rockAsset })))

      addRealmArrival($scene, realm, {
        bounds,
        entry: { x: 350, y: 350 },
      })

      const guide = addRealmGuide($scene, {
        asset: captainChumAsset,
        position: { x: 480, y: 220 },
        intro: RealmDialogs.triggerFishLair.intro,
        onIntroComplete: () => setBait(startingBait),
        end: () => {
          if (!finish.found() || endSaid) return
          endSaid = true
          return { messages: RealmDialogs.triggerFishLair.end, pauseGameplay: true }
        },
      })

      const finish = addRealmFinish($scene, realm, {
        crystal: { x: end.x - 150, y: end.y - 20 },
        exit: { x: end.x + 60, y: end.y - 40 },
        onFound: () => guide.data.goTo({ x: end.x - 60, y: end.y - 200 }, { teleport: true }),
      })

      triggerFish.forEach((point, n) => $scene.addController(...createLairTriggerFishController('triggerfish-' + n, point)))
      miniTriggerFish.forEach((point, n) => $scene.addController(...createMiniTriggerFishController('mini-triggerfish-' + n, point)))

      $scene.addController(createRealmDirector('lair', ({ $scene }) => {
        const diver = getDiver($scene)
        if (!diver || realm.ending()) return
        const center = diver.data.center()

        // A surface to breathe at, though it doesn't lead anywhere
        if (center.y < surfaceDepth) {
          $scene.setGameState('diver', 'oxygen', oxygen => Math.min(100, oxygen + refillPerFrame))
        }

        // Drop bait on each press of E
        const pressed = Key.isDown('e') || Key.isDown('E')
        if (pressed && !baitKeyDown && bait() > 0) {
          setBait(bait() - 1)
          $scene.addController(createBaitController('bait-' + baitDropped++, {
            x: center.x,
            y: center.y + 40,
            floor: bounds.height,
          }))
        }
        baitKeyDown = pressed
      }))
    },
    afterEnterFrames: ({ $scene }) => followDiver($scene, bounds),
    assetOrder: [
      ['rock'],
      ['bubble', 'indicator'],
      ['triggerfish', 'mini-triggerfish'],
      ['bait'],
      ['crystal-corgi'],
      ['corgi', 'diver'],
      ['realm-guide'],
      ['portal-vortex', 'portal'],
    ],
    sounds: {
      thud: thudSound,
      equalisation: equalisationSound,
    },
    images: [surfaceAsset],
  })

  const style = () => {
    const canvas = scene.canvas.get()
    const x = canvas.x()
    const y = canvas.y()
    return {
      'background-image': `
        url(${surfaceAsset}),
        linear-gradient(
          180deg,
          #5fb3c9 0%,
          #2a6f87 15%,
          #144257 45%,
          #0a2433 75%,
          #040f17 100%
        )
      `,
      'background-repeat': 'repeat-x, no-repeat',
      'background-size': `auto 50px, 100% ${bounds.height}px`,
      'background-position': `${-x / 10}px ${-y}px, 0 ${-y}px`,
    } satisfies JSX.CSSProperties
  }

  const hud = () => <HudStack>
    <HudItem image={baitAsset} count={bait()} />
    <span style={{ 'font-size': '1rem', color: 'white' }}>{t().realms.bait}: E</span>
  </HudStack>

  return { scene, style, hud }
}
