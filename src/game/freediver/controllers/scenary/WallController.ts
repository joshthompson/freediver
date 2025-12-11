import { wallAsset, wallCaveAsset, wallCaveFgAsset } from '@/assets'
import { createController } from '@/engine'
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
    init: () => ({
      id,
      type: 'wall',
      x: () => props.x,
      xScale: () => xScale,
      y: () => 20,
      width: () => width,
      height: () => height,
    }),
  })

  if (props.cave) {
    const wallFgController = createController({
      frames: [wallCaveFgAsset],
      solid: () => ({
        x: wallController.data.x(),
        y: wallController.data.y(),
        height: 0,
        width: 0,
      }),
      init: () => ({
        id: `${id}-fg`,
        type: 'wall-fg',
        x: () => props.x,
        y: () => 20,
        width: () => width,
        height: () => height,
        xScale: () => xScale,
      })
    })
    return [wallController, wallFgController]
  } else {
    return [wallController]
  }
}
