import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import { Sprite } from '@/game/core/Sprite'
import { linkFrontAsset } from '@/assets'

export type CorgiSurfaceController = ReturnType<typeof createCorgiSurfaceController>

interface CorgiSurfaceControllerProps {
  x?: number
  y?: number
  style?: Sprite['style']
}

export function createCorgiSurfaceController(id: string, props?: CorgiSurfaceControllerProps) {
  return createController(
    {
      frames: [linkFrontAsset],
      init() {
        const [x] = createSignal<number>(props?.x ?? 10)
        const [y, setY] = createSignal<number>(350)

        return {
          id,
          type: 'corgi',
          x,
          y,
          setY,
          width: () => 140,
        }
      },
      onEnterFrame({ $, $age }) {
        const float = Math.cos($age / 10 - 0.5) * 0.5
        $.setY($.y() + float)
      },
    } as const,
  )
}
