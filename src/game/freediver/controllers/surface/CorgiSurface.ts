import { createConnectedController, createController } from '@/engine'
import { Sprite } from '@/engine/components/Sprite'
import { kingdomCrownAsset, linkFrontAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'
import { useGameState } from '@/utils/GameStateContext'

export type CorgiSurfaceController = ReturnType<typeof createCorgiSurfaceController>

interface CorgiSurfaceControllerProps {
  x?: number
  y?: number
  style?: Sprite['style']
}

export function createCorgiSurfaceController(id: string, props?: CorgiSurfaceControllerProps) {
  const corgi = createController(
    {
      frames: [linkFrontAsset],
      init() {
        return {
          id,
          type: 'corgi',
          x: () => props?.x ?? 10,
          ...createObjectSignal(350, 'y'),
          width: () => 140,
          height: () => 156,
        }
      },
      onEnterFrame({ $, $age }) {
        const float = Math.cos($age / 10 - 0.5) * 0.5
        $.setY($.y() + float)
      },
    },
  )

  // Linkosha keeps the Corgi King's crown on above water too
  if (useGameState()?.gameState.questState.king.state === 'crowned') {
    corgi.attach(createConnectedController({
      type: 'crown',
      base: corgi,
      frames: [kingdomCrownAsset],
      offset: { x: 37, y: 7 }, // Centred between the ears, resting on the goggle strap
      width: () => 44,
      height: () => 34,
    }))
  }

  return corgi
}
