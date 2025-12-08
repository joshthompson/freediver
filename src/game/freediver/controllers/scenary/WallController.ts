import { wallAsset, wallCaveAsset, wallCaveFgAsset } from '@/assets'
import { createConnectedController, createController } from '@/utils/game'
import { Accessor } from 'solid-js'

export function createWallController(id: string, props: {
  x: number,
  cave?: 'left' | 'right',
  open?: Accessor<boolean>
}) {
  const frames = props.cave ? [wallCaveAsset] : [wallAsset]
  const xScale = props.cave === 'right' ? -1 : 1
  const width = 510
  const height = 640

  const wallController = createController({
    frames,
    solid: () => props.cave && props.open?.() ? {
      x: 0, y: 0, width: width, height: height - 300,
    } : {
      x: 0, y: 0, width: width, height: height,
    },
    init() {
      return {
        id,
        type: 'wall',
        x: () => props.x,
        xScale: () => xScale,
        y: () => 20,
        width: () => width,
        height: () => height,
      }
    },
  })

  if (props.cave) {
    const wallFgController = createConnectedController({
      type: 'fg',
      base: wallController,
      solid: () => ({
        x: 0,
        y: 0,
        height: 0,
        width: 0,
      }),
      frames: [wallCaveFgAsset],
      width: () => width,
      height: () => height,
      offset: { x: 0, y: 0 },
    })
    return [wallController, wallFgController]
  } else {
    return [wallController]
  }
}
