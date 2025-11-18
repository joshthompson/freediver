import { generateFrames, randomItem } from '@/utils'
import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import fish1 from '@assets/sprites/fish/fish1.png'
import fish2 from '@assets/sprites/fish/fish2.png'
import rare1 from '@assets/sprites/fish/rare1.png'
import rare2 from '@assets/sprites/fish/rare2.png'
import rare3 from '@assets/sprites/fish/rare3.png'
import rare4 from '@assets/sprites/fish/rare4.png'
import rare5 from '@assets/sprites/fish/rare5.png'

const width = 30
function chooseFishFrames() {
  return Math.random() > 0.5
    ? randomItem([
      generateFrames(fish1, 157, 150, width, 1),
      generateFrames(fish2, 340, 150, width, 1),
    ]) 
    : randomItem([
      generateFrames(rare1, 265, 150, width, 1),
      generateFrames(rare2, 575, 150, width, 1),
      generateFrames(rare3, 201, 150, width, 1),
      generateFrames(rare4, 268, 150, width, 1),
      generateFrames(rare5, 443, 150, width, 1),
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
    randomStartFrame: true,
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
      $.setX($.x() + $.speed() * $.direction())
      $.setJitter({ x: Math.random() * 5 - 2.5, y: Math.random() * 5 - 2.5 })

      const xMin = $game.canvas().x() - 30
      const xMax = $game.canvas().width + $game.canvas().x() + 30
      if ($.x() > xMax || $.x() < xMin) {
        $.setY(Math.random() * 500 + 100)
        $.setSize(Math.random() + 0.5)
        $.setDirection(randomItem([-1, 1]))
        $.setHue(Math.random() * 360)
        $.setFrames(chooseFishFrames())
      }
      if ($.x() > xMax) $.setX(xMin)
      if ($.x() < xMin) $.setX(xMax)
    },
  })
}
