import { Controller, ControllerBaseType, createController } from '@/engine'
import { css } from '@style/css'
import { emptyAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'
import { useGameState } from '@/utils/GameStateContext'
import { Accessor, children, Setter } from 'solid-js'

export function createTriggerController<CP extends ControllerBaseType>(
  id: string,
  props: Rect & {
    trigger: (controllerId: string) => void,
    mode?: 'single' | 'multiple' | 'continuous'
    targets: Controller<CP>[],
  },
) {
  const state = useGameState()!

  const triggered: Record<string, { get: Accessor<boolean>, set: Setter<boolean> }> = Object.fromEntries(
    props.targets.map(target => [target.id, createObjectSignal(false)]),
  )

  props.mode ??= 'single'

  return createController({
    frames: [emptyAsset],
    init() {
      return {
        id,
        type: 'trigger',
        ...createObjectSignal(props.x, 'x'),
        ...createObjectSignal(props.y, 'y'),
        ...createObjectSignal(props.width, 'width'),
        ...createObjectSignal(props.height, 'height'),
        ...createObjectSignal(0, 'tally'),
        triggered,
        ...(state.gameState.options.debug ? {
          class: () => css({ outline: '1px solid blue', background: '#0000FF33' }),
        } : {}),
      }
    },
    onEnterFrame({ $, $controller }) {
      props.targets.forEach(target => {
        const isTriggered = $.triggered[target.id].get()
        const canTrigger = props.mode === 'multiple' ? true : !isTriggered

        if (canTrigger && target.hitTest($controller)) {
          $.setTally($.tally() + 1)
          props.trigger(target.id)
          $.triggered[target.id].set(true)
        }

        if (isTriggered && props.mode === 'multiple' && !target.hitTest($controller)) {
          $.triggered[target.id].set(false)
        }
      })
    }
  })
}
