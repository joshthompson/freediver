import {
  emptyAsset,
  demonCorgiFishAsset,
  devilCorgiFishAsset,
  devilCorgiFishHappyAsset,
  eggFishAsset,
  fireballAsset,
  hellFishAsset,
  steamAsset,
  steamVentAsset,
} from '@/assets'
import { createController } from '@/engine'
import { createObjectSignal } from '@/engine/utils'
import { createBubbleController } from '../scenary/BubbleController'
import { getDiver, hitDiver, hitDiverIfTouching } from './Hazard'

let kissN = 0

export type SteamVentController = ReturnType<typeof createSteamVentController>

// A vent that blasts a column of steam on and off. The steam is a Hazard while it's on.
// `erupt` forces it on, for the devil's vent eruption
export function createSteamVentController(id: string, props: Vector & {
  direction: 'up' | 'down'
  length: number
  period?: number // Frames for a whole off-and-on cycle
  onFor?: number
  offset?: number
}) {
  const width = 80
  const ventHeight = 35
  const steamWidth = 70
  const period = props.period ?? 75
  const onFor = props.onFor ?? 38
  const offset = props.offset ?? 0
  const up = props.direction === 'up'

  const steam = createController({
    frames: [steamAsset],
    init() {
      const strength = createObjectSignal(0, 'strength')
      return {
        id: id + '-steam',
        type: 'steam',
        x: () => props.x - steamWidth / 2,
        y: () => up ? props.y - props.length : props.y,
        width: () => steamWidth,
        height: () => props.length,
        ...strength,
        style: () => ({ opacity: strength.strength() * 0.9 }),
        ...createObjectSignal(0, 'warning'), // Frames left before a forced eruption
        ...createObjectSignal(0, 'erupting'),
        yScale: () => up ? 1 : -1,
      }
    },
    onEnterFrame({ $, $scene, $age }) {
      const on = $.erupting() > 0 || ($.warning() === 0 && ($age + offset) % period < onFor)
      if ($.warning() > 0) {
        $.setWarning($.warning() - 1)
        if ($.warning() === 0) $.setErupting(50)
      } else if ($.erupting() > 0) {
        $.setErupting($.erupting() - 1)
      }
      $.setStrength(Math.max(0, Math.min(1, $.strength() + (on ? 0.25 : -0.2))))
      if ($.strength() > 0.6) {
        const top = up ? props.y - props.length : props.y
        const diver = getDiver($scene)
        const center = diver?.data.center()
        if (center && Math.abs(center.x - props.x) < steamWidth / 2 + 15 && center.y > top && center.y < top + props.length) {
          hitDiver($scene)
        }
      }
    },
  })

  const vent = createController({
    frames: [steamVentAsset],
    init() {
      return {
        id,
        type: 'steam-vent',
        x: () => props.x - width / 2,
        y: () => up ? props.y - 5 : props.y - ventHeight + 5,
        width: () => width,
        height: () => ventHeight,
        yScale: () => up ? 1 : -1,
        erupt: () => steam.data.setWarning(25),
        style: () => ({
          filter: steam.data.warning() > 0 ? 'brightness(2) drop-shadow(0 0 10px #ff4400)' : 'none',
        }),
      }
    },
  })

  return [steam, vent] as const
}

const turnRate = 0.12 // How much of the rest of the way round a Hell fish turns each frame

// Swims back and forth between two points, nose first, turning round at each end. A Hazard
export function createHellFishController(id: string, props: { from: Vector, to: Vector, speed?: number }) {
  const width = 90
  const height = 50
  const speed = props.speed ?? 0.008
  const phase = Math.random() * Math.PI * 2
  const travel = { x: props.to.x - props.from.x, y: props.to.y - props.from.y }
  const sideToSide = Math.abs(travel.x) > Math.abs(travel.y)
  // Which way it's heading, in degrees clockwise from facing right
  const headingAt = (phase: number) => Math.atan2(travel.y * Math.sin(phase), travel.x * Math.sin(phase)) * 180 / Math.PI

  return createController({
    frames: [hellFishAsset],
    init() {
      const heading = createObjectSignal(headingAt(phase), 'heading')
      // The trigger fish art it's tinted from faces right. Heading left, it's mirrored rather than
      // turned upside down
      const facingLeft = () => Math.abs(heading.heading()) > 90
      return {
        id,
        type: 'hell-fish',
        ...createObjectSignal(props.from.x, 'x'),
        ...createObjectSignal(props.from.y, 'y'),
        ...createObjectSignal(phase, 'phase'),
        ...heading,
        xScale: () => facingLeft() ? -1 : 1,
        rotation: () => facingLeft() ? heading.heading() - 180 * Math.sign(heading.heading()) : heading.heading(),
        width: () => width,
        height: () => height,
      }
    },
    onEnterFrame({ $, $scene }) {
      $.setPhase($.phase() + speed * Math.PI * 2)
      const t = (1 - Math.cos($.phase())) / 2
      const x = props.from.x + travel.x * t
      const y = props.from.y + travel.y * t
      // Swimming side to side, it just flips round. Otherwise it swings its nose round, the short way
      const target = headingAt($.phase())
      const turn = ((target - $.heading() + 540) % 360) - 180
      $.setHeading(sideToSide ? target : ((($.heading() + turn * turnRate) + 540) % 360) - 180)
      $.setX(x - width / 2)
      $.setY(y - height / 2)
      hitDiverIfTouching($scene, x, y, 26)
    },
  })
}

// Water rushing one way, carrying you along with it
export function createCurrentController(id: string, props: Rect & { push: Vector }) {
  const angle = Math.atan2(props.push.y, props.push.x) * 180 / Math.PI + 90
  return createController({
    frames: [emptyAsset],
    init() {
      const flow = createObjectSignal(0, 'flow')
      return {
        id,
        type: 'current',
        x: () => props.x,
        y: () => props.y,
        width: () => props.width,
        height: () => props.height,
        ...flow,
        // Streaks drifting the way the water flows
        style: () => ({
          background: `repeating-linear-gradient(${angle}deg, transparent 0 50px, rgba(255, 190, 140, 0.18) 50px 70px)`,
          'background-position': `${flow.flow()}px 0`,
          'border-radius': '60px',
        }),
      }
    },
    onEnterFrame({ $, $scene }) {
      $.setFlow(($.flow() + props.push.x * 3) % 200)
      const diver = getDiver($scene)
      if (!diver) return
      const center = diver.data.center()
      if (center.x > props.x && center.x < props.x + props.width && center.y > props.y && center.y < props.y + props.height) {
        diver.data.setX(diver.data.x() + props.push.x)
        diver.data.setY(diver.data.y() + props.push.y)
      }
    },
  })
}

export type DemonController = ReturnType<typeof createDemonController>

// Races you through Hell along its waypoints, stopping now and then to mock you
export function createDemonController(id: string, props: { path: Vector[], speed: number }) {
  const width = 128
  const height = width * 519 / 500 // The art's own proportions

  return createController({
    frames: [demonCorgiFishAsset],
    init() {
      return {
        id,
        type: 'demon',
        ...createObjectSignal(props.path[0].x - width / 2, 'x'),
        ...createObjectSignal(props.path[0].y - height / 2, 'y'),
        ...createObjectSignal(1, 'xScale'),
        ...createObjectSignal(0, 'waypoint'),
        ...createObjectSignal(false, 'racing'),
        ...createObjectSignal(0, 'waiting'), // Frames left stopped to mock you
        width: () => width,
        height: () => height,
      }
    },
    onEnterFrame({ $, $age }) {
      $.setY($.y() + Math.sin($age / 6) * 0.8)
      if (!$.racing()) return
      if ($.waiting() > 0) {
        $.setWaiting($.waiting() - 1)
        return
      }
      const target = props.path[$.waypoint()]
      if (!target) return
      const x = $.x() + width / 2
      const y = $.y() + height / 2
      const distance = Math.hypot(target.x - x, target.y - y)
      if (distance < props.speed) {
        $.setWaypoint($.waypoint() + 1)
        return
      }
      const direction = Math.atan2(target.y - y, target.x - x)
      $.setX($.x() + Math.cos(direction) * props.speed)
      $.setY($.y() + Math.sin(direction) * props.speed)
      $.setXScale(Math.cos(direction) >= 0 ? 1 : -1)
    },
  })
}

export type DevilController = ReturnType<typeof createDevilController>
export type DevilAttack = 'follow' | 'glow' | 'charge' | 'fireballs' | 'vents' | 'friendly'

// The boss of Hell. Big and slow, following you between attacks. Egg Fish kisses wear it down.
// The level chooses its attacks; this only moves and draws it
export function createDevilController(id: string, props: Vector & { arena: Rect }) {
  const width = 224
  const height = 140
  const { arena } = props

  return createController({
    frames: [devilCorgiFishAsset, devilCorgiFishHappyAsset],
    init() {
      const attack = createObjectSignal('follow' as DevilAttack, 'attack')
      const hurt = createObjectSignal(0, 'hurt')
      return {
        id,
        type: 'devil',
        ...createObjectSignal(props.x - width / 2, 'x'),
        ...createObjectSignal(props.y - height / 2, 'y'),
        ...createObjectSignal(1, 'xScale'),
        ...createObjectSignal(1, 'health'),
        ...createObjectSignal({ x: 0, y: 0 } as Vector, 'chargeDirection'),
        ...attack,
        ...hurt,
        width: () => width,
        height: () => height,
        frame: () => attack.attack() === 'friendly' ? 1 : 0,
        state: () => 'pause' as const,
        style: () => ({
          filter: attack.attack() === 'glow'
            ? 'brightness(1.6) drop-shadow(0 0 16px #ff2200)'
            : hurt.hurt() > 0 ? 'brightness(2)' : 'none',
          opacity: hurt.hurt() % 6 > 2 ? 0.6 : 1,
        }),
      }
    },
    onEnterFrame({ $, $scene }) {
      if ($.hurt() > 0) $.setHurt($.hurt() - 1)
      const diver = getDiver($scene)
      if (!diver) return
      const target = diver.data.center()
      const center = { x: $.x() + width / 2, y: $.y() + height / 2 }

      if ($.attack() === 'follow' || $.attack() === 'fireballs' || $.attack() === 'vents') {
        const direction = Math.atan2(target.y - center.y, target.x - center.x)
        $.setX($.x() + Math.cos(direction) * 2)
        $.setY($.y() + Math.sin(direction) * 2)
        $.setXScale(Math.cos(direction) >= 0 ? 1 : -1)
      } else if ($.attack() === 'charge') {
        $.setX($.x() + $.chargeDirection().x * 14)
        $.setY($.y() + $.chargeDirection().y * 14)
      }

      // Stay inside the arena
      $.setX(Math.max(arena.x, Math.min(arena.x + arena.width - width, $.x())))
      $.setY(Math.max(arena.y, Math.min(arena.y + arena.height - height, $.y())))

      if ($.attack() !== 'friendly') {
        hitDiverIfTouching($scene, center.x, center.y, 60)
      }
    },
  })
}

// Thrown by the devil in a spread. A Hazard
export function createFireballController(id: string, props: Vector & { velocity: Vector }) {
  const size = 34
  return createController({
    frames: [fireballAsset],
    init() {
      return {
        id,
        type: 'fireball',
        ...createObjectSignal(props.x - size / 2, 'x'),
        ...createObjectSignal(props.y - size / 2, 'y'),
        ...createObjectSignal(0, 'rotation'),
        width: () => size,
        height: () => size,
      }
    },
    onEnterFrame({ $, $scene, $age }) {
      $.setX($.x() + props.velocity.x)
      $.setY($.y() + props.velocity.y)
      $.setRotation($.rotation() + 15)
      if (hitDiverIfTouching($scene, $.x() + size / 2, $.y() + size / 2, 14) || $age > 150) {
        $scene.removeController($.id)
      }
    },
  })
}

// Egg Fish wandering the boss arena. They only kiss the devil, wearing its health down,
// then swim off and come back later
export function createArenaEggFishController(id: string, props: { arena: Rect, devil: DevilController, damage: number }) {
  const width = 60
  const height = 56
  const { arena, devil } = props
  const randomPoint = () => ({
    x: arena.x + 40 + Math.random() * (arena.width - 80 - width),
    y: arena.y + 40 + Math.random() * (arena.height - 80 - height),
  })
  const start = randomPoint()

  return createController({
    frames: [eggFishAsset],
    init() {
      return {
        id,
        type: 'arena-egg-fish',
        ...createObjectSignal(start.x, 'x'),
        ...createObjectSignal(start.y, 'y'),
        ...createObjectSignal(randomPoint(), 'target'),
        ...createObjectSignal(1, 'xScale'),
        ...createObjectSignal(0, 'away'), // Frames until it comes back after a kiss
        width: () => width,
        height: () => height,
      }
    },
    onEnterFrame({ $, $scene }) {
      if ($.away() > 0) {
        $.setAway($.away() - 1)
        if ($.away() === 0) {
          const point = randomPoint()
          $.setX(point.x)
          $.setY(point.y)
        }
        return
      }
      const target = $.target()
      const direction = Math.atan2(target.y - $.y(), target.x - $.x())
      $.setX($.x() + Math.cos(direction) * 1.5)
      $.setY($.y() + Math.sin(direction) * 1.5)
      $.setXScale(Math.cos(direction) >= 0 ? 1 : -1)
      if (Math.hypot(target.x - $.x(), target.y - $.y()) < 5) $.setTarget(randomPoint())

      const devilCenter = { x: devil.data.x() + devil.data.width() / 2, y: devil.data.y() + devil.data.height() / 2 }
      const center = { x: $.x() + width / 2, y: $.y() + height / 2 }
      const friendly = devil.data.attack() === 'friendly'
      if (!friendly && devil.data.hurt() === 0 && Math.hypot(devilCenter.x - center.x, devilCenter.y - center.y) < 95) {
        devil.data.setHealth(Math.max(0, devil.data.health() - props.damage))
        devil.data.setHurt(25)
        $scene.addController(createBubbleController('devil-kiss-' + kissN++, { x: center.x, y: center.y, type: 'kiss' }))
        $.setAway(100)
        $.setX(-1000)
      }
    },
  })
}
