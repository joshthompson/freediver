import { generateFrames, randomItem } from '@/utils'
import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import fish1 from '@public/sprites/fish1.png'
import fish2 from '@public/sprites/fish2.png'
import fish3 from '@public/sprites/fish3.png'

export function createFishController(
  id: string,
  props: {
    x: number
    y: number
  },
) {
  const width = 30
  const frames = randomItem([
    generateFrames(fish1, 252, 204, width, 4),
    generateFrames(fish2, 460, 340, width, 8),
    generateFrames(fish3, 320, 170, width, 8),
  ])

  return createController({
    frames,
    randomStartFrame: true,
    init() {
      const [x, setX] = createSignal<number>(props.x)
      const [y, setY] = createSignal<number>(props.y)
      const [size, setSize] = createSignal(Math.random() + 0.5)
      const speed = () => size() * 5
      const [direction, setDirection] = createSignal(randomItem([-1, 1]))
      const [hue, setHue] = createSignal(Math.random() * 360)
      return {
        id,
        type: 'fish',
        x,
        setX,
        y,
        setY,
        speed,
        width: () => width,
        xScale: () => size() * direction(),
        yScale: size,
        setSize,
        direction,
        setDirection,
        setHue,
        state: () => 'play',
        style: () => ({
          filter: `hue-rotate(${hue()}deg)`,
        })
      }
    },
    onEnterFrame($, $game) {
      $.setX($.x() + $.speed() * $.direction())

      const xMin = $game.canvas().x() - 30
      const xMax = $game.canvas().width + $game.canvas().x() + 30
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
