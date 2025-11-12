import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import rope from '@public/rope.png'

export function createRopeController(
  id: string,
  props: {
    x: number
  },
) {
  return createController({
    frames: [rope],
    init() {
      const [x, setX] = createSignal<number>(props.x)
      const [y, setY] = createSignal<number>(-10)
      const [rotation, setRotation] = createSignal<number>(0)
      return {
        id,
        type: 'rope',
        x,
        setX,
        y,
        setY,
        width: () => 60,
        rotation,
        setRotation,
        origin: () => ({ x: 30, y: 30 }),
      }
    },
    onEnterFrame($, _, $age) {
      const float = Math.cos(10 + $age / 10) * 0.5
      $.setY($.y() + float)
      $.setRotation(Math.sin(10 + $age / 50) * 2)
    }
  })
}
