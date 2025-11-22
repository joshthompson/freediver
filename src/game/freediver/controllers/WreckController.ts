import { wreckAsset } from '@/assets'
import { createController } from '@/utils/game'

export function createWreckController(id: string) {
  return createController({
    frames: [wreckAsset],
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
