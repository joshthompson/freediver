import { createController, Key } from '@/utils/game'
import { createSignal } from 'solid-js'
import { createBubbleController } from './BubbleController'
import { Sprite } from '@/game/core/Sprite'
import dave from '@public/dave.png'
import arm from '@public/dave-arm.png'

export type DiverController = ReturnType<typeof createDiver>
export type DiverArmController = ReturnType<typeof createDiverArm>

interface DiverControllerProps {
  x?: number
  y?: number
  style?: Sprite['style']
}

const bubbleFrequency = 20
const pxInMeter = 40
const eqTolerance = 4
let bubbleN = 0

export function createDiverController(id: string, props?: DiverControllerProps) {
  const diver = createDiver(id, props)
  const diverArm = createDiverArm(diver)

  return {
    diver,
    diverArm
  }
}

function createDiver(id: string, props?: DiverControllerProps) {
  const leftKey = () => Key.isDown('ArrowLeft') || Key.isDown('a')
  const rightKey = () => Key.isDown('ArrowRight') || Key.isDown('d')
  const upKey = () => Key.isDown('ArrowUp') || Key.isDown('w')
  const downKey = () => Key.isDown('ArrowDown') || Key.isDown('s')
  const spaceKey = () => Key.isDown(' ')

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
        const [holdSpace, setHoldSpace] = createSignal(1)
        const maxSpeed = 10
        const minSpeed = -2.5

        const makeBubble = (xShift: number, yShift: number, xSpeed?: number, speed?: number) => {
          return createBubbleController('diver-bubble-' + bubbleN++, {
            x: x() + 20 + (40 + xShift) * Math.sin((rotation() * Math.PI) / 180),
            y: y() + 40 - (40 + yShift) * Math.cos((rotation() * Math.PI) / 180),
            xSpeed,
            speed,
          })
        }


        return {
          id,
          type: 'diver',
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
          holdSpace,
          setHoldSpace,
          holdSpaceMax: 20,
          makeBubble,
        }
      },
      onEnterFrame($, $game, $age) {
        if (!$game) return

        const left = () => leftKey()
        const right = () => rightKey()
        const up = () => upKey()
        const down = () => downKey()
        const space = () => spaceKey()

        const initY = $.y()

        if (up()) $.setSpeed($.speed() + $.acceleration())
        else if (down()) $.setSpeed($.speed() - $.acceleration())
        else if ($.speed() > 0) $.setSpeed($.speed() - $.acceleration() / 2)
        else if ($.speed() < 0) $.setSpeed($.speed() + $.acceleration() / 2)
        $.setSpeed(Math.max($.minSpeed, Math.min($.maxSpeed, $.speed())))

        $.setFrameInterval(up() ? 50 : 250)

        // Rotation
        let rotation = $.rotation()
        const movingRotation = $.speed() !== 0 ? 1 : 0.5
        if (left()) rotation -= $.rotationSpeed() * movingRotation
        if (right()) rotation += $.rotationSpeed() * movingRotation
        if (left() || right()) {
          rotation = (rotation + 360) % 360
          $.setRotation(rotation <= 180 ? rotation : -360 + rotation)
        }
        const rotate = (($.rotation() - 90) / 180) * Math.PI
        $.setX($.x() + $.speed() * Math.cos(rotate))
        $.setY($.y() + $.speed() * Math.sin(rotate))

        if (!left() && !right() && !up() && !down()) {
          let rotation = $.rotation()
          if (rotation > 1) rotation -= 1.5
          if (rotation < -1) rotation += 1.5
          $.setRotation(rotation)
        }

        $.setXScale($.rotation() > 0 ? 1 : -1)

        const float = Math.cos($age / 10) * 1
        $.setY($.y() + float)

        const yMin = 0
        const yMax = $game.canvas.height - 130

        if ($.y() < yMin) $.setY(yMin)
        if ($.y() > yMax) $.setY(yMax)

        $.setBubbleLevel($.bubbleLevel() + Math.abs($.speed()) / 3 + 0.5)
        if ($.bubbleLevel() > bubbleFrequency) {
          $.setBubbleLevel(0)
          $game.addController($.makeBubble(0, 0))
        }

        // Equalisation
        const yDiff = $.y() - initY
        $.setEqLevel(Math.max(0, $.eqLevel() + yDiff / pxInMeter))
        if (space()) {
          $.setHoldSpace($.holdSpace() + 1)
          if ($.holdSpace() === $.holdSpaceMax) {
            $.setEqLevel(0)
            Array(20).fill(null).forEach((_, n) => {
              $game.addController($.makeBubble(
                n % 2 ? 40 : -10,
                -4,
                n % 2 === 0 ? -2 - Math.random() : 2 + Math.random(),
                1 + Math.random(),
              ))
            })
          }
        } else {
          $.setHoldSpace(0)
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

function createDiverArm(
  diver: DiverController
) {
  return createController({
    frames: [arm],
    init() {
      return {
        id: diver.id + '-arm',
        type: 'diver-arm',
        width: diver.data.width,
        x: diver.data.x,
        y: diver.data.y,
        rotation: diver.data.rotation,
        xScale: diver.data.xScale,
      }
    },
  })
}
