import { createConnectedController, createController } from '@/utils/game'
import { plantAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'
import { generateFrames } from '@/utils'

export type PlantBaseController = ReturnType<typeof createPlantBase>
export type PlantSegmentController = ReturnType<typeof createPlantSegment>

export function createPlantController(
  id: string,
  props: {
    x: number
  },
) {

  const base = createPlantBase(id, props.x)
  const segments = Math.floor(Math.random() * 5) + 2
  let lastSegment = base

  return [
    base,
    ...Array(segments).fill(null).map(n => {
      const segment = createPlantSegment(lastSegment, n)
      lastSegment = segment
      return segment
    })
  ]
}

function createPlantBase(id: string, x: number) {
  const yRand = Math.random()
  const initY = 550 + yRand * 50
  const type = yRand > 0.5 ? 'plant-fg' : 'plant-bg'
  const repeatMargin = Math.random() * 200 + 100

  return createController({
    frames: generateFrames(plantAsset, 38, 100, 38, 4),
    randomStartFrame: true,
    init() {
      return {
        id,
        type,
        ...createObjectSignal(x + Math.random() * 20 - 10, 'x'),
        ...createObjectSignal(0, 'rotation'),
        ...createObjectSignal(Math.random() * 10, 'animationPosition'),
        y: () => initY,
        width: () => 38,
        height: () => 100,
        origin: () => ({ x: 19, y: 100 }),
        style: () => ({ filter: `brightness(${0.5 + yRand / 2})` })
      }
    },
    onEnterFrame({ $, $scene }) {
      $.setRotation(Math.cos($.animationPosition() * 30))
      $.setAnimationPosition($.animationPosition() + Math.random() / 100)
      const offset = $.x() - $scene.canvas.get().x()
      const canvasWidth = $scene.canvas.get().width
      if (offset < -repeatMargin) $.setX($.x() + canvasWidth + repeatMargin * 2)
      if (offset > canvasWidth + repeatMargin) $.setX($.x() - canvasWidth - repeatMargin * 2)
    },
  })
}

function createPlantSegment(base: PlantBaseController, level: number): PlantBaseController {
  return createConnectedController({    
    type: () => base.type,
    randomStartFrame: true,
    frames: generateFrames(plantAsset, 38, 100, 38, 4),
    base,
    height: () => 100,
    width: () => 38,
    offset: { x: 0, y: -100 },
    transformOrigin: { x: 0, y: 50 + 100 * level },
    style: $ => $.style(),
  })
}