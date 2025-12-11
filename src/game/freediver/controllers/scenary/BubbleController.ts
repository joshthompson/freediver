import { createController } from '@/engine'
import { css } from '@style/css'
import { bubbleAsset, kissAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'

const acceleration = 0.1

export function createBubbleController(
  id: string,
  props: {
    x: number
    y: number
    xSpeed?: number,
    speed?: number
    type?: 'bubble' | 'kiss'
  },
) {
  return createController({
    frames: [props.type === 'kiss' ? kissAsset : bubbleAsset],
    init() {
      const size = createObjectSignal(props.type === 'kiss' ? 1 : Math.random(), 'size')
      return {
        id,
        type: 'bubble',
        ...createObjectSignal(props.x, 'x'),
        ...createObjectSignal(props.y, 'y'),
        ...createObjectSignal((props.speed ?? 0.5) * (size.size() * 0.5 + 0.5), 'speed'),
        ...createObjectSignal(props.xSpeed ?? 0, 'xSpeed'),
        ...size,
        seed: Math.random(),
        xScale: size.size,
        yScale: size.size,
        width: () => props.type === 'kiss' ? 30 : 10,
        height: () => props.type === 'kiss' ? 30 : 10,
        class: () => css({ opacity: 0.5 }),
      }
    },
    onEnterFrame({ $, $scene, $age }) {
      $.setX($.x() + Math.cos($.seed + $age / 5 - 0.5) * 2 + $.xSpeed())
      $.setY($.y() - $.speed())
      $.setSpeed($.speed() + acceleration)
      $.setSize($.xScale() * 1.01)
      $.setXSpeed($.xSpeed() * 0.99)

      if ($.y() < -50) {
        $scene.removeController($.id)
      }
    },
  })
}
