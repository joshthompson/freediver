import { Scene } from "@/engine"
import { useGameState } from "@/utils/GameStateContext"
import { createWhaleController } from "../../controllers/WhaleController"
import { createWhaleSharkController } from "../../controllers/WhaleSharkController"
import { createSharkController } from "../../controllers/SharkController"
import { createWreckController } from "../../controllers/WreckController"
import { createDiverController, DiverController } from "../../controllers/DiverController"
import { createWallController } from "../../controllers/WallController"
import { createCorgiController } from "../../controllers/CorgiController"
import { createRopeController } from "../../controllers/RopeController"
import { createFriedEggFishController } from "../../controllers/FriedEggFish"
import { createCowController } from "../../controllers/CowController"
import { createManateeController } from "../../controllers/ManateeController"
import { createBoneController } from "../../controllers/BoneController"
import { createStarfishController } from "../../controllers/StarFishController"
import { createFishController } from "../../controllers/FishController"
import { createLightRayController } from "../../controllers/LightRayController"
import { createCrabController } from "../../controllers/CrabController"
import { createOctopusController } from "../../controllers/OctopusController"
import { alertAsset, depth1Asset, depth2Asset, depth3Asset, equalisationSound, sandAsset, starfishSound, surfaceAsset, thudSound } from "@/assets"
import { JSX } from "solid-js/jsx-runtime"

export const OCEAN = {
  minX: -4000,
  maxX: 8000,
} as const

export function OceanLevel(props: {
  setScene: (scene: string) => void
}) {
  const state = useGameState()!

  const scene = new Scene('ocean', {
    ...state!,
    width: 700,
    height: 700,
    setup($scene: Scene) {
      const diverX = $scene.gameState.diver.x
      $scene.addController(createWhaleController('whale'))
      $scene.addController(createWhaleSharkController('whale-shark'))
      $scene.addController(createSharkController('shark'))
      $scene.addController(createWreckController('wreck'))
      $scene.addController(...createDiverController('diver', {
        x: diverX,
        goToSurface: x => {
          props.setScene('surface')
          $scene.setGameState('diver', 'x', x)
          if ($scene.gameState.diver.oxygen <= 1) {
            scene.gameStateActions.achievement('almostFaint')
          }
        },
        blackout: () => {
          scene.setGameState('score', 'currentDive', 0)
          scene.setGameState('diver', 'x', 0)
          props.setScene('blackout')
          scene.gameStateActions.achievement('blackout')
        },
        maxX: (y) => {
          if (state.gameState.questState.cave.state === 'open') {
            return y > 300 && y < 500 ? OCEAN.maxX + 200 : OCEAN.maxX
          } else {
            return OCEAN.maxX
          }
        },
        minX: OCEAN.minX,
      }))
      $scene.addController(...createWallController('wall-left', { x: OCEAN.minX - 500 }))
      $scene.addController(...createWallController('wall-right', { x: OCEAN.maxX - 20, cave: 'left' }))
      const corgi = createCorgiController('corgi', { x: diverX + 10 })
      $scene.addController(corgi)
      $scene.addController(createRopeController('rope'))
      $scene.addController(...createFriedEggFishController('fried-egg-fish-1', { x: -2000 }))
      $scene.addController(...createFriedEggFishController('fried-egg-fish-2', { x: 4000 }))
      $scene.addController(createCowController('cow', {
        x: state.gameState.questState.cow.x,
      }))
      $scene.addController(createManateeController('manatee', {
        x: state.gameState.questState.cow.state === 'reunited'
          ? state.gameState.questState.cow.x
          : OCEAN.maxX + 80,
        y: 475,
      }))
      
      const totalBones = state.gameState.questState.corgi.bones.length
      const boneGap = (OCEAN.maxX - OCEAN.minX - 1000) / (totalBones - 1)
      const boneStart = OCEAN.minX + 500
      Array(totalBones).fill(null).forEach((_, n) => {
        const bone = state.gameState.questState.corgi.bones[n]
        if (bone !== 'delivered') {
          $scene.addController(createBoneController('bone-' + n, {
            x: boneStart + boneGap * n + Math.random() * 400 - 200,
            n: n,
            boneNumber: bone,
            corgi,
          }))
        }
      })

      const totalStarfish = 30
      const starfishMargin = 500
      Array(totalStarfish).fill(null).forEach((_, n) => {
        const totalSpace = OCEAN.maxX - OCEAN.minX - starfishMargin * 2
        const gap = totalSpace / (totalStarfish - 1)
        const x = OCEAN.minX + starfishMargin + n * gap
        $scene.addController(createStarfishController('starfish-' + n, {
          x: x + Math.random() * 300 - 150,
        }) )
      })

      Array(20).fill(null).forEach((_, n) => {
        $scene.addController(createFishController('fish-' + n, {
          x: Math.random() * 700 - 350 + diverX,
          y: Math.random() * 500 + 100,
        }))
      })

      Array(10).fill(null).forEach((_, n) => {
        $scene.addController(createLightRayController('light-' + n, { x: n * 70 }))
      })
    
      const crabs = Array(3).fill(null).map((_, n) => 
        createCrabController('crab-' + n, {
          x: -100 + n * 200 + Math.random() * 200 + diverX,
        })
      ).sort((a, b) => a.data.y() - b.data.y())
      crabs.forEach(crab => $scene.addController(crab))
    
      const octopi = Array(4).fill(null).map((_, n) => 
        createOctopusController('octopus-' + n, {
          x: Math.random() * 700 - 350 + diverX,
          y: Math.random() * 500 + 100,
        })
      ).sort((a, b) => b.data.y() - a.data.y())
      octopi.forEach(octopus => $scene.addController(octopus))
    },
    afterEnterFrames: ({ $scene }) => {
      const diver = $scene.getControllerById<DiverController>('diver')
      // Center camera
      if (diver) {
        $scene.canvas.get().setX(diver.data.x() - $scene.canvas.get().width / 2 + diver.data.width() / 2)
      }
    },
    assetOrder: [
      [
        'fish',
        'triggerfish',
        'friedeggfish',
        'octopus',
        'crab',
        'bone',
        'bubble',
      ],
      [
        'wall-fg',
      ],
      [
        'corgi',
        'diver-arm-left',
        'diver',
        'diver-head',
        'diver-arm-right',
      ],
      [
        'cow',
        'manatee',
      ],
      [
        'wreck',
        'wall',
      ],
      [
        'shark',
        'whale-shark',
        'whale',
      ],
    ],
    sounds: {
      thud: thudSound,
      starfish: starfishSound,
      equalisation: equalisationSound,
    },
    images: [depth1Asset, depth2Asset, depth3Asset, surfaceAsset, sandAsset, alertAsset],
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

  return { scene, style, surface: true }
}
