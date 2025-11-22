import { cloudAsset } from '@/assets'
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
      const [x, setX] = createSignal<number>(options.x)
      return {
        id,
        type: 'cloud',
        x,
        setX,
        y: () => options.y,
        xScale: () => options.flip ? -1 : 1,
        size: 1,
        width: () => options.size * 200,
        style: () => ({ opacity: 0.3 }),
      }
    },
    onEnterFrame({ $, $game }) {
      $.setX($.x() + 0.2 * options.size)

      if ($.x() > $game.canvas().width + $.width()) {
        $.setX(-500)
      }
    }
  })
}
