import { createController, Key } from '@/utils/game'
import { createSignal } from 'solid-js'
import { createBubbleController } from './BubbleController'
import { Sprite } from '@/games/core/Sprite'

export type DiverController = ReturnType<typeof createDiverController>

const bubbleFrequency = 20

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

  return createController(
    {
      frames: [
        '/dave.png#0,0,339,480',
        '/dave.png#678,0,339,480',
        '/dave.png#339,0,339,480',
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
        }
      },
      onEnterFrame($, $game, $age) {
        if (!$game) return

        const [left, right, up, down] = [
          Key.isDown(leftKey),
          Key.isDown(rightKey),
          Key.isDown(upKey),
          Key.isDown(downKey),
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

        const margin = 40
        const xMin = 0 - margin * 2
        const yMin = 0
        const xMax = $game.canvas.width + margin * 2
        const yMax = $game.canvas.height - 100

        // if ($.x() < xMin) $.setX(xMax)
        // if ($.x() > xMax) $.setX(xMin)
        if ($.y() < yMin) $.setY(yMin)
        if ($.y() > yMax) $.setY(yMax)

        $.setBubbleLevel($.bubbleLevel() + $.speed() / 3 + 0.5)
        if ($.bubbleLevel() > bubbleFrequency) {
          $.setBubbleLevel(0)
          $game.addController?.(
            createBubbleController('diver-bubble-' + $age / bubbleFrequency, {
              x: $.x() + 20 + 40 * Math.sin(($.rotation() * Math.PI) / 180),
              y: $.y() + 40 - 40 * Math.cos(($.rotation() * Math.PI) / 180),
            }),
          )
        }

        // Move canvas
        $game.canvas.setX($.x() - $game.canvas.width / 2 + $.width() / 2)
        // $game.canvas.setY(-$.y())
      },
    } as const,
    {
      depth($) {
        return Math.max(0, Math.floor($.y() / 40 - 0.5))
      },
    } as const,
  )
}
