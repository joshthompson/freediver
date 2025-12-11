import { createConnectedController, createController } from '@/engine'
import { plantAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'
import { generateFrames } from '@/utils'
import { createSignal } from 'solid-js'

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

  for (let n = 1; n < segments; n++) {
    const segment = createPlantSegment(lastSegment)
    lastSegment.attach(segment)
    lastSegment = segment
  }
  return base
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
      const [visiblity, setVisibility] = createSignal<'visible' | 'hidden'>('visible')
      return {
        id,
        type,
        ...createObjectSignal(x + Math.random() * 20 - 10, 'x'),
        ...createObjectSignal(0, 'rotation'),
        ...createObjectSignal(Math.random() * 10, 'animationPosition'),
        setVisibility,
        y: () => initY,
        width: () => 38,
        height: () => 100,
        origin: () => ({ x: 19, y: 100 }),
        style: () => ({
          filter: `brightness(${0.5 + yRand / 2})`,
          visibility: visiblity(),
        })
      }
    },
    onEnterFrame({ $, $scene, $controller }) {
      $.setRotation(Math.cos($.animationPosition() * 30))
      $.setAnimationPosition($.animationPosition() + Math.random() / 200)
      
      const offset = $.x() - $scene.canvas.get().x()
      const canvasWidth = $scene.canvas.get().width
      if (offset < -repeatMargin) $.setX($.x() + canvasWidth + repeatMargin * 2)
      if (offset > canvasWidth + repeatMargin) $.setX($.x() - canvasWidth - repeatMargin * 2)

      const touchingStuff = false
        || $scene.getControllerById('statue')?.hitTest($controller)
        || $scene.getControllerById('wall-left')?.hitTest($controller)

      $.setVisibility(touchingStuff ? 'hidden' : 'visible')
    },
  })
}

function createPlantSegment(base: PlantBaseController): PlantBaseController {
  return createConnectedController({    
    type: () => base.type,
    randomStartFrame: true,
    frames: generateFrames(plantAsset, 38, 100, 38, 4),
    base,
    height: () => 100,
    width: () => 38,
    offset: { x: 0, y: -100 },
    style: $ => $.style(),
  })
}