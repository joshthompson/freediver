import { randomItem } from '@/utils'
import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'

type CrabMode = typeof modes[number]
const modes = ['pause', 'left', 'right'] as const
const minChangeMode = 10
const maxChangeMode = 300
const maxSpeed = 2

export function createCrabController(
  id: string,
  props: {
    x: number
  },
) {
  return createController({
    frames: ['/crab.png'],
    init() {
      const [x, setX] = createSignal<number>(props.x)
      const [y, setY] = createSignal<number>(630 + Math.random() * 30)
      const [mode, setMode] = createSignal<CrabMode>('pause')
      const [changeMode, setChangeMode] = createSignal(0)
      const [speed, setSpeed] = createSignal(Math.random() * maxSpeed)
      return {
        id,
        x,
        setX,
        y,
        setY,
        speed,
        setSpeed,
        width: () => 40,
        mode,
        setMode,
        changeMode,
        setChangeMode,
      }
    },
    onEnterFrame($, $game) {
      if ($.changeMode() <= 0) {
        $.setMode(randomItem(modes))
        $.setChangeMode(minChangeMode + Math.random() * (maxChangeMode - minChangeMode))
        $.setSpeed(Math.random() * maxSpeed)
      } else {
        $.setChangeMode($.changeMode() - 1)
      }
      if ($.mode() === 'left') $.setX($.x() - $.speed())
      if ($.mode() === 'right') $.setX($.x() + $.speed())
      
      const xMin = $game.canvas.x() - 30
      const xMax = $game.canvas.width + $game.canvas.x() + 30
      if ($.x() > xMax) $.setX(xMin)
      if ($.x() < xMin) $.setX(xMax)
    },
  })
}
