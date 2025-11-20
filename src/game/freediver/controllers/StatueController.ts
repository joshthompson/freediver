import { createController } from '@/utils/game'
import statue from '@assets/sprites/statue.png'

export function createStatueController(id: string) {
  return createController({
    frames: [statue],
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
      if ($game.getControllerById('diver')?.hitTest($controller)) {
        $game.gameStateActions.achievement('statue')
      }
    }
  })
}
