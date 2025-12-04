import { Scene } from "@/engine"
import { useGameState } from "@/utils/GameStateContext"
import { createStatueController } from "../../controllers/StatueController"
import { createDiverController, DiverController } from "../../controllers/DiverController"
import { createCorgiController } from "../../controllers/CorgiController"
import { createTriggerFishController } from "../../controllers/TriggerFishController"
import { createFishController } from "../../controllers/FishController"
import { createLightRayController } from "../../controllers/LightRayController"
import { createCrabController } from "../../controllers/CrabController"
import { createOctopusController } from "../../controllers/OctopusController"
import { alertAsset, depth1Asset, depth2Asset, depth3Asset, equalisationSound, mudAsset, starfishSound, surfaceAsset, thudSound } from "@/assets"
import { JSX } from "solid-js/jsx-runtime"
import { createPlantController } from "../../controllers/PlantController"

export const CAVE = {
  minX: -10000,
  maxX: 10000,
} as const

export function CaveLevel(props: {
  setScene: (scene: string) => void
}) {
  const state = useGameState()!

  const scene = new Scene('ocean', {
    ...state!,
    width: 700,
    height: 700,
    setup($scene: Scene) {
      const diverX = $scene.gameState.diver.x
      $scene.addController(createStatueController('statue'))
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
            return y > 300 && y < 500 ? CAVE.maxX + 200 : CAVE.maxX
          } else {
            return CAVE.maxX
          }
        },
        minX: CAVE.minX,
      }))

      const plants = Array(40).fill(null)
        .map((_, n) => createPlantController('plant-' + n, { x: n * 50 }))
        .sort((a, b) => a[0].data.y() - b[0].data.y())
      plants.forEach(plant => $scene.addController(...plant))

      $scene.addController(createCorgiController('corgi', { x: diverX + 10 }))
      $scene.addController(...createTriggerFishController('triggerfish-1', { x: 2000 }))
      $scene.addController(...createTriggerFishController('triggerfish-2', { x: 6000 }))

      
      // const totalBones = 20
      // const boneGap = 1000
      // Array(totalBones).fill(null).forEach((_, n) => {
      //   const x = n < totalBones / 2
      //     ? 0 + (n + 1) * boneGap
      //     : 0 - (n - totalBones / 2 + 1) * boneGap
      //   $scene.addController(createBoneController('bone-' + n, { x: x + Math.random() * 200 - 100 }) )
      // })

      // const totalStarfish = 30
      // const starfishMargin = 500
      // Array(totalStarfish).fill(null).forEach((_, n) => {
      //   const totalSpace = maxX - minX - starfishMargin * 2
      //   const gap = totalSpace / (totalStarfish - 1)
      //   const x = minX + starfishMargin + n * gap
      //   $scene.addController(createStarfishController('starfish-' + n, {
      //     x: x + Math.random() * 300 - 150,
      //   }) )
      // })

      Array(1).fill(null).forEach((_, n) => {
        $scene.addController(createFishController('fish-' + n, {
          x: Math.random() * 700 - 350 + diverX,
          y: Math.random() * 500 + 100,
        }))
      })

      Array(10).fill(null).forEach((_, n) => {
        $scene.addController(createLightRayController('light-' + n, { x: n * 70, type: n % 2 ? 'green' : 'white' }))
      })
    
      const crabs = Array(1).fill(null).map((_, n) => 
        createCrabController('crab-' + n, {
          x: -100 + n * 200 + Math.random() * 200 + diverX,
        })
      ).sort((a, b) => a.data.y() - b.data.y())
      crabs.forEach(crab => $scene.addController(crab))
    
      const octopi = Array(12).fill(null).map((_, n) => 
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
        'plant-fg',
      ],
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
        'statue',
        'wall',
      ],
      [
        'plant-bg',
      ],
    ],
    sounds: {
      thud: thudSound,
      starfish: starfishSound,
      equalisation: equalisationSound,
    },
    images: [depth1Asset, depth2Asset, depth3Asset, surfaceAsset, mudAsset, alertAsset],
  })

  const style = () => ({
    'background-image': `
      url(${mudAsset}),
      linear-gradient(
        0deg,
        #000000 0%,
        #335B43 50%,
        #6AC973 100%
      )
    `,
    filter: 'hue-rotate(10deg)',
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

  return { scene, style, surface: false }
}
