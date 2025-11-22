import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import { css } from '@style/css'
import { bubbleAsset, kissAsset } from '@/assets'

const acceleration = 0.1

export function createBubbleController(
  id: string,
  props: {
    x: number
    y: number
    xSpeed?: number,
    speed?: number
    type?: 'bubble' | 'kiss'
  },
) {
  return createController({
    frames: [props.type === 'kiss' ? kissAsset : bubbleAsset],
    init() {
      const [x, setX] = createSignal<number>(props.x)
      const [y, setY] = createSignal<number>(props.y)
      const [size, setSize] = createSignal(props.type === 'kiss' ? 1 : Math.random())
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
        width: () => props.type === 'kiss' ? 30 : 10,
        class: () => css({ opacity: 0.5 }),
      }
    },
    onEnterFrame({ $, $game, $age }) {
      $.setX($.x() + Math.cos($.seed + $age / 5 - 0.5) * 2 + $.xSpeed())
      $.setY($.y() - $.speed())
      $.setSpeed($.speed() + acceleration)
      $.setSize($.xScale() * 1.01)
      $.setXSpeed($.xSpeed() * 0.99)

      if ($.y() < -50) {
        $game.removeController($.id)
      }
    },
  })
}
