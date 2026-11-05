import { JSX } from 'solid-js'
import { Scene } from '@/engine'
import { generateFrames } from '@/utils'
import { equalisationSound, spaceCorgiAsset, spaceCrabAsset, spaceFishAsset, thudSound } from '@/assets'
import { RealmDialogs } from '../../data/Dialogs'
import { createAirPocketController, isInAirPocket, AirPocketController } from '../../controllers/realm/AirController'
import {
  createAsteroidController,
  createDrifterController,
  createSpaceJellyfishController,
  createSpaceOctopusController,
  createSpaceUrchinController,
} from '../../controllers/realm/SpaceControllers'
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

const bounds = { x: 0, y: 0, width: 4200, height: 2100 }

// Oxygen in an Air Pocket fills from empty in about 2s, and outside one it runs out in about 3s.
// At full speed that's about 750px, enough for the widest gap between pockets (about 280px)
// with time to dodge, but not to wander far from the path
const refillPerFrame = 100 / seconds(2)
const drainPerFrame = 100 / seconds(3)

// The maze of Air Pockets, as [x, y, radius], snaking right, back left and right again
const pockets: [number, number, number][] = [
  [250, 350, 220], [700, 250, 150], [1150, 420, 165], [1620, 290, 140], [2080, 450, 170],
  [2540, 280, 135], [3000, 400, 155], [3460, 300, 145], [3920, 400, 190],
  [3960, 760, 140],
  [3850, 1110, 185], [3350, 1000, 135], [2860, 1180, 145], [2360, 1040, 125], [1870, 1160, 150],
  [1370, 980, 125], [880, 1120, 140], [380, 1080, 180],
  [290, 1450, 140],
  [380, 1800, 170], [880, 1690, 125], [1380, 1850, 130], [1880, 1710, 120], [2380, 1880, 130],
  [2870, 1740, 120], [3360, 1830, 130], [3880, 1780, 250],
]

// Hazards sit in the gaps between pockets, so each crossing needs a little care
const urchins: Vector[] = [
  { x: 470, y: 270 }, { x: 1390, y: 380 }, { x: 2320, y: 340 }, { x: 3230, y: 380 },
  { x: 3620, y: 1080 }, { x: 2610, y: 1120 }, { x: 1620, y: 1050 }, { x: 640, y: 1130 },
  { x: 630, y: 1760 }, { x: 1630, y: 1790 }, { x: 2630, y: 1820 }, { x: 3120, y: 1770 },
]
const asteroids: { from: Vector, to: Vector, size?: number, speed?: number }[] = [
  { from: { x: 920, y: 80 }, to: { x: 920, y: 600 } },
  { from: { x: 1850, y: 100 }, to: { x: 1850, y: 650 }, speed: 0.008 },
  { from: { x: 2770, y: 80 }, to: { x: 2770, y: 620 }, size: 140 },
  { from: { x: 3700, y: 120 }, to: { x: 3700, y: 640 }, speed: 0.009 },
  { from: { x: 3700, y: 900 }, to: { x: 4150, y: 900 }, size: 90, speed: 0.01 },
  { from: { x: 3100, y: 820 }, to: { x: 3100, y: 1350 } },
  { from: { x: 2110, y: 850 }, to: { x: 2110, y: 1350 }, size: 140, speed: 0.008 },
  { from: { x: 1120, y: 830 }, to: { x: 1120, y: 1300 }, speed: 0.009 },
  { from: { x: 50, y: 1270 }, to: { x: 560, y: 1270 }, size: 90, speed: 0.01 },
  { from: { x: 1130, y: 1500 }, to: { x: 1130, y: 2050 }, size: 140 },
  { from: { x: 2130, y: 1500 }, to: { x: 2130, y: 2050 }, speed: 0.009 },
  { from: { x: 3620, y: 1500 }, to: { x: 3620, y: 2050 }, size: 120, speed: 0.01 },
]
const jellyfish: Vector[] = [
  { x: 1850, y: 380 }, { x: 3230, y: 160 }, { x: 3940, y: 590 }, { x: 3100, y: 1090 },
  { x: 1120, y: 1060 }, { x: 290, y: 1270 }, { x: 1130, y: 1770 }, { x: 2620, y: 1600 },
  { x: 3620, y: 1800 },
]

export function CorgosphereLevel(props: RealmLevelProps): RealmLevel {
  const realm = createRealm('corgosphere', props)
  const end = { x: 3880, y: 1780 }
  let endSaid = false

  const scene = new Scene('corgosphere', {
    ...props.state,
    width: 700,
    height: 700,
    setup($scene: Scene) {
      const airPockets: AirPocketController[] = pockets.map(([x, y, radius], n) =>
        createAirPocketController('air-pocket-' + n, { x, y, radius }),
      )
      airPockets.forEach(pocket => $scene.addController(pocket))

      addRealmArrival($scene, realm, {
        bounds,
        entry: { x: pockets[0][0], y: pockets[0][1] },
        diver: { equalise: false, oxygenUse: () => 0 },
        bubbles: false, // It's space
      })

      const guide = addRealmGuide($scene, {
        asset: spaceCorgiAsset,
        position: { x: pockets[0][0] + 60, y: pockets[0][1] - 120 },
        intro: RealmDialogs.corgosphere.intro,
        end: () => {
          if (!finish.found() || endSaid) return
          endSaid = true
          return { messages: RealmDialogs.corgosphere.end, pauseGameplay: true }
        },
      })

      const finish = addRealmFinish($scene, realm, {
        crystal: { x: end.x - 120, y: end.y - 40 },
        exit: { x: end.x + 100, y: end.y },
        // The guide pops over to the end of the maze to cheer you off
        onFound: () => guide.data.goTo({ x: end.x - 40, y: end.y - 160 }, { teleport: true }),
      })

      urchins.forEach((point, n) => $scene.addController(createSpaceUrchinController('space-urchin-' + n, point)))
      asteroids.forEach((asteroid, n) => $scene.addController(createAsteroidController('asteroid-' + n, asteroid)))
      jellyfish.forEach((point, n) => $scene.addController(createSpaceJellyfishController('space-jellyfish-' + n, point)))

      Array(10).fill(null).forEach((_, n) => $scene.addController(createSpaceOctopusController('space-octopus-' + n, {
        x: bounds.x + 200 + Math.random() * (bounds.width - 400),
        y: bounds.y + 200 + Math.random() * (bounds.height - 400),
        bounds,
      })))

      Array(14).fill(null).forEach((_, n) => {
        const fish = n % 2 === 0
        $scene.addController(createDrifterController('space-scenery-' + n, {
          x: Math.random() * bounds.width,
          y: Math.random() * bounds.height,
          frames: fish
            ? generateFrames(spaceFishAsset, 157, 150, 40, 1)
            : generateFrames(spaceCrabAsset, 150, 127, 48, 4),
          width: fish ? 40 : 48,
          height: fish ? 38 : 40,
          bounds,
          speed: { x: (Math.random() + 0.3) * (Math.random() > 0.5 ? 1 : -1), y: fish ? 0 : 0.3 },
          spin: fish ? 0 : 0.8,
        }))
      })

      // Breathing: quick to fill inside an Air Pocket, quick to run out anywhere else
      $scene.addController(createRealmDirector('breathing', ({ $scene }) => {
        if (realm.ending()) return
        const change = isInAirPocket(airPockets, $scene) ? refillPerFrame : -drainPerFrame
        $scene.setGameState('diver', 'oxygen', oxygen => Math.max(0, Math.min(100, oxygen + change)))
      }))
    },
    afterEnterFrames: ({ $scene }) => followDiver($scene, bounds),
    assetOrder: [
      ['bubble'],
      ['asteroid', 'space-urchin', 'space-jellyfish'],
      ['crystal-corgi'],
      ['corgi', 'diver'],
      ['realm-guide'],
      ['drifter', 'space-octopus'],
      ['air-pocket'],
      ['portal-vortex', 'portal'],
    ],
    sounds: {
      thud: thudSound,
      equalisation: equalisationSound,
    },
  })

  const style = () => {
    const canvas = scene.canvas.get()
    const x = canvas.x()
    const y = canvas.y()
    return {
      'background-image': `
        radial-gradient(1.5px 1.5px at 20px 30px, #ffffff, transparent),
        radial-gradient(1px 1px at 90px 120px, #ffffffcc, transparent),
        radial-gradient(2px 2px at 160px 60px, #ffe9a8, transparent),
        radial-gradient(1px 1px at 130px 180px, #ffffffaa, transparent),
        radial-gradient(1.5px 1.5px at 40px 160px, #b8d8ff, transparent),
        radial-gradient(1px 1px at 300px 80px, #ffffff88, transparent),
        radial-gradient(1px 1px at 220px 260px, #ffffff88, transparent),
        radial-gradient(400px 300px at 70% 30%, #4b1d6b55, transparent),
        linear-gradient(180deg, #05030f 0%, #120a2a 50%, #1a0c33 100%)
      `,
      'background-size': '200px 200px, 200px 200px, 200px 200px, 200px 200px, 200px 200px, 360px 320px, 360px 320px, 100% 100%, 100% 100%',
      'background-position': `
        ${-x / 4}px ${-y / 4}px,
        ${-x / 4}px ${-y / 4}px,
        ${-x / 4}px ${-y / 4}px,
        ${-x / 4}px ${-y / 4}px,
        ${-x / 4}px ${-y / 4}px,
        ${-x / 8}px ${-y / 8}px,
        ${-x / 8}px ${-y / 8}px,
        0 0,
        0 0
      `,
    } satisfies JSX.CSSProperties
  }

  return { scene, style, music: () => 'corgosphere' }
}
