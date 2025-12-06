import { createController } from '@/utils/game'
import { css } from '@style/css'
import { emptyAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'

export function createBoxController(
  id: string,
  props: Rect,
) {
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
        class: () => css({ outline: '1px solid red', background: '#FF000033' }),
      }
    },
  })
}
