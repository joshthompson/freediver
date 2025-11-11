import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'

const acceleration = 0.1

export function createBubbleController(
  id: string,
  props: {
    x: number
    y: number
  },
) {
  return createController({
    frames: ['/bubble.png'],
    init() {
      const [x, setX] = createSignal<number>(props.x)
      const [y, setY] = createSignal<number>(props.y)
      const [speed, setSpeed] = createSignal<number>(0.5)
      const [size, setSize] = createSignal(Math.random())
      return {
        id,
        x,
        setX,
        y,
        setY,
        speed,
        setSpeed,
        seed: Math.random(),
        xScale: size,
        yScale: size,
        setSize,
      }
    },
    onEnterFrame($, $game, $age) {
      $.setX($.x() + Math.cos($.seed + $age / 5 - 0.5) * 2)
      $.setY($.y() - $.speed())
      $.setSpeed($.speed() + acceleration)
      $.setSize($.xScale() + 0.01)

      if ($.y() < -30) {
        $game.removeController($.id)
      }
    },
  })
}
