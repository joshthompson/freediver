import { fish1Asset, fish2Asset, rareFish1Asset, rareFish2Asset, rareFish3Asset, rareFish4Asset, rareFish5Asset } from '@/assets'
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
      const [x, setX] = createSignal<number>(props.x)
      const [y, setY] = createSignal<number>(props.y)
      const [size, setSize] = createSignal(Math.random() + 0.5)
      const speed = () => size() * 5
      const [direction, setDirection] = createSignal(randomItem([-1, 1]))
      const [hue, setHue] = createSignal(Math.random() * 360)
      const [jitter, setJitter] = createSignal({ x: 0, y: 0 })
      const [frames, setFrames] = createSignal(chooseFishFrames())
      return {
        id,
        type: 'fish',
        x,
        setX,
        y,
        setY,
        speed,
        width: () => width,
        xScale: () => size() * direction(),
        yScale: size,
        setSize,
        direction,
        setDirection,
        setHue,
        setJitter,
        state: () => 'play',
        style: () => ({
          filter: `hue-rotate(${hue()}deg)`,
          translate: `${jitter().x}px ${jitter().y}px`,
          transition: 'translate 0.1s linear',
        }),
        frames,
        setFrames,
      }
    },
    onEnterFrame({ $, $game }) {
      let x = $.x() + $.speed() * $.direction()
      $.setJitter({ x: Math.random() * 5 - 2.5, y: Math.random() * 5 - 2.5 })

      const xMin = $game.canvas().x() - 30
      const xMax = $game.canvas().width + $game.canvas().x() + 30
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
