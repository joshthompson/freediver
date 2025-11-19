import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import { DiverController } from './DiverController'
import { createBubbleController } from './BubbleController'
import { Sprite } from '@/game/core/Sprite'
import corgi from '@assets/sprites/link/link.png'
import { generateFrames } from '@/utils'

const bubbleFrequency = 20
const maxSpeed = 10
const minSpeed = 0
let bubbleN = 0

export function createCorgiController(
  id: string,
  props?: {
    x?: number
    y?: number
  },
) {
  return createController({
    frames: generateFrames(corgi, 634, 394, 70, 3, true),
    init() {
      const [x, setX] = createSignal<number>(props?.x ?? 10)
      const [y, setY] = createSignal<number>(props?.y ?? 40)
      const [xScale, setXScale] = createSignal<number>(1)
      const [rotation, setRotation] = createSignal<number>(0)
      const [rotationSpeed] = createSignal<number>(5)
      const [speed, setSpeed] = createSignal<number>(0)
      const [state] = createSignal<Sprite['state']>('play')
      const [frameInterval, setFrameInterval] = createSignal(250)
      const [bubbleLevel, setBubbleLevel] = createSignal(bubbleFrequency / 2)
      const followDistance = 50

      return {
        id,
        type: 'corgi',
        x,
        setX,
        y,
        setY,
        xScale,
        setXScale,
        rotation,
        setRotation,
        rotationSpeed,
        acceleration: 0.15,
        speed,
        setSpeed,
        width: () => 70,
        state,
        frameInterval,
        setFrameInterval,
        bubbleLevel,
        setBubbleLevel,
        followDistance,
      }
    },
    onEnterFrame({ $, $game, $age }) {
      const diver = $game?.getController('diver') as DiverController
      if (!diver) return

      const targetX = diver.data.x()
      const targetY = diver.data.y() + 80
      const distance = Math.hypot($.x() - targetX, $.y() - targetY)
      const direction = Math.atan2($.y() - targetY, $.x() - targetX)

      if (distance > $.followDistance) {
        $.setSpeed($.speed() + $.acceleration)
      } else {
        const before = $.speed()
        $.setSpeed($.speed() - $.acceleration * 4)
        if (before > 0 && $.speed() < 0) $.setSpeed(0)
        if (before < 0 && $.speed() > 0) $.setSpeed(0)
      }
      $.setSpeed(Math.max(minSpeed, Math.min(maxSpeed, $.speed())))

      $.setX($.x() - $.speed() * Math.cos(direction))
      $.setY($.y() - $.speed() * Math.sin(direction))
      
      $.setFrameInterval(250 - 100 * $.speed() / maxSpeed)
      
      if ($.x() < targetX) $.setXScale(1)
      else $.setXScale(-1)

      if (distance > $.followDistance) {
        if ($.x() < targetX) $.setRotation((direction * 180 / Math.PI) + 180)
        else $.setRotation((direction * 180 / Math.PI) + 0)
      } else {
        $.setRotation(($.rotation() + 360) % 360)
        if ($.rotation() > 10 || $.rotation() > 360) $.setRotation($.rotation() - 1.5)
        if ($.rotation() < -10 || $.rotation() > 180) $.setRotation($.rotation() + 1.5)
      }

      const float = Math.cos($age / 10 - 0.5)
      $.setY($.y() + float)

      $.setBubbleLevel($.bubbleLevel() + $.speed() / 4 + 0.5)
      if ($.bubbleLevel() > bubbleFrequency) {
        $.setBubbleLevel(0)
        $game.addController?.(
          createBubbleController('corgi-bubble-' + bubbleN++, {
            x: $.x() + $.width() / 2,
            y: $.y(),
          }),
        )
      }
    },
  })
}
