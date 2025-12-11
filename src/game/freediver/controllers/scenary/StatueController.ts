import { statueAsset, statueHoleAsset, statueHoleFrontAsset } from '@/assets'
import { createController, createObjectSignal } from '@/engine'


export function createStatueControllers(id: string, props: { x: number, open: boolean }) {
  return [
    createStatueController(id, props),
    createStatueHoleController(id + '-hole', { x: props.x + 50 }),
    createStatueHoleFrontController(id + '-hole-front', { x: props.x + 50 }),
  ]
}

function createStatueController(id: string, props: { x: number, open: boolean }) {
  const closedY = 260
  const openY = 210

  return createController({
    frames: [statueAsset],
    init() {
      return {
        id,
        type: 'statue',
        x: () => props.x,
        ...createObjectSignal(props.open ? openY : closedY, 'y'),
        width: () => 360,
        height: () => 433,
      }
    },
    onEnterFrame({ $, $scene }) {
      if ($scene.gameState.questState.corgi.open && $.y() > openY) {
        $.setY($.y() - 1)
      }
    }
  })
}

function createStatueHoleController(id: string, props: { x: number }) {
  return createController({
    frames: [statueHoleAsset],
    init() {
      return {
        id,
        type: 'statue-hole',
        x: () => props.x,
        y: () => 642,
        width: () => 200,
        height: () => 59,
      }
    },
  })
}

function createStatueHoleFrontController(id: string, props: { x: number }) {
  return createController({
    frames: [statueHoleFrontAsset],
    init() {
      return {
        id,
        type: 'statue-hole-front',
        x: () => props.x,
        y: () => 642,
        width: () => 200,
        height: () => 59,
      }
    },
  })
}
