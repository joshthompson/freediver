import { generateFrames, randomItem } from '@/utils'
import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import crab from '@public/crab.png'
import { DiverController } from './DiverController'
import { Sprite } from '@/game/core/Sprite'

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
    frames: generateFrames(crab, 144, 112, 48, 4),
    init() {
      const initY = 630 + Math.random() * 30
      const [x, setX] = createSignal<number>(props.x)
      const [y, setY] = createSignal<number>(initY)
      const [xScale, setXScale] = createSignal<number>(1)
      const [mode, setMode] = createSignal<CrabMode>('pause')
      const [changeMode, setChangeMode] = createSignal(0)
      const [speed, setSpeed] = createSignal(Math.random() * maxSpeed)
      const [jump, setJump] = createSignal(0)
      const [state, setState] = createSignal<Sprite['state']>('pause')
      return {
        id,
        type: 'crab',
        x,
        setX,
        y,
        setY,
        xScale,
        setXScale,
        initY,
        jump,
        setJump,
        speed,
        setSpeed,
        width: () => 48,
        mode,
        setMode,
        changeMode,
        setChangeMode,
        frameInterval: () => 100,
        state,
        setState,
      }
    },
    onEnterFrame($, $game) {
      if ($.changeMode() <= 0) {
        $.setMode(randomItem(modes))
        $.setChangeMode(minChangeMode + Math.random() * (maxChangeMode - minChangeMode))
        $.setSpeed((Math.random() * 0.5 + 0.5) * maxSpeed)
        if ($.mode() === 'left') $.setXScale(-1)
        if ($.mode() === 'right') $.setXScale(1)
      } else {
        $.setChangeMode($.changeMode() - 1)
      }
      if ($.mode() === 'left') $.setX($.x() - $.speed())
      if ($.mode() === 'right') $.setX($.x() + $.speed())


      $.setState($.mode() !== 'pause' || $.y() > $.initY ? 'play' : 'pause')
      
      const xMin = $game.canvas().x() - 30
      const xMax = $game.canvas().width + $game.canvas().x() + 30
      if ($.x() > xMax || $.x() < xMin) {
        $.setY($.initY)
      }
      if ($.x() > xMax) $.setX(xMin)
      if ($.x() < xMin) $.setX(xMax)

      $.setY($.y() - $.jump())
      if ($.y() < $.initY) $.setJump($.jump() - 1)
      if ($.y() > $.initY) {
        $.setY($.initY)
        $.setJump(0)
      }

      const diver = $game?.getController('diver') as DiverController
      if (diver) {
        const dx = Math.abs(diver.data.x() - $.x())
        const dy = Math.abs(diver.data.y() - $.y())
        const distance = Math.hypot(dx, dy)

        if (distance < 150 && $.y() === $.initY) {
          $.setJump(Math.round(5 + Math.random() * 10))
        }
      }
    },
  })
}
