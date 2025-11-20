import { createConnectedController, createController, Key } from '@/utils/game'
import { createSignal } from 'solid-js'
import { createBubbleController } from './BubbleController'
import { Sprite } from '@/game/core/Sprite'
import seadiverBody from '@assets/sprites/seadiver/seadiver-body.png'
import seadiverHead from '@assets/sprites/seadiver/seadiver-head.png'
import seadiverArm from '@assets/sprites/seadiver/seadiver-arm.png'
import { generateFrames } from '@/utils'

export type DiverController = ReturnType<typeof createDiver>
export type DiverHeadController = ReturnType<typeof createDiverHead>
export type DiverArmController = ReturnType<typeof createDiverArm>

interface DiverControllerProps {
  x?: number
  y?: number
  style?: Sprite['style']
  goToSurface?: () => void
  blackout?: () => void
  maxX: number
  minX: number
}

const bubbleFrequency = 20
const pxInMeter = 40
const eqTolerance = 5
let bubbleN = 0
const maxSpeed = 10
const minSpeed = -2.5
const maxShowDamageLevel = 60
const maxShowHealLevel = 60

export function createDiverController(id: string, props: DiverControllerProps) {
  const diver = createDiver(id, props)
  const diverHead = createDiverHead(diver)
  const diverLeftArm = createDiverArm(diver, 'left')
  const diverRightArm = createDiverArm(diver, 'right')

  return [
    diverLeftArm,
    diver,
    diverHead,
    diverRightArm,
  ]
}

function createDiver(id: string, props: DiverControllerProps) {
  const goToSurface = props.goToSurface ?? (() => {})
  const blackout = props.blackout ?? (() => {})

  return createController(
    {
      frames: generateFrames(seadiverBody, 952 / 7, 315, 68, 7),
      style: props.style,
      init() {
        const [x, setX] = createSignal<number>(props.x ?? 30)
        const [y, setY] = createSignal<number>(props.y ?? 15)
        const [xScale, setXScale] = createSignal<number>(1)
        const [rotation, setRotation] = createSignal<number>(180)
        const [rotationSpeed] = createSignal<number>(5)
        const [acceleration] = createSignal<number>(0.5)
        const [speed, setSpeed] = createSignal<number>(maxSpeed / 2)
        const [state] = createSignal<Sprite['state']>('play')
        const [frameInterval, setFrameInterval] = createSignal(250)
        const [bubbleLevel, setBubbleLevel] = createSignal(0)
        const [eqLevel, setEqLevel] = createSignal(1)
        const [holdSpace, setHoldSpace] = createSignal(1)
        const [showDamageLevel, setShowDamageLevel] = createSignal(0)
        const [showHealLevel, setShowHealLevel] = createSignal(0)

        const makeBubble = (xShift: number, yShift: number, xSpeed?: number, speed?: number) => {
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
          width: () => 68,
          height: () => 157,
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
          blackout,
          showDamageLevel,
          setShowDamageLevel,
          showHealLevel,
          setShowHealLevel,
          depth: () => Math.max(0, Math.floor(y() / pxInMeter - 0.5)),
          style: () => (showDamageLevel() ? {
            filter: `
              sepia(${showDamageLevel() / maxShowDamageLevel})
              saturate(${1 + 4 * showDamageLevel() / maxShowDamageLevel})
              hue-rotate(${-50 * showDamageLevel() / maxShowDamageLevel}deg)
              brightness(${1 + 0.3 * showDamageLevel() / maxShowDamageLevel})
            `,
          } : showHealLevel() ? {
            filter: `
              sepia(${showHealLevel() / maxShowHealLevel})
              saturate(${1 + 4 * showHealLevel() / maxShowHealLevel})
              hue-rotate(${+50 * showHealLevel() / maxShowHealLevel}deg)
              brightness(${1 + 0.3 * showHealLevel() / maxShowHealLevel})
            `,
          } : {}),
        }
      },
      onEnterFrame({ $, $game, $age }) {
        const left = () => Key.isDown('ArrowLeft') || Key.isDown('a')
        const right = () => Key.isDown('ArrowRight') || Key.isDown('d')
        const up = () => Key.isDown('ArrowUp') || Key.isDown('w')
        const down = () => Key.isDown('ArrowDown') || Key.isDown('s')
        const space = () => Key.isDown(' ')

        if ($game.gameState.diver.showDamage) {
          $.setShowDamageLevel(maxShowDamageLevel)
          $game.setGameState('diver', 'showDamage', false)
        } else if ($.showDamageLevel() > 0) {
          $.setShowDamageLevel($.showDamageLevel() - 1)
        }

        if ($game.gameState.diver.showHeal) {
          $.setShowHealLevel(maxShowHealLevel)
          $game.setGameState('diver', 'showHeal', false)
        } else if ($.showHealLevel() > 0) {
          $.setShowHealLevel($.showHealLevel() - 1)
        }

        if ($age % 20 === 0) {
          const oxygen = $game.gameState.diver.oxygen
          let consumption = 0.5 + 0.5 * Math.abs($.speed()) / maxSpeed
          if ($.eqLevel() > $.eqTolerance) consumption *= 2

          $game.setGameState('diver', 'oxygen', Math.max(0, oxygen - consumption))

          if ($game.gameState.diver.oxygen <= 0) {
            $.blackout()
          }
        }

        const initX = $.x()
        const initY = $.y()

        if (up()) $.setSpeed($.speed() + $.acceleration())
        else if (down()) $.setSpeed($.speed() - $.acceleration())
        else if ($.speed() > 0) $.setSpeed($.speed() - $.acceleration() / 2)
        else if ($.speed() < 0) $.setSpeed($.speed() + $.acceleration() / 2)
        $.setSpeed(Math.max(minSpeed, Math.min(maxSpeed, $.speed())))

        $.setFrameInterval(250 - 150 * ($.speed() / maxSpeed))

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

        const minY = -50
        const maxY = $game.canvas().height - 160

        if ($.y() < minY) {
          $.goToSurface()
          $.setY(minY)
          $game.gameStateActions.registerCurrentDive()
        }
        if ($.y() > maxY) {
          $.setY(maxY)
          if ($.y() !== initY) $game.playSound('thud')
        }

        if ($.x() > props.maxX) {
          $game.gameStateActions.achievement('endOfTheWorld')
          $.setX(props.maxX)
          if ($.x() !== initX) $game.playSound('thud')
        }

        if ($.x() < props.minX) {
          $game.gameStateActions.achievement('endOfTheWorld')
          $.setX(props.minX)
          if ($.x() !== initX) $game.playSound('thud')
        }

        $.setBubbleLevel($.bubbleLevel() + Math.abs($.speed()) / 3 + 0.5)
        if ($.bubbleLevel() > bubbleFrequency) {
          $.setBubbleLevel(0)
          $game.addController($.makeBubble(0, 0))
        }

        // Equalisation
        const yDiff = $.y() - initY
        $.setEqLevel(Math.max(0, $.eqLevel() + yDiff / pxInMeter))
        if (space()) {
          if ($.eqLevel() > $.eqTolerance) {
            $game.playSound('equalisation', { volume: 0.4 })
          }

          $.setHoldSpace($.holdSpace() + 1)
          if ($.holdSpace() === $.holdSpaceMax) {
            if ($.depth() < 2) $game.gameStateActions.achievement('prequalisation')
            $.setEqLevel(0)
            Array(10).fill(null).forEach(() => {
              $game.addController($.makeBubble(0, 0, Math.random() * 2 - 1, Math.random() * 2 - 1))
            })
          }
        } else {
          $.setHoldSpace(0)
          $game.stopSound('equalisation')
        }
      },
    } as const,
  )
}

function createDiverHead(diver: DiverController) {
  return createConnectedController({
    type: 'head',
    base: diver,
    frames: [seadiverHead],
    width: () => 20,
    rotation: $ => -70 * $.speed() / maxSpeed,
    offset: { x: 42, y: -19 },
    origin: { x: 8, y: 29 },
    style: $ => ({ filter: $.style().filter }),
  })
}


function createDiverArm(
  diver: DiverController,
  arm: 'left' | 'right',
) {
  let rotation = arm === 'left' ? 180 : 0
  return createConnectedController({
    type: 'arm-' + arm,
    base: diver,
    frames: [seadiverArm],
    width: () => 12.5,
    rotation: $ => {
      rotation += $.speed() / 3
      return rotation
    },
    offset: { x: 49, y: 7 },
    origin: { x: 5.5, y: 6 },
    style: $ => ({ filter: $.style().filter }),
  })
}
