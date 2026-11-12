import { createConnectedController, createController, Scene } from '@/engine'
import { DiverController } from './DiverController'
import { createBubbleController } from '../scenary/BubbleController'
import { BoneController } from '../scenary/BoneController'
import { kingdomCrownAsset, linkAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'
import { generateSheetFrames } from '@/utils'
import { useGameState } from '@/utils/GameStateContext'
import { CrystalCorgiController } from '../realm/CrystalCorgiController'

const bubbleFrequency = 20
const maxSpeed = 10
const minSpeed = 0
let bubbleN = 0

// How every swimming corgi's sprite sheet is laid out: Linkosha, the citizens, the King and the
// realm guides. Built by scripts/build-corgi-sheets.mjs
export const corgiSheet = { cell: { width: 634, height: 398 }, gutter: 36, frameCount: 3 }

export type CorgiController = ReturnType<typeof createCorgiController>

// Everything another screen needs to draw this corgi as a Puppet
export interface CorgiPose {
  x: number
  y: number
  rotation: number
  xScale: number
  speed: number
}

export function readCorgiPose(corgi: CorgiController): CorgiPose {
  const { data } = corgi
  return { x: data.x(), y: data.y(), rotation: data.rotation(), xScale: data.xScale(), speed: data.speed() }
}

export function createCorgiController(
  id: string,
  props: {
    x: number
    y?: number
    type?: string
    diverId?: string // The diver to follow. Defaults to 'diver'
    skin?: string | (() => string) // The sprite sheet, so the corgi's suit can match the diver's
    crown?: boolean // Whether to wear the crown once the Corgi King hands it over. Defaults to true
    bubbles?: boolean // Whether swimming makes bubbles. False where there's no water. Defaults to true
    puppet?: () => CorgiPose | undefined // Copies these poses instead of following a diver
  },
) {
  const followDistance = 50
  const boostDistance = 200 // If the corgi is further than this from the diver, he goes faster

  const { skin: chosen } = props
  const skin = typeof chosen === 'function' ? chosen : () => chosen ?? linkAsset
  const corgi = createController({
    frames: generateSheetFrames(skin(), corgiSheet, 44),
    init() {
      return {
        frames: () => generateSheetFrames(skin(), corgiSheet, 44),
        id,
        type: props.type ?? 'corgi',
        ...createObjectSignal(props.x, 'x'),
        ...createObjectSignal(props.y ?? 40, 'y'),
        ...createObjectSignal(1, 'xScale'),
        ...createObjectSignal(0, 'rotation'),
        ...createObjectSignal(0, 'speed'),
        ...createObjectSignal(250, 'frameInterval'),
        ...createObjectSignal(bubbleFrequency / 2, 'bubbleLevel'),
        acceleration: 0.15,
        bubbles: props.bubbles ?? true,
        width: () => 70,
        height: () => 44,
        state: () => 'play',
      }
    },
    onEnterFrame({ $, $scene, $age }) {
      if (props.puppet) {
        const pose = props.puppet()
        if (pose) {
          $.setX(pose.x)
          $.setY(pose.y)
          $.setRotation(pose.rotation)
          $.setXScale(pose.xScale)
          $.setSpeed(pose.speed)
        }
        $.setFrameInterval(250 - 100 * $.speed() / maxSpeed)
        makeBubbles($, $scene)
        return
      }

      const diver = $scene.getControllerById(props.diverId ?? 'diver') as DiverController
      const bones = $scene.getControllersByType('bone') as BoneController[]
      if (!diver) return

      // Follow the diver
      let targetX = diver.data.x()
      let targetY = diver.data.y() + 80

      // If close to a bone, go towards that instead of diver
      bones.forEach(bone => {
        if (!bone.data.claimed()) {
          const distToBone = Math.hypot($.x() - bone.data.x(), $.y() - bone.data.y())
          if (distToBone < 250) {
            targetX = bone.data.x()
            targetY = bone.data.y()
            return
          }
        }
      })

      // A Crystal Corgi can call Linkosha over to fetch it, or to carry it to its Plinth
      $scene.getControllersByType<CrystalCorgiController>('crystal-corgi').forEach(crystal => {
        const target = crystal.data.corgiTarget()
        if (target) {
          targetX = target.x
          targetY = target.y
        }
      })

      const distance = Math.hypot($.x() - targetX, $.y() - targetY)
      const direction = Math.atan2($.y() - targetY, $.x() - targetX)

      if (distance > followDistance) {
        $.setSpeed($.speed() + $.acceleration)
      } else {
        const before = $.speed()
        $.setSpeed($.speed() - $.acceleration * 4)
        if (before > 0 && $.speed() < 0) $.setSpeed(0)
        if (before < 0 && $.speed() > 0) $.setSpeed(0)
      }
      
      $.setSpeed(Math.max(
        minSpeed,
        Math.min(
          distance > boostDistance ? 2 * maxSpeed : maxSpeed,
          $.speed()
        )
      ))

      $.setX($.x() - $.speed() * Math.cos(direction))
      $.setY($.y() - $.speed() * Math.sin(direction))
      
      $.setFrameInterval(250 - 100 * $.speed() / maxSpeed)
      
      if ($.x() < targetX) $.setXScale(1)
      else $.setXScale(-1)

      if (distance > followDistance) {
        if ($.x() < targetX) $.setRotation((direction * 180 / Math.PI) + 180)
        else $.setRotation((direction * 180 / Math.PI) + 0)
      } else {
        $.setRotation(($.rotation() + 360) % 360)
        if ($.rotation() > 10 || $.rotation() > 360) $.setRotation($.rotation() - 1.5)
        if ($.rotation() < -10 || $.rotation() > 180) $.setRotation($.rotation() + 1.5)
      }

      $.setY($.y() + Math.cos($age / 10 - 0.5))

      makeBubbles($, $scene)
    },
  })

  // Linkosha wears the Corgi King's crown once he hands it over
  if (props.crown !== false && useGameState()?.gameState.questState.king.state === 'crowned') {
    corgi.attach(createConnectedController({
      type: 'crown',
      base: corgi,
      frames: [kingdomCrownAsset],
      offset: { x: 44, y: -12 },
      width: () => 20,
      height: () => 16,
    }))
  }

  return corgi
}

function makeBubbles($: CorgiController['data'], $scene: Scene) {
  if (!$.bubbles) return
  $.setBubbleLevel($.bubbleLevel() + $.speed() / 4 + 0.5)
  if ($.bubbleLevel() > bubbleFrequency) {
    $.setBubbleLevel(0)
    $scene.addController?.(
      createBubbleController('corgi-bubble-' + bubbleN++, {
        x: $.x() + $.width() / 2,
        y: $.y(),
      }),
    )
  }
}
