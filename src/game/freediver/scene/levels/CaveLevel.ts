import { Scene } from "@/engine"
import { useGameState } from "@/utils/GameStateContext"
import { createStatueController } from "../../controllers/scenary/StatueController"
import { createTriggerFishController } from "../../controllers/creature/TriggerFishController"
import { createFishController } from "../../controllers/creature/FishController"
import { createLightRayController } from "../../controllers/scenary/LightRayController"
import { createCrabController } from "../../controllers/creature/CrabController"
import { createOctopusController } from "../../controllers/creature/OctopusController"
import { alertAsset, depth1Asset, depth2Asset, depth3Asset, equalisationSound, mudAsset, starfishSound, surfaceAsset, thudSound } from "@/assets"
import { JSX } from "solid-js/jsx-runtime"
import { createPlantController } from "../../controllers/scenary/PlantController"
import { createBoxController } from "../../controllers/utils/BoxController"
import { createWallController } from "../../controllers/scenary/WallController"
import { createStarfishController } from "../../controllers/creature/StarFishController"
import { CAVE } from "./data"
import { createTriggerController } from "../../controllers/utils/TriggerController"
import { createDiverController, DiverController } from "../../controllers/main/DiverController"
import { createCorgiController } from "../../controllers/main/CorgiController"

export function CaveLevel(props: {
  setScene: (scene: string, mode?: string) => void
  state: ReturnType<typeof useGameState>
  mode?: string
}) {
  const scene = new Scene('cave', {
    ...props.state!,
    width: 700,
    height: 700,
    setup($scene: Scene) {
      const diverStart = props.mode === 'ocean'
        ? { x: -250, y: 450, rotation: 90 }
        : { x: $scene.gameState.diver.x, rotation: 180 }

      $scene.addController(createBoxController('floor', { x: -10000, y: 680, width: 20000, height: 100 }))
      $scene.addController(...createWallController('wall-left', { x: CAVE.minX - 510, cave: 'right', open: () => true }))
      $scene.addController(createBoxController('rightBound', { x: CAVE.maxX, y: 0, width: 1000, height: 1000 }))
      
      $scene.addController(createStatueController('statue', { x: 1000 }))
      $scene.addController(...createDiverController('diver', {
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

      const plants = Array(40).fill(null)
        .map((_, n) => createPlantController('plant-' + n, { x: n * 50 }))
        .sort((a, b) => a[0].data.y() - b[0].data.y())
      plants.forEach(plant => $scene.addController(...plant))

      $scene.addController(createCorgiController('corgi', { x: diverStart.x + 10, y: diverStart.y }))
      $scene.addController(...createTriggerFishController('triggerfish-1', { x: 2000 }))
      $scene.addController(...createTriggerFishController('triggerfish-2', { x: 6000 }))

      $scene.addController(createTriggerController('trigger-1', {
        x: -400,
        y: 500,
        width: 100,
        height: 100,
        targets: [$scene.getControllerById('diver')!],
        trigger: () => {
          props.setScene('ocean', 'cave')
        }
      }))

      const totalStarfish = 30
      const starfishMargin = 500
      Array(totalStarfish).fill(null).forEach((_, n) => {
        const totalSpace = CAVE.maxX - CAVE.minX - starfishMargin * 2
        const gap = totalSpace / (totalStarfish - 1)
        const x = CAVE.minX + starfishMargin + n * gap
        $scene.addController(createStarfishController('starfish-' + n, {
          x: x + Math.random() * 300 - 150,
        }) )
      })

      Array(1).fill(null).forEach((_, n) => {
        $scene.addController(createFishController('fish-' + n, {
          x: Math.random() * 700 - 350 + diverStart.x,
          y: Math.random() * 500 + 100,
        }))
      })

      Array(10).fill(null).forEach((_, n) => {
        $scene.addController(createLightRayController('light-' + n, { x: n * 70, type: n % 2 ? 'green' : 'white' }))
      })
    
      const crabs = Array(1).fill(null).map((_, n) => 
        createCrabController('crab-' + n, {
          x: -100 + n * 200 + Math.random() * 200 + diverStart.x,
        })
      ).sort((a, b) => a.data.y() - b.data.y())
      crabs.forEach(crab => $scene.addController(crab))
    
      const octopi = Array(12).fill(null).map((_, n) => 
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
      ],
      [
        'plant-bg',
        'wall',
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
