import { createController } from '@/engine'
import { ropeAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'

export function createRopeController(
  id: string
) {
  return createController({
    frames: [ropeAsset],
    init() {
      return {
        id,
        type: 'rope',
        ...createObjectSignal(-50, 'x'),
        ...createObjectSignal(-70, 'y'),
        ...createObjectSignal(0, 'rotation'),
        size: 1,
        width: () => 60,
        height: () => 600,
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
