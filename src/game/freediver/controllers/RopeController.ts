import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import rope from '@public/rope.png'

export function createRopeController(
  id: string,
  props: {
    x: number
    y?: number
    size?: number
    mode: 'ocean' | 'surface'
  },
) {
  return createController({
    frames: [rope],
    init() {
      const [x, setX] = createSignal<number>(props.x)
      const [y, setY] = createSignal<number>(props?.y ?? -10)
      const [rotation, setRotation] = createSignal<number>(0)
      return {
        id,
        type: 'rope',
        x,
        setX,
        y,
        setY,
        size: props.size ?? 1,
        width: () => 60 * (props.size ?? 1),
        rotation,
        setRotation,
        origin: () => ({ x: 30, y: 30 }),
        mode: props.mode,
      }
    },
    onEnterFrame($, _, $age) {
      const float = Math.cos(10 + $age / 10) * ($.mode === 'ocean' ? 0.5 : 0.15) * $.size
      $.setY($.y() + float)
      $.setRotation(Math.sin(10 + $age / 50) * 2 * $.size)
    }
  })
}
