import { Scene } from "@/engine"
import { useGameState } from "@/utils/GameStateContext"
import { alertAsset, equalisationSound, kingdomBackAsset, kingdomCeilingAsset, kingdomFloorAsset, kingdomMidAsset, starfishSound, thudSound } from "@/assets"
import { JSX } from "solid-js/jsx-runtime"
import { createBoxController } from "../../controllers/utils/BoxController"
import { KINGDOM } from "./data"
import { createTriggerController } from "../../controllers/utils/TriggerController"
import { createDiverController, DiverController } from "../../controllers/main/DiverController"
import { createCorgiController } from "../../controllers/main/CorgiController"
import {
  createCorgiCitizenController,
  createCorgiKingController,
  createGlowCoralController,
  createKingdomBannerController,
  createKingdomColumnController,
  createKingdomLanternController,
  createKingdomOpeningController,
  createKingdomPortalControllers,
  createKingdomThroneController,
  createKingdomWallController,
  throneSize,
} from "../../controllers/scenary/KingdomController"

export function KingdomLevel(props: {
  setScene: (scene: string, mode?: string) => void
  state: NonNullable<ReturnType<typeof useGameState>>
  mode?: string
}) {
  const { hole } = KINGDOM
  const holeCenter = hole.x + hole.width / 2
  const throneX = 1650
  const throneCenter = throneX + throneSize.width / 2

  const scene = new Scene('kingdom', {
    ...props.state,
    width: 700,
    height: 700,
    setup($scene: Scene) {
      // Always arrive through the hole in the ceiling, heading down
      const diverStart = { x: holeCenter - 34, y: 130, rotation: 180 }

      // Cavern roof with a gap leading back up to the statue
      $scene.addController(createBoxController('ceiling-left', {
        x: KINGDOM.minX - 1000, y: -1000, width: hole.x - KINGDOM.minX + 1000, height: 1110,
      }))
      $scene.addController(createBoxController('ceiling-right', {
        x: hole.x + hole.width, y: -1000, width: KINGDOM.maxX - hole.x - hole.width + 1000, height: 1110,
      }))
      // Keeps the diver from reaching the surface check, the exit trigger fires first
      $scene.addController(createBoxController('ceiling-hole-cap', {
        x: hole.x, y: -1000, width: hole.width, height: 955,
      }))
      $scene.addController(createBoxController('floor', {
        x: KINGDOM.minX - 1000, y: 680, width: KINGDOM.maxX - KINGDOM.minX + 2000, height: 100,
      }))
      $scene.addController(createKingdomWallController('wall-left', { edge: KINGDOM.minX, side: 'left' }))
      $scene.addController(createKingdomWallController('wall-right', { edge: KINGDOM.maxX, side: 'right' }))
      $scene.addController(createKingdomOpeningController('opening', { x: holeCenter - 150 }))

      ;[380, 960, 1430, 2000].forEach((x, n) => {
        $scene.addController(createKingdomColumnController('column-' + n, { x }))
      })

      const banners: [number, 'red' | 'purple'][] = [
        [180, 'red'], [600, 'purple'], [780, 'red'], [1350, 'purple'],
        [1535, 'red'], [1905, 'purple'], [2220, 'red'],
      ]
      banners.forEach(([x, color], n) => {
        $scene.addController(createKingdomBannerController('banner-' + n, { x, color }))
      })

      ;[300, 690, throneCenter - 30, 2110].forEach((x, n) => {
        $scene.addController(createKingdomLanternController('lantern-' + n, { x }))
      })

      const corals: [number, number, number][] = [
        [140, 0.7, 0], [520, 0.6, 60], [860, 0.8, 0], [1290, 0.5, -40],
        [1560, 0.7, 60], [1900, 0.8, -40], [2280, 0.6, 0],
      ]
      corals.forEach(([x, scale, hue], n) => {
        $scene.addController(createGlowCoralController('glow-coral-' + n, { x, scale, hue }))
      })

      // The royal court
      $scene.addController(...createKingdomPortalControllers('portal', { x: throneCenter - 140, y: 270 }))
      $scene.addController(createKingdomThroneController('throne', { x: throneX }))
      $scene.addController(createCorgiKingController('corgi-king', {
        x: throneX + 40,
        y: 690 - throneSize.height + throneSize.seatY - 65,
      }))
      const citizens: [number, number, number, number, number, 'pembroke' | 'cardigan'][] = [
        [150, 950, 280, 1, 1.2, 'pembroke'],
        [500, 1050, 470, 0.85, 1, 'cardigan'],
        [1300, 2250, 360, 1.1, 1.5, 'pembroke'],
        [1500, 1950, 560, 0.6, 0.9, 'cardigan'],
      ]
      citizens.forEach(([from, to, y, scale, speed, breed], n) => {
        $scene.addController(createCorgiCitizenController('corgi-citizen-' + n, { from, to, y, scale, speed, breed }))
      })

      $scene.addController(createDiverController('diver', {
        x: diverStart.x,
        y: diverStart.y,
        rotation: diverStart.rotation,
        depthOffset: KINGDOM.depthOffset,
        canBreathe: true,
        blackout: () => {
          scene.gameStateActions.blackout()
          props.setScene('blackout')
        },
      }))
      $scene.addController(createCorgiController('corgi', { x: diverStart.x + 10, y: diverStart.y }))

      $scene.addController(createTriggerController('exit', {
        x: hole.x,
        y: -40,
        width: hole.width,
        height: 60,
        targets: [$scene.getControllerById('diver')!],
        trigger: () => {
          props.setScene('cave', 'kingdom')
        }
      }))
    },
    afterEnterFrames: ({ $scene }) => {
      const diver = $scene.getControllerById<DiverController>('diver')
      // Center camera, without looking past the castle walls
      if (diver) {
        const canvas = $scene.canvas.get()
        const x = diver.data.x() - canvas.width / 2 + diver.data.width() / 2
        canvas.setX(Math.max(KINGDOM.minX - 200, Math.min(KINGDOM.maxX + 200 - canvas.width, x)))
      }
    },
    assetOrder: [
      [
        // In front of everyone, so you swim behind them
        'kingdom-column',
      ],
      [
        'bubble',
      ],
      [
        'corgi',
        'diver',
      ],
      [
        'corgi-citizen',
        'corgi-king',
      ],
      [
        'kingdom-throne',
        'glow-coral',
        'kingdom-banner',
        'kingdom-lantern',
      ],
      [
        'kingdom-portal-vortex',
        'kingdom-portal',
      ],
      [
        'kingdom-wall',
        'kingdom-opening',
      ],
    ],
    sounds: {
      thud: thudSound,
      starfish: starfishSound,
      equalisation: equalisationSound,
    },
    images: [kingdomBackAsset, kingdomMidAsset, kingdomCeilingAsset, kingdomFloorAsset, alertAsset],
  })

  const style = () => {
    const x = scene.canvas.get().x()
    return {
      'background-image': `
        url(${kingdomCeilingAsset}),
        url(${kingdomFloorAsset}),
        url(${kingdomMidAsset}),
        url(${kingdomBackAsset}),
        radial-gradient(
          260px 560px at ${holeCenter - x}px 0px,
          rgba(150, 230, 180, 0.3),
          rgba(150, 230, 180, 0) 100%
        ),
        radial-gradient(
          320px 260px at ${throneCenter - x}px 560px,
          rgba(255, 200, 90, 0.22),
          rgba(255, 200, 90, 0) 100%
        ),
        linear-gradient(
          180deg,
          #2A5853 0%,
          #1A4046 40%,
          #0E262C 75%,
          #07161B 100%
        )
      `,
      'background-position': `
        ${-x}px top,
        ${-x}px bottom,
        ${-x / 1.5}px top,
        ${-x / 2.5}px top,
        0 0,
        0 0,
        0 0
      `,
      'background-repeat': 'repeat-x',
      'background-size': '700px 200px, 700px 120px, 1000px 700px, 1400px 700px, cover, cover, cover',
    } satisfies JSX.CSSProperties
  }

  return { scene, style, surface: false }
}
