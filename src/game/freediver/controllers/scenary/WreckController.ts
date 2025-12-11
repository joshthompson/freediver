import { wreckAsset } from '@/assets'
import { createController } from '@/engine'

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
        height: () => 548,
      }
    },
    onEnterFrame({ $scene, $controller }) {
      if ($scene.getControllerById('diver')?.hitTest($controller)) {
        $scene.gameStateActions.achievement('wreck')
      }
    }
  })
}
