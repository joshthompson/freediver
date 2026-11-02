import { createController } from '@/engine'
import { css } from '@style/css'
import { emptyAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'
import { useGameState } from '@/utils/GameStateContext'

// Draw solid boxes and triggers as coloured squares when debugging collisions
export const showDebugOutlines = false

export function createBoxController(
  id: string,
  props: Rect,
) {
  const state = useGameState()!

  return createController({
    frames: [emptyAsset],
    solid: { x: 0, y: 0, width: props.width, height: props.height },
    init() {
      return {
        id,
        type: 'box',
        ...createObjectSignal(props.x, 'x'),
        ...createObjectSignal(props.y, 'y'),
        ...createObjectSignal(props.width, 'width'),
        ...createObjectSignal(props.height, 'height'),
        ...(showDebugOutlines && state.gameState.options.debug ? {
          class: () => css({ outline: '1px solid red', background: '#FF000033' }),
        } : {})
      }
    },
  })
}
