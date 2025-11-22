import { wallAsset } from '@/assets'
import { createController } from '@/utils/game'

export function createWallController(id: string, props: { x: number }) {
  return createController({
    frames: [wallAsset],
    init() {
      return {
        id,
        type: 'wall',
        x: () => props.x,
        y: () => 20,
        width: () =>510,
      }
    },
  })
}
