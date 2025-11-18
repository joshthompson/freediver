import { createController } from '@/utils/game'
import wreck from '@assets/sprites/wreck.png'

export function createWreckController(id: string) {
  return createController({
    frames: [wreck],
    randomStartFrame: true,
    init() {
      return {
        id,
        type: 'wreck',
        x: () => -2000,
        y: () => 150,
        width: () => 400,
      }
    },
  })
}
