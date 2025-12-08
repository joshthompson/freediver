import { generateFrames, randomItem } from '@/utils'
import { createController } from '@/utils/game'
import { DiverController } from '../main/DiverController'
import { Sprite } from '@/engine/components/Sprite'
import { crabAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'

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
    frames: generateFrames(crabAsset, 150, 127, 48, 4),
    init() {
      const initY = 630 + Math.random() * 30
      return {
        id,
        type: 'crab',
        ...createObjectSignal(props.x, 'x'),
        ...createObjectSignal(initY, 'y'),
        ...createObjectSignal(1, 'xScale'),
        ...createObjectSignal('pause' as CrabMode, 'mode'),
        ...createObjectSignal(0, 'changeMode'),
        ...createObjectSignal(Math.random() * maxSpeed, 'speed'),
        ...createObjectSignal(0, 'jump'),
        ...createObjectSignal('pause' as Sprite['state'], 'state'),
        initY,
        width: () => 48,
        height: () => 41,
        frameInterval: () => 100,
      }
    },
    onEnterFrame({ $, $scene }) {
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


      $.setState($.mode() !== 'pause' || $.y() < $.initY ? 'play' : 'pause')
      
      const xMin = $scene.canvas.get().x() - 30
      const xMax = $scene.canvas.get().width + $scene.canvas.get().x() + 30
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

      const diver = $scene.getControllerById('diver') as DiverController
      if (diver) {
        const dx = Math.abs(diver.data.x() - $.x())
        const dy = Math.abs(diver.data.y() - $.y())
        const distance = Math.hypot(dx, dy)

        if (distance < 200 && $.y() === $.initY) {
          $.setJump(Math.round(5 + Math.random() * 10))
          $scene.gameStateActions.achievement('crabJump')
        }
      }
    },
  })
}
