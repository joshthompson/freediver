import { randomItem } from '@/utils'
import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import fish from '@public/fish.png'

export function createFishController(
  id: string,
  props: {
    x: number
    y: number
  },
) {
  return createController({
    frames: [fish],
    init() {
      const [x, setX] = createSignal<number>(props.x)
      const [y, setY] = createSignal<number>(props.y)
      const [size, setSize] = createSignal(Math.random() + 0.5)
      const [speed, setSpeed] = createSignal<number>(size() * 10)
      const direction = randomItem([-1, 1])
      return {
        id,
        x,
        setX,
        y,
        setY,
        speed,
        width: () => 30,
        setSpeed,
        xScale: () => size() * direction,
        yScale: size,
        setSize,
        direction
      }
    },
    onEnterFrame($, $game) {
      $.setX($.x() + $.speed() * $.direction)

      const xMin = $game.canvas.x() - 30
      const xMax = $game.canvas.width + $game.canvas.x() + 30
      if ($.x() > xMax) $.setX(xMin)
      if ($.x() < xMin) $.setX(xMax)
    },
  })
}
