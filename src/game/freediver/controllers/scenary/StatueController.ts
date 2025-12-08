import { statueAsset } from '@/assets'
import { createController } from '@/utils/game'

export function createStatueController(id: string, props: { x: number }) {
  return createController({
    frames: [statueAsset],
    solid: true,
    init() {
      return {
        id,
        type: 'statue',
        x: () => props.x,
        y: () => 220,
        width: () => 360,
        height: () => 433,
      }
    },
    onEnterFrame({ $scene, $controller }) {
      if ($scene.getControllerById('diver')?.hitTest($controller)) {
        $scene.gameStateActions.achievement('statue')
      }
    }
  })
}
