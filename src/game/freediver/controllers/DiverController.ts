import { createController, Key } from '@/utils/game'
import { createSignal } from 'solid-js'
import { createBubbleController } from './BubbleController'
import { Sprite } from '@/game/core/Sprite'
import dave from '@public/dave.png'

export type DiverController = ReturnType<typeof createDiverController>

const bubbleFrequency = 20
const pxInMeter = 40
const eqTolerance = 4

export function createDiverController(
  id: string,
  props?: {
    x?: number
    y?: number
    up?: string
    down?: string
    left?: string
    right?: string
    style?: Sprite['style']
  },
) {
  const leftKey = props?.left ?? 'ArrowLeft'
  const rightKey = props?.right ?? 'ArrowRight'
  const upKey = props?.up ?? 'ArrowUp'
  const downKey = props?.down ?? 'ArrowDown'
  const spaceKey = ' '

  return createController(
    {
      frames: [
        `${dave}#0,0,339,480`,
        `${dave}#678,0,339,480`,
        `${dave}#339,0,339,480`,
      ],
      style: props?.style,
      init() {
        const [x, setX] = createSignal<number>(props?.x ?? 30)
        const [y, setY] = createSignal<number>(props?.y ?? 15)
        const [xScale, setXScale] = createSignal<number>(1)
        const [rotation, setRotation] = createSignal<number>(0)
        const [rotationSpeed] = createSignal<number>(5)
        const [acceleration] = createSignal<number>(0.5)
        const [speed, setSpeed] = createSignal<number>(0)
        const [width] = createSignal<number>(68)
        const [state] = createSignal<Sprite['state']>('play')
        const [frameInterval, setFrameInterval] = createSignal(250)
        const [bubbleLevel, setBubbleLevel] = createSignal(0)
        const [eqLevel, setEqLevel] = createSignal(1)
        const maxSpeed = 10
        const minSpeed = -2.5
        return {
          id,
          x,
          setX,
          y,
          setY,
          xScale,
          setXScale,
          rotation,
          setRotation,
          rotationSpeed,
          acceleration,
          speed,
          setSpeed,
          maxSpeed,
          minSpeed,
          width,
          state,
          frameInterval,
          setFrameInterval,
          bubbleLevel,
          setBubbleLevel,
          eqLevel,
          setEqLevel,
          eqTolerance,
        }
      },
      onEnterFrame($, $game, $age) {
        if (!$game) return

        const initY = $.y()

        const [left, right, up, down, space] = [
          Key.isDown(leftKey),
          Key.isDown(rightKey),
          Key.isDown(upKey),
          Key.isDown(downKey),
          Key.isDown(spaceKey),
        ]

        if (up) $.setSpeed($.speed() + $.acceleration())
        else if (down) $.setSpeed($.speed() - $.acceleration())
        else if ($.speed() > 0) $.setSpeed($.speed() - $.acceleration() / 2)
        else if ($.speed() < 0) $.setSpeed($.speed() + $.acceleration() / 2)
        $.setSpeed(Math.max($.minSpeed, Math.min($.maxSpeed, $.speed())))

        $.setFrameInterval(up ? 50 : 250)

        if ($.speed() !== 0) {
          let rotation = $.rotation()
          if (left) rotation -= $.rotationSpeed()
          if (right) rotation += $.rotationSpeed()
          if (left || right) {
            rotation = (rotation + 360) % 360
            $.setRotation(rotation <= 180 ? rotation : -360 + rotation)
          }

          const rotate = (($.rotation() - 90) / 180) * Math.PI
          $.setX($.x() + $.speed() * Math.cos(rotate))
          $.setY($.y() + $.speed() * Math.sin(rotate))
        }

        if (!left && !right && !up && !down) {
          let rotation = $.rotation()
          if (rotation > 1) rotation -= 1.5
          if (rotation < -1) rotation += 1.5
          $.setRotation(rotation)
        }

        $.setXScale($.rotation() > 0 ? 1 : -1)

        const float = Math.cos($age / 10) * 1
        $.setY($.y() + float)

        const yMin = 0
        const yMax = $game.canvas.height - 100

        if ($.y() < yMin) $.setY(yMin)
        if ($.y() > yMax) $.setY(yMax)

        $.setBubbleLevel($.bubbleLevel() + Math.abs($.speed()) / 3 + 0.5)
        if ($.bubbleLevel() > bubbleFrequency) {
          $.setBubbleLevel(0)
          $game.addController?.(
            createBubbleController('diver-bubble-' + $age / bubbleFrequency, {
              x: $.x() + 20 + 40 * Math.sin(($.rotation() * Math.PI) / 180),
              y: $.y() + 40 - 40 * Math.cos(($.rotation() * Math.PI) / 180),
            }),
          )
        }

        // Equalisation
        const yDiff = $.y() - initY
        $.setEqLevel(Math.max(0, $.eqLevel() + yDiff / pxInMeter))
        if (space) {
          $.setEqLevel(0)
        }

        // Move canvas
        $game.canvas.setX($.x() - $game.canvas.width / 2 + $.width() / 2)
      },
    } as const,
    {
      depth($) {
        return Math.max(0, Math.floor($.y() / pxInMeter - 0.5))
      },
    } as const,
  )
}
