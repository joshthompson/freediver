import { generateFrames, randomItem } from '@/utils'
import { createController } from '@/engine'
import { DiverController } from '../main/DiverController'
import { octopusAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'

export function createOctopusController(
  id: string,
  props: Vector,
) {
  return createController({
    frames: generateFrames(octopusAsset, 271, 309 , 30, 10),
    randomStartFrame: true,
    init() {
      const size = createObjectSignal(Math.random() * 1.5 + 0.5, 'size')
      const direction = createObjectSignal(randomItem([-1, 1]), 'direction')
      const hue = createObjectSignal(Math.random() * 360, 'hue')
      return {
        id,
        type: 'octopus',
        ...createObjectSignal(props.x, 'x'),
        ...createObjectSignal(props.y, 'y'),
        ...createObjectSignal(size.size() * 2, 'speed'),
        ...direction,
        ...size,
        ...hue,
        width: () => 30,
        height: () => 34,
        xScale: () => size.size() * direction.direction(),
        yScale: size.size,
        style: () => ({
          filter: `hue-rotate(${hue.hue()}deg)`,
        }),
        state: () => 'play',
      }
    },
    onEnterFrame({ $, $scene, $currentFrame }) {
      $.setX($.x() + $.speed() * $.direction())

      if ([7, 8].includes($currentFrame)) $.setSpeed($.size() * 5)
      else if ([6, 9].includes($currentFrame)) $.setSpeed($.size() * 4)
      else if ([5, 0].includes($currentFrame)) $.setSpeed($.size() * 2)
      else $.setSpeed($.size() * 1)

      const xMin = $scene.canvas.get().x() - 30
      const xMax = $scene.canvas.get().width + $scene.canvas.get().x() + 30
      if ($.x() > xMax || $.x() < xMin) {
        $.setY(Math.random() * 500 + 100)
        $.setSize(Math.random() * 2 + 0.5)
        $.setDirection(randomItem([-1, 1]))
        $.setHue(Math.random() * 360)
      }
      if ($.x() > xMax) $.setX(xMin)
      if ($.x() < xMin) $.setX(xMax)

      const diver = $scene.getControllerById('diver') as DiverController
      if (diver) {
        const dx = Math.abs(diver.data.x() - $.x())
        const dy = Math.abs(diver.data.y() - $.y())
        const distance = Math.hypot(dx, dy)

        if (distance < 150) {
          $.setHue($.hue() + 6 * Math.random())
        }
      }
    },
  })
}
