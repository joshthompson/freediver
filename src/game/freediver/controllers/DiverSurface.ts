import { createController, Key } from '@/utils/game'
import { createSignal } from 'solid-js'
import { Sprite } from '@/game/core/Sprite'
import seadiverFront from '@public/sprites/seadiver/seadiver-front2.png'
import { generateFrames } from '@/utils'

export type DiverSurfaceController = ReturnType<typeof createDiverSurfaceController>

interface DiverSurfaceControllerProps {
  x?: number
  y?: number
  style?: Sprite['style']
  goToSurface?: (speed: number) => void
}

const oxygenUpRate = 15
const oxygenDownRate = 3

export function createDiverSurfaceController(id: string, props?: DiverSurfaceControllerProps) {
  const baseY = props?.y ?? 200
  return createController(
    {
      frames: generateFrames(seadiverFront, 638, 1578, 68, 7),
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
          oxygen,
          setOxygen,
          spaceTap,
          setSpaceTap,
        }
      },
      onEnterFrame($, $game, $age) {
        const space = Key.isDown(' ')
      
        const float = Math.cos($age / 10) * 8
        $.setY(baseY - float)
      
        if (!$.spaceTap() && space) {
          $.setOxygen($.oxygen() + oxygenUpRate)
          $.setSpaceTap(true)
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
