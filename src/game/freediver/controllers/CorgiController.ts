import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import { DiverController } from './DiverController'
import { createBubbleController } from './BubbleController'
import { Sprite } from '@/game/core/Sprite'
import corgi from '@public/corgi2.png'
import { generateFrames } from '@/utils'

const followDistance = 50
const bubbleFrequency = 20
const maxSpeed = 10
const minSpeed = 0

export function createCorgiController(
  id: string,
  props?: {
    x?: number
    y?: number
    mode: 'ocean' | 'surface'
  },
) {
  return createController({
    frames: generateFrames(corgi, 70, 66, 76, 2),
    init() {
      const [x, setX] = createSignal<number>(props?.x ?? 10)
      const [y, setY] = createSignal<number>(props?.y ?? 40)
      const [xScale, setXScale] = createSignal<number>(1)
      const [rotation, setRotation] = createSignal<number>(0)
      const [rotationSpeed] = createSignal<number>(5)
      const [acceleration] = createSignal<number>(0.2)
      const [speed, setSpeed] = createSignal<number>(0)
      const [state] = createSignal<Sprite['state']>('play')
      const [frameInterval, setFrameInterval] = createSignal(250)
      const [bubbleLevel, setBubbleLevel] = createSignal(0)
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
        acceleration,
        speed,
        setSpeed,
        width: () => 70,
        state,
        frameInterval,
        setFrameInterval,
        bubbleLevel,
        setBubbleLevel,
        mode: props?.mode ?? 'ocean'
      }
    },
    onEnterFrame($, $game, $age) {
      const diver = $game?.getController('diver') as DiverController
      if (!diver) return

      const targetX = diver.data.x() + ($.mode === 'ocean' ? 0 : 30)
      const targetY = diver.data.y() + ($.mode === 'ocean' ? 80 : 0)
      const distance = Math.hypot($.x() - targetX, $.y() - targetY)
      const direction = Math.atan2($.y() - targetY, $.x() - targetX)

      if (distance > followDistance) {
        $.setSpeed($.speed() + $.acceleration())
      } else {
        const before = $.speed()
        $.setSpeed($.speed() - $.acceleration() * 4)
        if (before > 0 && $.speed() < 0) $.setSpeed(0)
        if (before < 0 && $.speed() > 0) $.setSpeed(0)
      }
      $.setSpeed(Math.max(minSpeed, Math.min(maxSpeed, $.speed())))

      $.setX($.x() - $.speed() * Math.cos(direction))
      $.setY($.y() - $.speed() * Math.sin(direction))

      $.setFrameInterval(250 - 100 * $.speed() / maxSpeed)

      if ($.x() < targetX) $.setXScale(1)
      else $.setXScale(-1)

      const float = Math.cos($age / 10 - 0.5) * ($.mode === 'ocean' ? 1 : 0.5)
      $.setY($.y() + float)

      if ($.mode === 'ocean') {
        $.setBubbleLevel($.bubbleLevel() + $.speed() / 4 + 0.5)
        if ($.bubbleLevel() > bubbleFrequency) {
          $.setBubbleLevel(0)
          $game.addController?.(
            createBubbleController('corgi-bubble-' + $age / bubbleFrequency, {
              x: $.x() + $.width() / 2,
              y: $.y(),
            }),
          )
        }
      }
    },
  })
}
