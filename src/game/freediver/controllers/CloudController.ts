import { cloudAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'
import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'

export function createCloudController(
  id: string,
  options: {
    x: number,
    y: number,
    flip: boolean,
    size: number,
  }
) {
  return createController({
    frames: [cloudAsset],
    init() {
      return {
        id,
        type: 'cloud',
        ...createObjectSignal(options.x, 'x'),
        y: () => options.y,
        xScale: () => options.flip ? -1 : 1,
        size: 1,
        width: () => options.size * 200,
        style: () => ({ opacity: 0.3 }),
      }
    },
    onEnterFrame({ $, $scene }) {
      $.setX($.x() + 0.2 * options.size)

      if ($.x() > $scene.canvas.get().width + $.width()) {
        $.setX(-500)
      }
    }
  })
}
