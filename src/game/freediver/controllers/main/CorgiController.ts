import { createController } from '@/utils/game'
import { DiverController } from './DiverController'
import { createBubbleController } from '../scenary/BubbleController'
import { BoneController } from '../scenary/BoneController'
import { linkAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'
import { generateFrames } from '@/utils'

const bubbleFrequency = 20
const maxSpeed = 10
const minSpeed = 0
let bubbleN = 0

export type CorgiController = ReturnType<typeof createCorgiController>

export function createCorgiController(
  id: string,
  props: {
    x: number
    y?: number
  },
) {
  const followDistance = 50
  const boostDistance = 200 // If the corgi is further than this from the diver, he goes faster

  return createController({
    frames: generateFrames(linkAsset, 634, 394, 70, 3, true),
    init() {
      return {
        id,
        type: 'corgi',
        ...createObjectSignal(props.x, 'x'),
        ...createObjectSignal(props.y ?? 40, 'y'),
        ...createObjectSignal(1, 'xScale'),
        ...createObjectSignal(0, 'rotation'),
        ...createObjectSignal(0, 'speed'),
        ...createObjectSignal(250, 'frameInterval'),
        ...createObjectSignal(bubbleFrequency / 2, 'bubbleLevel'),
        acceleration: 0.15,
        width: () => 70,
        height: () => 44,
        state: () => 'play',
      }
    },
    onEnterFrame({ $, $scene, $age }) {
      const diver = $scene.getControllerById('diver') as DiverController
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
    },
  })
}
