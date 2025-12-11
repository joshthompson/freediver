import { createController } from '@/engine'
import { Sprite } from '@/engine/components/Sprite'
import { linkFrontAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'

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
        return {
          id,
          type: 'corgi',
          x: () => props?.x ?? 10,
          ...createObjectSignal(350, 'y'),
          width: () => 140,
          height: () => 156,
        }
      },
      onEnterFrame({ $, $age }) {
        const float = Math.cos($age / 10 - 0.5) * 0.5
        $.setY($.y() + float)
      },
    },
  )
}
