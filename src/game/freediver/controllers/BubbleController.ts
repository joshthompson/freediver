import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import bubble from '@public/bubble2.png'
import { css } from '@style/css'

const acceleration = 0.1

export function createBubbleController(
  id: string,
  props: {
    x: number
    y: number
    xSpeed?: number,
    speed?: number
  },
) {
  return createController({
    frames: [bubble],
    init() {
      const [x, setX] = createSignal<number>(props.x)
      const [y, setY] = createSignal<number>(props.y)
      const [size, setSize] = createSignal(Math.random())
      const [speed, setSpeed] = createSignal<number>((props.speed ?? 0.5) * (size() * 0.5 + 0.5))
      const [xSpeed, setXSpeed] = createSignal<number>(props.xSpeed ?? 0)
      return {
        id,
        type: 'bubble',
        x,
        setX,
        y,
        setY,
        speed,
        setSpeed,
        xSpeed,
        setXSpeed,
        seed: Math.random(),
        xScale: size,
        yScale: size,
        setSize,
        width: () => 10,
        class: () => css({ opacity: 0.5 }),
      }
    },
    onEnterFrame($, $game, $age) {
      $.setX($.x() + Math.cos($.seed + $age / 5 - 0.5) * 2 + $.xSpeed())
      $.setY($.y() - $.speed())
      $.setSpeed($.speed() + acceleration)
      $.setSize($.xScale() * 1.01)
      $.setXSpeed($.xSpeed() * 0.99)

      if ($.y() < -30) {
        $game.removeController($.id)
      }
    },
  })
}
