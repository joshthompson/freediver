import { createController } from '@/utils/game'
import { whaleAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'

export function createWhaleController(id: string) {
  const width = 800
  const height = 260
  const frames = [whaleAsset]

  return createController({
    frames,
    init() {
      return {
        id,
        type: 'whale',
        ...createObjectSignal(2000, 'x'),
        y: () => 100,
        speed: () => 1,
        width: () => width,
        height: () => height,
        parallax: () => 1 / 3.5,
      }
    },
    onEnterFrame({ $, $scene, $controller }) {
      $.setX($.x() - $.speed())
      if ($scene.getControllerById('diver')?.hitTest($controller)) {
        $scene.gameStateActions.achievement('whale')
      }
    },
  })
}
