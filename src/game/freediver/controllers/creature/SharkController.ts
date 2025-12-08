import { sharkAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'
import { createController } from '@/utils/game'

export function createSharkController(id: string) {
  const width = 300
  const height = 110
  const frames = [sharkAsset]

  return createController({
    frames,
    init() {
      return {
        id,
        type: 'shark',
        ...createObjectSignal(5000, 'x'),
        y: () => 90,
        speed: () => 2,
        width: () => width,
        height: () => height,
        parallax: () => 1 / 2.5,
      }
    },
    onEnterFrame({ $, $scene, $controller }) {
      $.setX($.x() - $.speed())
      if ($scene.getControllerById('diver')?.hitTest($controller)) {
        $scene.gameStateActions.achievement('shark')
      }
    },
  })
}
