import { createController } from '@/engine'
import { whaleSharkAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'

export function createWhaleSharkController(id: string) {
  const width = 600
  const height = 291
  const frames = [whaleSharkAsset]

  return createController({
    frames,
    init() {
      return {
        id,
        type: 'whale-shark',
        ...createObjectSignal(-2000, 'x'),
        y: () => 90,
        speed: () => 1,
        width: () => width,
        height: () => height,
        parallax: () => 1 / 3.5,
      }
    },
    onEnterFrame({ $, $scene, $controller }) {
      $.setX($.x() + $.speed())
      if ($scene.getControllerById('diver')?.hitTest($controller)) {
        $scene.gameStateActions.achievement('whaleShark')
      }
    },
  })
}
