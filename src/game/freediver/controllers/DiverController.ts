import { createConnectedController, createController, Key } from '@/utils/game'
import { createSignal } from 'solid-js'
import { createBubbleController } from './BubbleController'
import { Sprite } from '@/game/core/Sprite'
import seadiver from '@public/sprites/seadiver/seadiver-body.png'
import seadiverHead from '@public/sprites/seadiver/seadiver-head.png'
import arm from '@public/dave-arm.png'
import { generateFrames } from '@/utils'

export type DiverController = ReturnType<typeof createDiver>
export type DiverArmController = ReturnType<typeof createDiverArm>

interface DiverControllerProps {
  x?: number
  y?: number
  style?: Sprite['style']
  goToSurface?: (speed: number) => void
  mode: 'ocean' | 'surface'
}

const bubbleFrequency = 20
const pxInMeter = 40
const eqTolerance = 4
let bubbleN = 0

export function createDiverController(id: string, props?: DiverControllerProps) {
  const diver = createDiver(id, props)
  const diverHead = createDiverHead(diver)
  // const diverArm = createDiverArm(diver)

  return [
    diver,
    diverHead,
    // diverArm
  ]
}

function createDiver(id: string, props?: DiverControllerProps) {
  const goToSurface = props?.goToSurface ?? (() => {})

  return createController(
    {
      // frames: generateFrames(seadiver, 638, 1578, 68, 7),
      frames: generateFrames(seadiver, 638, 1578, 68, 7),
      style: props?.style,
      init() {
        const [x, setX] = createSignal<number>(props?.x ?? 30)
        const [y, setY] = createSignal<number>(props?.y ?? 15)
        const [xScale, setXScale] = createSignal<number>(1)
          const [rotation, setRotation] = createSignal<number>(props?.mode === 'surface' ? 0 : 180)
        const [rotationSpeed] = createSignal<number>(5)
        const [acceleration] = createSignal<number>(0.5)
        const [speed, setSpeed] = createSignal<number>(0)
        const [state] = createSignal<Sprite['state']>('play')
        const [frameInterval, setFrameInterval] = createSignal(250)
        const [bubbleLevel, setBubbleLevel] = createSignal(0)
        const [eqLevel, setEqLevel] = createSignal(1)
        const [holdSpace, setHoldSpace] = createSignal(1)
        const [oxygen, setOxygen] = createSignal(0)
        const [spaceTap, setSpaceTap] = createSignal(false)
        const maxSpeed = 10
        const minSpeed = -2.5

        const makeBubble = (xShift: number, yShift: number, xSpeed?: number, speed?: number) => {
          if (props?.mode !== 'ocean') return
          return createBubbleController('diver-bubble-' + bubbleN++, {
            x: x() + 30 - (80 + xShift) * Math.sin((-rotation() * Math.PI) / 180),
            y: y() + 80 - (82 + yShift) * Math.cos((-rotation() * Math.PI) / 180),
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
          initY: y(),
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
          width: () => 68,
          height: () => 168,
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
          goToSurface,
          oxygen,
          setOxygen,
          spaceTap,
          setSpaceTap,
          mode: props?.mode ?? 'ocean',
          depth: () => Math.max(0, Math.floor(y() / pxInMeter - 0.5)),
        }
      },
      onEnterFrame($, $game, $age, $currentFrame) {
        // Specific surface / ocean stuff
        if ($.mode === 'ocean') onEnterFrameOcean($, $game, $age, $currentFrame)
        else if ($.mode === 'surface') onEnterFrameSurface($, $game, $age, $currentFrame)
      },
    } as const,
  )
}

function createDiverHead(
  diver: DiverController
) {
  return createConnectedController({
    type: 'head',
    base: diver,
    frames: [seadiverHead],
    width: () => 20,
    rotation: $ => -70 * $.speed() / $.maxSpeed,
    offset: { x: 45, y: -10 },
    origin: { x: 8, y: 29 },
  })
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

const onEnterFrameOcean: ReturnType<typeof createDiver>['onEnterFrame'] = ($, $game, $age) => {
  const left = () => Key.isDown('ArrowLeft') || Key.isDown('a')
  const right = () => Key.isDown('ArrowRight') || Key.isDown('d')
  const up = () => Key.isDown('ArrowUp') || Key.isDown('w')
  const down = () => Key.isDown('ArrowDown') || Key.isDown('s')
  const space = () => Key.isDown(' ')

  const initY = $.y()

  if (up()) $.setSpeed($.speed() + $.acceleration())
  else if (down()) $.setSpeed($.speed() - $.acceleration())
  else if ($.speed() > 0) $.setSpeed($.speed() - $.acceleration() / 2)
  else if ($.speed() < 0) $.setSpeed($.speed() + $.acceleration() / 2)
  $.setSpeed(Math.max($.minSpeed, Math.min($.maxSpeed, $.speed())))

  $.setFrameInterval(250 - 150 * ($.speed() / $.maxSpeed))

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
  const xSpeed = $.x() + $.speed() * Math.cos(rotate)
  const ySpeed = $.y() + $.speed() * Math.sin(rotate)
  $.setX(xSpeed)
  $.setY(ySpeed)

  if (!left() && !right() && !up() && !down()) {
    let rotation = $.rotation()
    const target = 0 // 80
    if (rotation > 0 && rotation > target + 1) rotation -= 1.5
    if (rotation > 0 && rotation < target - 1) rotation += 1.5
    if (rotation < 0 && rotation > -target + 1) rotation -= 1.5
    if (rotation < 0 && rotation < -target - 1) rotation += 1.5
    $.setRotation(rotation)
  }

  $.setXScale($.rotation() > 0 ? 1 : -1)

  const float = Math.cos($age / 10)
  $.setY($.y() + float)

  const yMin = -50
  const yMax = $game.canvas().height - 160

  if ($.y() < yMin) {
    $.goToSurface(ySpeed)
    $.setY(yMin)
  }
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
      Array(10).fill(null).forEach((_, n) => {
        $game.addController($.makeBubble(0, 0, Math.random() * 2 - 1, Math.random() * 2 - 1))
      })
    }
  } else {
    $.setHoldSpace(0)
  }

  // Center camera
  $game.canvas().setX($.x() - $game.canvas().width / 2 + $.width() / 2)
}

const oxygenUpRate = 15
const oxygenDownRate = 3
const onEnterFrameSurface: ReturnType<typeof createDiver>['onEnterFrame'] = ($, $game, $age) => {
  const space = Key.isDown(' ')

  const float = Math.cos($age / 10) * 8
  $.setY(400 - float)

  if (!$.spaceTap() && space) {
    $.setOxygen($.oxygen() + oxygenUpRate)
    $.setSpaceTap(true)
  }
  if ($.spaceTap() && !space) {
    $.setSpaceTap(false)
  }

  $.setOxygen(Math.max($.oxygen() - oxygenDownRate, 0))

  // Center camera
  $game.canvas().setX($.x() - $game.canvas().width / 2 + $.width() / 2 + 80)
}
