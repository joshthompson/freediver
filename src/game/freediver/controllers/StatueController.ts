import { statueAsset } from '@/assets'
import { createController } from '@/utils/game'

export function createStatueController(id: string) {
  return createController({
    frames: [statueAsset],
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
