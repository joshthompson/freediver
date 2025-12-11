import { Scene } from "@/engine"
import { useGameState } from "@/utils/GameStateContext"
import { createWhaleController } from "../../controllers/creature/WhaleController"
import { createWhaleSharkController } from "../../controllers/creature/WhaleSharkController"
import { createSharkController } from "../../controllers/creature/SharkController"
import { createWreckController } from "../../controllers/scenary/WreckController"
import { createDiverController, DiverController } from "../../controllers/main/DiverController"
import { createWallController } from "../../controllers/scenary/WallController"
import { createCorgiController } from "../../controllers/main/CorgiController"
import { createRopeController } from "../../controllers/scenary/RopeController"
import { createFriedEggFishController } from "../../controllers/creature/FriedEggFish"
import { createCowController } from "../../controllers/creature/CowController"
import { createManateeController } from "../../controllers/creature/ManateeController"
import { createBoneController } from "../../controllers/scenary/BoneController"
import { createStarfishController } from "../../controllers/creature/StarFishController"
import { createFishController } from "../../controllers/creature/FishController"
import { createLightRayController } from "../../controllers/scenary/LightRayController"
import { createCrabController } from "../../controllers/creature/CrabController"
import { createOctopusController } from "../../controllers/creature/OctopusController"
import { alertAsset, depth1Asset, depth2Asset, depth3Asset, equalisationSound, sandAsset, starfishSound, surfaceAsset, thudSound } from "@/assets"
import { JSX } from "solid-js/jsx-runtime"
import { createBoxController } from "../../controllers/utils/BoxController"
import { OCEAN } from "./data"
import { createTriggerController } from "../../controllers/utils/TriggerController"

export function OceanLevel(props: {
  setScene: (scene: string, mode?: string) => void
  state: NonNullable<ReturnType<typeof useGameState>>
  mode?: string
}) {
  const state = useGameState()!

  const scene = new Scene('ocean', {
    ...state!,
    width: 700,
    height: 700,
    setup($scene: Scene) {
      props.state.setGameState('diver', 'level', 'ocean')
      
      const diverStart = props.mode === 'cave'
        ? { x: OCEAN.maxX + 100, y: 500, rotation: -90 }
        : { x: $scene.gameState.diver.x, rotation: 180 }

      $scene.addController(createBoxController('floor', { x: -10000, y: 680, width: 20000, height: 100 }))
      $scene.addController(createWhaleController('whale'))
      $scene.addController(createWhaleSharkController('whale-shark'))
      $scene.addController(createSharkController('shark'))
      $scene.addController(createWreckController('wreck'))
      $scene.addController(createDiverController('diver', {
        x: diverStart.x,
        y: diverStart.y,
        rotation: diverStart.rotation,
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
      }))
      $scene.addController(createTriggerController('trigger-1', {
        x: OCEAN.maxX + 250,
        y: 500,
        width: 100,
        height: 100,
        targets: [$scene.getControllerById('diver')!],
        trigger: () => {
          props.setScene('cave', 'ocean')
        }
      }))
      $scene.addController(...createWallController('wall-left', { x: OCEAN.minX - 500 }))
      $scene.addController(...createWallController('wall-right', {
        x: OCEAN.maxX - 20,
        cave: 'left',
        open: () => state.gameState.questState.cave.state === 'open'
      }))
      const corgi = createCorgiController('corgi', { x: diverStart.x + 10, y: diverStart.y })
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
            boneId: n,
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
          x: Math.random() * 700 - 350 + diverStart.x,
          y: Math.random() * 500 + 100,
        }))
      })

      Array(10).fill(null).forEach((_, n) => {
        $scene.addController(createLightRayController('light-' + n, { x: n * 70 }))
      })
    
      const crabs = Array(3).fill(null).map((_, n) => 
        createCrabController('crab-' + n, {
          x: -100 + n * 200 + Math.random() * 200 + diverStart.x,
        })
      ).sort((a, b) => a.data.y() - b.data.y())
      crabs.forEach(crab => $scene.addController(crab))
    
      const octopi = Array(4).fill(null).map((_, n) => 
        createOctopusController('octopus-' + n, {
          x: Math.random() * 700 - 350 + diverStart.x,
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
