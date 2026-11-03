import { Scene } from "@/engine"
import { useGameState } from "@/utils/GameStateContext"
import { createDiverController, DiverController, readDiverPose } from "../../controllers/main/DiverController"
import { createCorgiController, CorgiController, readCorgiPose } from "../../controllers/main/CorgiController"
import { createWallController } from "../../controllers/scenary/WallController"
import { createLightRayController } from "../../controllers/scenary/LightRayController"
import { createBoxController } from "../../controllers/utils/BoxController"
import { depth1Asset, depth2Asset, depth3Asset, sandAsset, surfaceAsset } from "@/assets"
import { JSX } from "solid-js/jsx-runtime"
import { OCEAN } from "./data"
import { RoomSession } from "../../multiplayer/room"
import { skinFor } from "../../multiplayer/skins"
import { SlotColours } from "../../multiplayer/protocol"

const start = { x: 0, y: 15, rotation: 180 }
const sendEvery = 2 // Frames between pose updates, about 12 a second

export const puppetDiverId = (playerId: string) => `puppet-${playerId}`
export const puppetCorgiId = (playerId: string) => `puppet-${playerId}-corgi`

// The ocean of the first dive with every Character, creature and item taken out. Rooms take place here.
// It never touches the single-player save: no oxygen, no equalising, no surfacing and no score
export function EmptyOceanLevel(props: { session: RoomSession }) {
  const state = useGameState()!
  const slot = props.session.self()?.slot ?? 0
  const skin = skinFor(slot)
  let frame = 0

  const scene = new Scene('multiplayer', {
    ...state,
    width: 700,
    height: 700,
    pauseStopsGameplay: false, // One Player can't freeze a shared world
    setup($scene: Scene) {
      $scene.addController(createBoxController('floor', { x: -10000, y: 680, width: 20000, height: 100 }))
      $scene.addController(createDiverController('diver', {
        ...start,
        skin: skin.diver,
        canBreathe: true,
        equalise: false,
        spaceEqualises: false,
        canSurface: false,
      }))
      $scene.addController(...createWallController('wall-left', { x: OCEAN.minX - 500 }))
      $scene.addController(...createWallController('wall-right', { x: OCEAN.maxX - 20 }))
      $scene.addController(createCorgiController('corgi', {
        x: start.x + 10,
        y: start.y,
        skin: skin.corgi,
        crown: false,
      }))
      Array(10).fill(null).forEach((_, n) => {
        $scene.addController(createLightRayController('light-' + n, { x: n * 70 }))
      })
    },
    afterEnterFrames: ({ $scene }) => {
      const diver = $scene.getControllerById<DiverController>('diver')
      const corgi = $scene.getControllerById<CorgiController>('corgi')
      if (!diver || !corgi) return
      $scene.canvas.get().setX(diver.data.x() - $scene.canvas.get().width / 2 + diver.data.width() / 2)
      if (frame++ % sendEvery === 0) {
        props.session.sendPose({ diver: readDiverPose(diver), corgi: readCorgiPose(corgi) })
      }
    },
    // Your own diver and corgi are drawn in front of Puppets
    assetOrder: [
      ['bubble'],
      ['corgi', 'diver'],
      ['puppet-corgi', 'puppet-diver'],
      ['wall'],
    ],
    images: [
      depth1Asset, depth2Asset, depth3Asset, surfaceAsset, sandAsset,
      // Puppets arrive later, so load every suit colour up front
      ...SlotColours.flatMap((_, n) => [...Object.values(skinFor(n).diver), skinFor(n).corgi]),
    ],
  })

  const style = () => ({
    'background-image': `
      url(${sandAsset}),
      url(${depth1Asset}),
      url(${depth2Asset}),
      url(${depth3Asset}),
      linear-gradient(
        0deg,
        rgba(7, 0, 145, 1) 0%,
        rgba(10, 182, 250, 1) 90%,
        rgba(230, 240, 255, 1) 100%
      )
    `,
    'background-position': `
      ${-scene.canvas.get().x()}px bottom,
      ${-scene.canvas.get().x() / 1.5}px 85%,
      ${-scene.canvas.get().x() / 2.0}px 85%,
      ${-scene.canvas.get().x() / 2.5}px 85%,
      ${-scene.canvas.get().x()}px bottom
    `,
    'background-repeat': 'repeat-x',
    'background-size': '330px, 612px, 612px, 612px, cover',
  } satisfies JSX.CSSProperties)

  // Puppets come and go with the Room's roster
  const addPuppet = (playerId: string, slot: number) => {
    const skin = skinFor(slot)
    const pose = () => props.session.poseOf(playerId)
    scene.addController(createDiverController(puppetDiverId(playerId), {
      ...start,
      type: 'puppet-diver',
      skin: skin.diver,
      canBreathe: true,
      puppet: () => pose()?.diver,
    }))
    scene.addController(createCorgiController(puppetCorgiId(playerId), {
      x: start.x + 10,
      y: start.y,
      type: 'puppet-corgi',
      skin: skin.corgi,
      crown: false,
      puppet: () => pose()?.corgi,
    }))
  }

  const removePuppet = (playerId: string) => {
    scene.removeController(puppetDiverId(playerId))
    scene.removeController(puppetCorgiId(playerId))
  }

  return { scene, style, addPuppet, removePuppet }
}
