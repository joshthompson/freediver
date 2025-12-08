import { createConnectedController, createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import { createBubbleController } from '../scenary/BubbleController'
import { Sprite } from '@/engine/components/Sprite'
import { generateFrames } from '@/utils'
import { seadiverArmBackAsset, seadiverArmFrontAsset, seadiverBodyAsset, seadiverHeadAsset } from '@/assets'
import { createObjectSignal, Key } from '@/engine/utils'

export type DiverController = ReturnType<typeof createDiver>
export type DiverHeadController = ReturnType<typeof createDiverHead>
export type DiverArmController = ReturnType<typeof createDiverArm>

interface DiverControllerProps {
  x: number
  y?: number
  rotation?: number
  speed?: number
  style?: Sprite['style']
  goToSurface?: (x: number) => void
  blackout?: () => void
}

const bubbleFrequency = 20
const pxInMeter = 40
let bubbleN = 0
const maxSpeed = 10
const minSpeed = -2.5
const equalisationSpeedPenaly = 0.75
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
      frames: generateFrames(seadiverBodyAsset, 952 / 7, 315, 68, 7),
      blockedBySolid: true,
      style: props.style,
      init() {
        const [x, setX] = createSignal<number>(props.x)
        const [y, setY] = createSignal<number>(props.y ?? 15)
        const [rotation, setRotation] = createSignal<number>(props.rotation ?? 180)
        const [acceleration] = createSignal<number>(0.5)
        const [speed, setSpeed] = createSignal<number>(props.speed ?? maxSpeed / 2)
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
          x, setX,
          y, setY,
          initY: y(),
          ...createObjectSignal(1, 'xScale'),
          ...createObjectSignal(250, 'frameInterval'),
          ...createObjectSignal(0, 'bubbleLevel'),
          ...createObjectSignal(1, 'eqLevel'),
          ...createObjectSignal(1, 'holdSpace'),
          ...createObjectSignal(1, 'cool'),
          rotation,
          setRotation,
          rotationSpeed: 5,
          acceleration,
          speed,
          setSpeed,
          width: () => 68,
          height: () => 157,
          state: () => 'play',
          eqTolerance: 5,
          holdSpaceMax: 20,
          makeBubble,
          goToSurface,
          blackout,
          showDamageLevel, setShowDamageLevel,
          showHealLevel, setShowHealLevel,
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
      onEnterFrame({ $, $scene, $age }) {
        const left = () => Key.isDown('ArrowLeft') || Key.isDown('a')
        const right = () => Key.isDown('ArrowRight') || Key.isDown('d')
        const up = () => Key.isDown('ArrowUp') || Key.isDown('w')
        const down = () => Key.isDown('ArrowDown') || Key.isDown('s')
        const space = () => Key.isDown(' ')
        const currentMaxSpeed = maxSpeed * ($.eqLevel() > $.eqTolerance ? equalisationSpeedPenaly : 1)

        if ($scene.gameState.diver.showDamage) {
          $.setShowDamageLevel(maxShowDamageLevel)
          $scene.setGameState('diver', 'showDamage', false)
        } else if ($.showDamageLevel() > 0) {
          $.setShowDamageLevel($.showDamageLevel() - 1)
        }

        if ($scene.gameState.diver.showHeal) {
          $.setShowHealLevel(maxShowHealLevel)
          $scene.setGameState('diver', 'showHeal', false)
        } else if ($.showHealLevel() > 0) {
          $.setShowHealLevel($.showHealLevel() - 1)
        }

        if ($age % 20 === 0) {
          const oxygen = $scene.gameState.diver.oxygen
          let consumption = 0.5 + 0.5 * Math.abs($.speed()) / currentMaxSpeed
          if ($.eqLevel() > $.eqTolerance) consumption *= 1.5

          $scene.setGameState('diver', 'oxygen', Math.max(0, oxygen - consumption))

          if ($scene.gameState.diver.oxygen <= 0) {
            $.blackout()
          }
        }

        const initX = $.x()
        const initY = $.y()

        if (up()) $.setSpeed($.speed() + $.acceleration())
        else if (down()) $.setSpeed($.speed() - $.acceleration())
        else if ($.speed() > 0) $.setSpeed($.speed() - $.acceleration() / 2)
        else if ($.speed() < 0) $.setSpeed($.speed() + $.acceleration() / 2)
        $.setSpeed(Math.max(minSpeed, Math.min(currentMaxSpeed, $.speed())))

        $.setFrameInterval(250 - 150 * ($.speed() / currentMaxSpeed))

        // Rotation
        let rotation = $.rotation()
        const movingRotation = $.speed() !== 0 ? 1 : 0.5
        if (left()) rotation -= $.rotationSpeed * movingRotation
        if (right()) rotation += $.rotationSpeed * movingRotation
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

        if ($.y() < minY) {
          $.goToSurface($.x())
          $scene.gameStateActions.registerCurrentDive()
        }

        $.setBubbleLevel($.bubbleLevel() + Math.abs($.speed()) / 3 + 0.5)
        if ($.bubbleLevel() > bubbleFrequency) {
          $.setBubbleLevel(0)
          $scene.addController($.makeBubble(0, 0))
        }

        // Equalisation
        const yDiff = $.y() - initY
        $.setEqLevel(Math.max(0, $.eqLevel() + yDiff / pxInMeter))
        if (space()) {
          if ($.eqLevel() > $.eqTolerance) {
            $scene.playSound('equalisation', { volume: 0.4 })
          }

          $.setHoldSpace($.holdSpace() + 1)
          if ($.holdSpace() === $.holdSpaceMax) {
            if ($.depth() < 2) $scene.gameStateActions.achievement('prequalisation')
            $.setEqLevel(0)
            Array(10).fill(null).forEach(() => {
              $scene.addController($.makeBubble(0, 0, Math.random() * 2 - 1, Math.random() * 2 - 1))
            })
          }
        } else {
          $.setHoldSpace(0)
          $scene.stopSound('equalisation')
        }
      },
    } as const,
  )
}

function createDiverHead(diver: DiverController) {
  return createConnectedController({
    type: 'head',
    base: diver,
    frames: [seadiverHeadAsset],
    width: () => 20,
    height: () => 34,
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
  const width = 80
  const frames = arm === 'left'
    ? generateFrames(seadiverArmFrontAsset, 200, 172, width, 6, true)
    : generateFrames(seadiverArmBackAsset, 200, 152, width, 6, true)
  const height = arm === 'left' ? 69 : 61

  return createConnectedController({
    type: 'arm-' + arm,
    base: diver,
    frames,
    width: () => width,
    height: () => height,
    frameInterval: $ => $.frameInterval(),
    rotation: () => -90,
    offset: { x: 18, y: -2 },
    origin: { x: 34, y: 16 },
    style: $ => ({ filter: $.style().filter }),
    state: $ => Math.abs($.speed()) > 0 ? 'play' : 'pause',
  })
}
