import { createController } from '@/utils/game'
import statue from '@assets/sprites/statue.png'

export function createStatueController(id: string) {
  return createController({
    frames: [statue],
    randomStartFrame: true,
    init() {
      return {
        id,
        type: 'statue',
        x: () => 8000,
        y: () => 220,
        width: () => 360,
      }
    },
    onEnterFrame({ $game, $controller }) {
      if ($game.getController('diver')?.hitTest($controller)) {
        $game.gameStateActions.achievement('statue')
      }
    }
  })
}
