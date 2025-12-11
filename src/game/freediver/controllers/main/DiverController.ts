import { createConnectedController, createController } from '@/engine'
import { createSignal } from 'solid-js'
import { createBubbleController } from '../scenary/BubbleController'
import { Sprite } from '@/engine/components/Sprite'
import { generateFrames } from '@/utils'
import { emptyAsset, seadiverBodyAsset, seadiverHeadAsset } from '@/assets'
import { createObjectSignal, Key } from '@/engine/utils'

import armFrontUpper from '@assets/sprites/seadiver/seadiver-arm-front-upper.png'
import armFrontLower from '@assets/sprites/seadiver/seadiver-arm-front-lower.png'
import armFrontHand from '@assets/sprites/seadiver/seadiver-arm-front-hand.png'

export type DiverController = ReturnType<typeof createDiver>
export type DiverHeadController = ReturnType<typeof createDiverHead>
export type DiverArmController = ReturnType<typeof createDiverArm>
export type DiverArmLowerController = ReturnType<typeof createDiverArmLower>

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

const left = () => Key.isDown('ArrowLeft') || Key.isDown('a')
const right = () => Key.isDown('ArrowRight') || Key.isDown('d')
const up = () => Key.isDown('ArrowUp') || Key.isDown('w')
const down = () => Key.isDown('ArrowDown') || Key.isDown('s')
const space = () => Key.isDown(' ')

export function createDiverController(id: string, props: DiverControllerProps) {
  const diver = createDiver(id, props)
  diver.attach(createDiverArm(diver, 'back'))
  diver.attach(createDiverBody(diver))
  diver.attach(createDiverHead(diver))
  diver.attach(createDiverArm(diver, 'front'))
  return diver
}

function createDiver(id: string, props: DiverControllerProps) {
  const goToSurface = props.goToSurface ?? (() => {})
  const blackout = props.blackout ?? (() => {})

  return createController(
    {
      frames: [emptyAsset],
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

        const initY = $.y()

        if (up()) $.setSpeed($.speed() + $.acceleration())
        else if (down()) $.setSpeed($.speed() - $.acceleration())
        else if ($.speed() > 0) $.setSpeed($.speed() - $.acceleration() / 4)
        else if ($.speed() < 0) $.setSpeed($.speed() + $.acceleration() / 4)
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
          const rotationReset = 0.5
          if (rotation > 0 && rotation > target + 1) rotation -= rotationReset
          if (rotation > 0 && rotation < target - 1) rotation += rotationReset
          if (rotation < 0 && rotation > -target + 1) rotation -= rotationReset
          if (rotation < 0 && rotation < -target - 1) rotation += rotationReset
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
    offset: { x: 45, y: -20 },
    origin: { x: 8, y: 30 },
  })
}

function createDiverBody(diver: DiverController) {
  return createConnectedController({
    type: 'body',
    base: diver,
    frames: generateFrames(seadiverBodyAsset, 952 / 7, 315, 68, 7),
    width: diver.data.width,
    height: diver.data.height,
    offset: { x: 0, y: 0 },
    init: () => ({
      state: diver.data.state,
      frameInterval: diver.data.frameInterval,
    }),
  })
}

function createDiverArm(diver: DiverController, type: 'front' | 'back') {
  const arm = createConnectedController({
    type: 'arm-' + type,
    base: diver,
    frames: [armFrontUpper],
    width: () => 101 / 3,
    height: () => 28 / 3,
    offset: { x: 48, y: 7 },
    origin: { x: 5, y: 4.5 },
    init: $ => ({
      isSwimming: () => up(),
      rotationSpeed: () => Math.max(3, $.speed() * 1),
      ...createObjectSignal(0, 'swimPosition'), // Value between 0 and 360
      ...createObjectSignal(0, 'rotation'),
    }),
    onEnterFrame({ $ }) {
      if ($.isSwimming()) {
        $.setSwimPosition(($.swimPosition() + $.rotationSpeed() + 360) % 360)
      } else {
        $.setSwimPosition(type === 'back' ? 70 : 100)
      }

      $.setRotation(rotateTowards(
        $.rotation(),
        $.swimPosition() + ($.isSwimming() && type === 'back' ? 180 : 0) % 360,
        Math.abs($.rotationSpeed()) * 1.5,
      ))
    }
  })
  arm.attach(createDiverArmLower(arm, type))
  return arm
}

function createDiverArmLower(arm: DiverArmController, type: 'front' | 'back') {
  const armLower = createConnectedController({
    type: 'lower',
    base: arm,
    frames: [armFrontLower],
    width: () => 83 / 3,
    height: () => 19 / 3,
    offset: { x: 27, y: 3 },
    origin: { x: 3, y: 3 },
    init: ($) => ({
      isSwimming: $.isSwimming,
      rotation: () => {
        if (!$.isSwimming()) return 0

        // Normalise
        const upper = (($.swimPosition() % 360) + 360 + (type === 'back' ? 180 : 0)) % 360
        const start = 40
        const end = 190
        const maxAngle = -360
        const minAngle = 10

        // Helper: is angle `a` within start → end, taking wrapping into account?
        const isInRange = (a: number, s: number, e: number): boolean => {
          if (s < e) return a >= s && a < e
          return a >= s || a < e // wrapped case
        };

        const inActiveZone = isInRange(upper, start, end)

        // Outside active zone → lower arm straight
        if (!inActiveZone) return minAngle

        // Compute progress 0 → 1 through the active zone
        let span = (end - start + 360) % 360
        if (span === 0) span = 360  // full circle fallback

        const progress = ((upper - start + 360) % 360) / span
        return (minAngle + progress * (maxAngle - minAngle) + 360) % 360
      },
    }),
  })
  armLower.attach(createDiverArmHand(armLower))
  return armLower
}

function createDiverArmHand(armLower: DiverArmLowerController) {
  return createConnectedController({
    type: 'hand',
    base: armLower,
    frames: [armFrontHand],
    width: () => 48 / 3,
    height: () => 15 / 3,
    offset: { x: 25, y: 2 },
    origin: { x: 2, y: 2 },
    rotation: $ => $.isSwimming() ? 20 : 0,
  })
}


function rotateTowards(
  current: number,
  target: number,
  speed: number
): number {
  // Normalise to 0–360
  const a = ((current % 360) + 360) % 360
  const b = ((target % 360) + 360) % 360

  // Shortest signed angular difference (range -180 to 180)
  let diff = b - a
  diff = ((diff + 540) % 360) - 180

  // If we're close enough, snap to target
  if (Math.abs(diff) <= speed) return b

  // Move in the correct direction
  return (a + Math.sign(diff) * speed + 360) % 360
}

/**
 * Compute lower-arm rotation driven by upper-arm rotation.
 *
 * @param upper      Upper-arm angle (0..360)
 * @param start      Start angle of active zone (where bending begins)
 * @param end        End angle of active zone (where bending ends)
 * @param maxBend    Maximum bend in degrees (default 180)
 * @param invert     If true, flip the bend direction (useful if it's the wrong way round)
 * @param relative   If true, return rotation relative to upper (upper + bend). If false, return absolute bend (0..maxBend..0).
 */
function lowerArmRotation(
  upper: number,
  start: number,
  end: number,
  maxBend = 180,
  invert = false,
  relative = false
): number {
  // normalise angles to [0,360)
  const norm = (a: number) => ((a % 360) + 360) % 360;
  upper = norm(upper);
  start = norm(start);
  end = norm(end);

  // helper: is angle in [start, end) with wrapping
  const isInRange = (a: number, s: number, e: number) =>
    s < e ? (a >= s && a < e) : (a >= s || a < e);

  if (!isInRange(upper, start, end)) {
    // outside active zone -> straight (aligned)
    return relative ? norm(upper + 0) : 0;
  }

  // compute progress through active span [0..1]
  let span = (end - start + 360) % 360;
  if (span === 0) span = 360; // full circle
  const progress = ((upper - start + 360) % 360) / span;

  // triangle wave 0 -> 1 -> 0
  const wave = progress <= 0.5 ? progress * 2 : (1 - progress) * 2;

  // apply inversion if needed
  const bend = (invert ? -1 : 1) * wave * maxBend;

  // return either absolute bend (0..maxBend..0) or rotation aligned with upper
  if (relative) {
    // aligned rotation = upper + bend
    return norm(upper + bend);
  } else {
    // absolute bend (useful if your animation engine expects a forearm-only angle)
    // keep result positive in [0, maxBend]
    return Math.abs(bend);
  }
}