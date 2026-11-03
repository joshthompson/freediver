import { createSignal, JSX } from 'solid-js'
import { createController, Scene } from '@/engine'
import { createObjectSignal } from '@/engine/utils'
import { buoyAsset, emptyAsset, equalisationSound, judgeCorgiAsset, ropeSegmentAsset, surfaceAsset, thudSound } from '@/assets'
import { RealmDialogs } from '../../data/Dialogs'
import { getDiver } from '../../controllers/realm/Hazard'
import {
  addRealmArrival,
  addRealmFinish,
  addRealmGuide,
  createRealm,
  createRealmDirector,
  followDiver,
  RealmLevel,
  RealmLevelProps,
} from './realm'

const pxInMeter = 40
const bottomDepth = 100
const ropeX = 350
const ropeBottom = bottomDepth * pxInMeter
const bounds = { x: 0, y: 0, width: 700, height: ropeBottom + 250 }
const surfaceDepth = 140 // Your middle is at the surface when this close to the top

// Oxygen goes faster the deeper you are. A diver who equalises well reaches the bottom with about 55% left,
// and surfaces with about 10%
const oxygenUse = (depth: number) => 0.7 + depth / 40

// A long, rigid competition rope hanging from the buoy down to the bottom plate
function createRopeController(id: string) {
  return createController({
    frames: [emptyAsset],
    init() {
      return {
        id,
        type: 'rope',
        x: () => ropeX - 6,
        y: () => 60,
        width: () => 12,
        height: () => ropeBottom - 60,
        children: () => <div style={{
          width: '100%',
          height: '100%',
          'background-image': `url(${ropeSegmentAsset})`,
          'background-size': '12px 48px',
          'background-repeat': 'repeat-y',
        }} />,
      }
    },
  })
}

function createBuoyController(id: string) {
  return createController({
    frames: [buoyAsset],
    init() {
      return {
        id,
        type: 'buoy',
        x: () => ropeX - 60,
        ...createObjectSignal(-30, 'y'),
        width: () => 120,
        height: () => 102,
      }
    },
    onEnterFrame({ $, $age }) {
      $.setY(-30 + Math.sin($age / 15) * 3)
    },
  })
}

export function DepthsLevel(props: RealmLevelProps): RealmLevel {
  const realm = createRealm('depths', props)
  const [surfaced, setSurfaced] = createSignal(false) // Back up with the Black Crystal Corgi
  let diving = false // Once you've left the surface, it's all one breath
  let endSaid = false

  const scene = new Scene('depths', {
    ...props.state,
    width: 700,
    height: 700,
    setup($scene: Scene) {
      $scene.addController(createRopeController('rope'))
      $scene.addController(createBuoyController('buoy'))

      addRealmArrival($scene, realm, {
        bounds,
        entry: { x: 160, y: 170 },
        diver: {
          oxygenUse: depth => diving ? oxygenUse(depth) : 0,
        },
      })

      addRealmGuide($scene, {
        asset: judgeCorgiAsset,
        position: { x: 250, y: 30 },
        intro: RealmDialogs.depths.intro,
        end: () => {
          if (!surfaced() || endSaid) return
          endSaid = true
          return { messages: RealmDialogs.depths.end, pauseGameplay: true }
        },
      })

      const finish = addRealmFinish($scene, realm, {
        crystal: { x: ropeX - 42, y: ropeBottom - 40 },
        exit: { x: 160, y: 170 },
        exitOpen: () => surfaced() && endSaid,
      })

      $scene.addController(createRealmDirector('dive', ({ $scene }) => {
        const diver = getDiver($scene)
        if (!diver || realm.ending()) return
        const atSurface = diver.data.center().y < surfaceDepth
        if (!atSurface) {
          diving = true
          return
        }
        diving = false
        if (finish.found()) setSurfaced(true)
        // Came up without it, so breathe up and try again
        else $scene.setGameState('diver', 'oxygen', oxygen => Math.min(100, oxygen + 1))
      }))
    },
    afterEnterFrames: ({ $scene }) => followDiver($scene, bounds),
    assetOrder: [
      ['bubble'],
      ['crystal-corgi'],
      ['corgi', 'diver'],
      ['realm-guide'],
      ['buoy'],
      ['rope'],
      ['portal-vortex', 'portal'],
    ],
    sounds: {
      thud: thudSound,
      equalisation: equalisationSound,
    },
    images: [surfaceAsset, ropeSegmentAsset],
  })

  const style = () => {
    const y = scene.canvas.get().y()
    return {
      'background-image': `
        url(${surfaceAsset}),
        linear-gradient(
          180deg,
          #7fd3e8 0%,
          #2f8fb0 8%,
          #155c80 25%,
          #0b2f4a 50%,
          #04121f 75%,
          #000000 100%
        )
      `,
      'background-repeat': 'repeat-x, no-repeat',
      'background-size': `auto 50px, 100% ${bounds.height}px`,
      'background-position': `0 ${-y}px, 0 ${-y}px`,
    } satisfies JSX.CSSProperties
  }

  return { scene, style }
}
