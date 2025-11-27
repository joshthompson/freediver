import { fish1Asset, fish2Asset, rareFish1Asset, rareFish2Asset, rareFish3Asset, rareFish4Asset, rareFish5Asset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'
import { generateFrames, randomItem } from '@/utils'
import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'

const width = 30
function chooseFishFrames() {
  return Math.random() > 0.5
    ? randomItem([
      generateFrames(fish1Asset, 157, 150, width, 1),
      generateFrames(fish2Asset, 340, 150, width, 1),
    ]) 
    : randomItem([
      generateFrames(rareFish1Asset, 265, 150, width, 1),
      generateFrames(rareFish2Asset, 575, 150, width, 1),
      generateFrames(rareFish3Asset, 201, 150, width, 1),
      generateFrames(rareFish4Asset, 268, 150, width, 1),
      generateFrames(rareFish5Asset, 443, 150, width, 1),
    ]) 
}

export function createFishController(
  id: string,
  props: {
    x: number
    y: number
  },
) {
  return createController({
    frames: chooseFishFrames(),
    init() {
      const [size, setSize] = createSignal(Math.random() + 0.5)
      const [hue, setHue] = createSignal(Math.random() * 360)
      const [jitter, setJitter] = createSignal({ x: 0, y: 0 })
      const direction = createObjectSignal(randomItem([-1, 1]), 'direction')
      return {
        id,
        type: 'fish',
        ...createObjectSignal(props.x, 'x'),
        ...createObjectSignal(props.y, 'y'),
        ...createObjectSignal(chooseFishFrames(), 'frames'),
        ...direction,
        speed: () => size() * 5,
        width: () => width,
        xScale: () => size() * direction.direction(),
        yScale: size,
        setSize,
        setHue,
        setJitter,
        state: () => 'play',
        style: () => ({
          filter: `hue-rotate(${hue()}deg)`,
          translate: `${jitter().x}px ${jitter().y}px`,
          transition: 'translate 0.1s linear',
        }),
      }
    },
    onEnterFrame({ $, $scene }) {
      let x = $.x() + $.speed() * $.direction()
      $.setJitter({ x: Math.random() * 5 - 2.5, y: Math.random() * 5 - 2.5 })

      const xMin = $scene.canvas.get().x() - 30
      const xMax = $scene.canvas.get().width + $scene.canvas.get().x() + 30
      if (x > xMax || x < xMin) {
        $.setY(Math.random() * 500 + 100)
        $.setSize(Math.random() + 0.5)
        $.setDirection(randomItem([-1, 1]))
        $.setHue(Math.random() * 360)
        $.setFrames(chooseFishFrames())
      }
      if (x > xMax) x = xMin
      if (x < xMin) x = xMax

      $.setX(x)
    },
  })
}
