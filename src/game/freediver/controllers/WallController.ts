import { wallAsset, wallCaveAsset, wallCaveFgAsset } from '@/assets'
import { createConnectedController, createController } from '@/utils/game'

export function createWallController(id: string, props: { x: number, cave?: 'left' | 'right' }) {

  const frames = props.cave ? [wallCaveAsset] : [wallAsset]
  const xScale = props.cave === 'right' ? -1 : 1

  const wallController = createController({
    frames,
    init() {
      return {
        id,
        type: 'wall',
        x: () => props.x,
        xScale: () => xScale,
        y: () => 20,
        width: () => 510,
        height: () => 640,
      }
    },
  })

  if (props.cave) {
    const wallFgController = createConnectedController({
        type: 'fg',
        base: wallController,
        frames: [wallCaveFgAsset],
        width: () => 510,
        offset: { x: 0, y: 0 },
      })
    return [wallController, wallFgController]
  } else {
    return [wallController]
  }
}
