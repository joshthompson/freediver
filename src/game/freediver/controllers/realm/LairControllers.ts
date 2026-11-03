import { baitAsset, miniTriggerFishAsset, triggerFishAsset } from '@/assets'
import { createController, Scene } from '@/engine'
import { createObjectSignal } from '@/engine/utils'
import { createIndicatorController } from '../utils/IndicatorController'
import { getDiver } from './Hazard'

export type BaitController = ReturnType<typeof createBaitController>

const baitPull = 350 // Half the screen: trigger fish this close to bait go for it instead
const biteDamage = 5
const biteCooldown = 12

// A solid lump of rock, stretched over the given area
export function createRockController(id: string, props: Rect & { asset: string }) {
  return createController({
    frames: [props.asset],
    solid: { x: 0, y: 0, width: props.width, height: props.height },
    init() {
      return {
        id,
        type: 'rock',
        x: () => props.x,
        y: () => props.y,
        width: () => props.width,
        height: () => props.height,
        style: () => ({ 'border-radius': '40px' }),
      }
    },
  })
}

// Dropped with E. Sinks slowly and lasts about 5s of being nibbled
export function createBaitController(id: string, props: Vector & { floor: number }) {
  const width = 35
  const height = 25
  const life = 125

  return createController({
    frames: [baitAsset],
    init() {
      const left = createObjectSignal(life, 'life')
      return {
        id,
        type: 'bait',
        ...createObjectSignal(props.x - width / 2, 'x'),
        ...createObjectSignal(props.y - height / 2, 'y'),
        ...left,
        ...createObjectSignal(false, 'nibbled'), // Whether any fish is at it this frame
        ...createObjectSignal(0, 'rotation'),
        width: () => width,
        height: () => height,
        style: () => ({ opacity: 0.4 + 0.6 * left.life() / life }),
      }
    },
    onEnterFrame({ $, $scene, $age }) {
      if ($.y() + height < props.floor) $.setY($.y() + 0.6)
      $.setRotation(Math.sin($age / 8) * 15)
      if ($.nibbled()) {
        $.setLife($.life() - 1)
        $.setNibbled(false)
        $.setRotation($.rotation() + (Math.random() - 0.5) * 40)
      }
      if ($.life() <= 0) $scene.removeController($.id)
    },
  })
}

export function baitCenter(bait: BaitController) {
  return { x: bait.data.x() + bait.data.width() / 2, y: bait.data.y() + bait.data.height() / 2 }
}

function nearestBait($scene: Scene, point: Vector, within: number) {
  let nearest: BaitController | undefined
  let nearestDistance = within
  $scene.getControllersByType<BaitController>('bait').forEach(bait => {
    const center = baitCenter(bait)
    const distance = Math.hypot(center.x - point.x, center.y - point.y)
    if (distance < nearestDistance) {
      nearest = bait
      nearestDistance = distance
    }
  })
  return nearest
}

function swimTowards($: { x: () => number, y: () => number, setX: (x: number) => void, setY: (y: number) => void }, target: Vector, speed: number) {
  const direction = Math.atan2(target.y - $.y(), target.x - $.x())
  $.setX($.x() + Math.cos(direction) * speed)
  $.setY($.y() + Math.sin(direction) * speed)
  return direction
}

// Shared by big and mini trigger fish: go for bait first, then for the diver, otherwise roam
function createLairFish(id: string, props: {
  type: string
  asset: string
  home: Vector
  width: number
  height: number
  roam: (age: number) => Vector // Where it swims when nothing's caught its eye
  chaseDiver: (diverCenter: Vector) => boolean
  chaseSpeed: number
}) {
  const fish = createController({
    frames: [props.asset],
    init() {
      return {
        id,
        type: props.type,
        ...createObjectSignal(props.home.x, 'x'),
        ...createObjectSignal(props.home.y, 'y'),
        ...createObjectSignal(0, 'rotation'),
        ...createObjectSignal(1, 'yScale'),
        ...createObjectSignal(0, 'cooldown'),
        width: () => props.width,
        height: () => props.height,
      }
    },
    onEnterFrame({ $, $scene, $age }) {
      const center = { x: $.x() + props.width / 2, y: $.y() + props.height / 2 }
      const toTopLeft = (point: Vector) => ({ x: point.x - props.width / 2, y: point.y - props.height / 2 })
      if ($.cooldown() > 0) $.setCooldown($.cooldown() - 1)

      let target = props.roam($age)
      let speed = 2
      const bait = nearestBait($scene, center, baitPull)
      const diver = getDiver($scene)
      const diverCenter = diver?.data.center()

      if (bait) {
        const baitAt = baitCenter(bait)
        target = toTopLeft(baitAt)
        speed = props.chaseSpeed
        if (Math.hypot(baitAt.x - center.x, baitAt.y - center.y) < 30) {
          bait.data.setNibbled(true)
          speed = 0.5
        }
      } else if (diverCenter && props.chaseDiver(diverCenter)) {
        target = toTopLeft(diverCenter)
        speed = props.chaseSpeed
        if (Math.hypot(diverCenter.x - center.x, diverCenter.y - center.y) < 35 && $.cooldown() === 0) {
          $.setCooldown(biteCooldown)
          $scene.gameStateActions.damage(biteDamage)
          $scene.playSound('thud', { unique: true })
        }
      }

      if (Math.hypot(target.x - $.x(), target.y - $.y()) > speed) {
        // Face where it's going, flipped rather than upside down when heading left
        const direction = swimTowards($, target, speed)
        $.setRotation(direction * 180 / Math.PI)
        $.setYScale(Math.abs($.rotation()) > 90 ? -1 : 1)
      }
    },
  })
  return [fish, createIndicatorController(fish, 'enemy')]
}

// Roams around its home, and chases the diver if they come close
export function createLairTriggerFishController(id: string, props: Vector & { roam?: number }) {
  const roam = props.roam ?? 250
  let wanderTo: Vector = { ...props }
  return createLairFish(id, {
    type: 'triggerfish',
    asset: triggerFishAsset,
    home: props,
    width: 80,
    height: 44,
    chaseSpeed: 6.5,
    roam: age => {
      if (age % 75 === 0) {
        wanderTo = {
          x: props.x + (Math.random() * 2 - 1) * roam,
          y: props.y + (Math.random() * 2 - 1) * roam / 2,
        }
      }
      return wanderTo
    },
    chaseDiver: diver => Math.hypot(diver.x - props.x, diver.y - props.y) < roam + 250,
  })
}

// Circles its centre and only leaves it to go for bait. Bites anyone swimming through its circle
export function createMiniTriggerFishController(id: string, props: Vector & { radius?: number }) {
  const radius = props.radius ?? 110
  const phase = Math.random() * Math.PI * 2
  const direction = Math.random() > 0.5 ? 1 : -1
  return createLairFish(id, {
    type: 'mini-triggerfish',
    asset: miniTriggerFishAsset,
    home: props,
    width: 46,
    height: 25,
    chaseSpeed: 5.5,
    roam: age => ({
      x: props.x + Math.cos(phase + direction * age / 25) * radius - 23,
      y: props.y + Math.sin(phase + direction * age / 25) * radius - 12,
    }),
    chaseDiver: diver => Math.hypot(diver.x - props.x, diver.y - props.y) < radius + 30,
  })
}
