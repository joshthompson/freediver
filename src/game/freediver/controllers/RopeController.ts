import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import { ropeAsset } from '@/assets'

export function createRopeController(
  id: string
) {
  return createController({
    frames: [ropeAsset],
    init() {
      const [x, setX] = createSignal<number>(-50)
      const [y, setY] = createSignal<number>(-70)
      const [rotation, setRotation] = createSignal<number>(0)
      return {
        id,
        type: 'rope',
        x,
        setX,
        y,
        setY,
        size: 1,
        width: () => 60,
        rotation,
        setRotation,
        origin: () => ({ x: 30, y: 30 }),
      }
    },
    onEnterFrame({ $, $age }) {
      const float = Math.cos(10 + $age / 10) * 0.5 * $.size
      $.setY($.y() + float)
      $.setRotation(Math.sin(10 + $age / 50) * 2 * $.size)
    }
  })
}
