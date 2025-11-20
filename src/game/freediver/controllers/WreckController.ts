import { createController } from '@/utils/game'
import wreck from '@assets/sprites/wreck.png'

export function createWreckController(id: string) {
  return createController({
    frames: [wreck],
    init() {
      return {
        id,
        type: 'wreck',
        x: () => -3000,
        y: () => 150,
        width: () => 400,
      }
    },
    onEnterFrame({ $game, $controller }) {
      if ($game.getControllerById('diver')?.hitTest($controller)) {
        $game.gameStateActions.achievement('wreck')
      }
    }
  })
}
