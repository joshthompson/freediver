import { createController } from '@/utils/game'
import wall from '@assets/sprites/wall.png'

export function createWallController(id: string, props: { x: number }) {
  return createController({
    frames: [wall],
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
