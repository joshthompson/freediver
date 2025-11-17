import { createConnectedController, createController, Key, playTone } from '@/utils/game'
import { createSignal } from 'solid-js'
import { Sprite } from '@/game/core/Sprite'
import seadiverFrontBody from '@assets/sprites/seadiver/seadiver-front-body.png'
import seadiverFrontHead from '@assets/sprites/seadiver/seadiver-front-head.png'
import { generateFrames } from '@/utils'

export type DiverSurfaceBodyController = ReturnType<typeof createDiverSurfaceBodyController>
export type DiverSurfaceHeadController = ReturnType<typeof createDiverSurfaceHeadController>

interface DiverSurfaceControllerProps {
  x?: number
  y?: number
  style?: Sprite['style']
  goToSurface?: (speed: number) => void
}

const oxygenUpRate = 20
const oxygenDownRate = 3

export function createDiverSurfaceController(id: string, props?: DiverSurfaceControllerProps) {
  const body = createDiverSurfaceBodyController(id, props)
  const head = createDiverSurfaceHeadController(body)
  return [body, head]
}

function createDiverSurfaceBodyController(id: string, props?: DiverSurfaceControllerProps) {
  const baseY = 400
  return createController(
    {
      frames: generateFrames(seadiverFrontBody, 638, 1578, 68, 7),
      style: props?.style,
      init() {
        const [x, setX] = createSignal<number>(props?.x ?? 30)
        const [y, setY] = createSignal<number>(baseY)
        const [oxygen, setOxygen] = createSignal(0)
        const [spaceTap, setSpaceTap] = createSignal(false)

        return {
          id,
          type: 'diver',
          x,
          setX,
          y,
          setY,
          width: () => 200,
          height: () => 374,
          oxygen,
          setOxygen,
          spaceTap,
          setSpaceTap,
        }
      },
      onEnterFrame({ $, $game, $age }) {
        const space = Key.isDown(' ')
      
        const float = Math.cos($age / 10) * 8
        $.setY(baseY - float)
      
        if (!$.spaceTap() && space) {
          $.setOxygen($.oxygen() + oxygenUpRate)
          $.setSpaceTap(true)
          playTone(400 + $.oxygen() * 15, 0.5, 10 * $game.gameState.options.volume)
        }
        if ($.spaceTap() && !space) {
          $.setSpaceTap(false)
        }
      
        $.setOxygen(Math.max($.oxygen() - oxygenDownRate, 0))
      
        // Center camera
        $game.canvas().setX($.x() - $game.canvas().width / 2 + $.width() / 2 + 80)
      },
    } as const,
  )
}

function createDiverSurfaceHeadController(body: DiverSurfaceBodyController) {
  return createConnectedController({
    type: 'head',
    base: body,
    frames: generateFrames(seadiverFrontHead, 184, 265, 70, 2),
    width: () => 70,
    rotation: (_, $age) => Math.sin($age / 7) * 3,
    offset: { x: 93, y: -85 },
    origin: { x: 43, y: 91 },
    frame: $ => $.oxygen() > 0 ? 1 : 0,
  })
}