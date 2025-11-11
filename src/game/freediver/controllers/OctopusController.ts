import { randomItem } from '@/utils'
import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import octopus from '@public/octopus.gif'

export function createOctopusController(
  id: string,
  props: {
    x: number
    y: number
  },
) {
  return createController({
    frames: [octopus],
    init() {
      const [x, setX] = createSignal<number>(props.x)
      const [y, setY] = createSignal<number>(props.y)
      const [size, setSize] = createSignal(Math.random() + 0.5)
      const speed = () => size() * 2
      const [direction, setDirection] = createSignal(randomItem([-1, 1]))
      const [hue, setHue] = createSignal(Math.random() * 360)
      return {
        id,
        type: 'octopus',
        x,
        setX,
        y,
        setY,
        speed,
        width: () => 30,
        xScale: () => size() * direction(),
        yScale: size,
        rotation: () => 90 * direction(),
        setSize,
        direction,
        setDirection,
        setHue,
        style: () => ({
          filter: `hue-rotate(${hue()}deg)`,
        })
      }
    },
    onEnterFrame($, $game) {
      $.setX($.x() + $.speed() * $.direction())

      const xMin = $game.canvas.x() - 30
      const xMax = $game.canvas.width + $game.canvas.x() + 30
      if ($.x() > xMax || $.x() < xMin) {
        $.setY(Math.random() * 500 + 100)
        $.setSize(Math.random() + 0.5)
        $.setDirection(randomItem([-1, 1]))
        $.setHue(Math.random() * 360)
      }
      if ($.x() > xMax) $.setX(xMin)
      if ($.x() < xMin) $.setX(xMax)
    },
  })
}
