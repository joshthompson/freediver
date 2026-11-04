import {
  asteroid1Asset, asteroid2Asset, asteroid3Asset,
  octopusAsset,
  spaceJellyfishAsset,
  spaceUrchin1Asset, spaceUrchin2Asset, spaceUrchin3Asset,
} from '@/assets'
import { createController } from '@/engine'
import { createObjectSignal } from '@/engine/utils'
import { generateFrames } from '@/utils'
import { hitDiverIfTouching } from './Hazard'

// Each image with its height for a width of 1, as they aren't square
const asteroidLooks = [
  { asset: asteroid1Asset, aspect: 162 / 150 },
  { asset: asteroid2Asset, aspect: 207 / 150 },
  { asset: asteroid3Asset, aspect: 167 / 150 },
]
let asteroidN = 0

// Drifts back and forth between two points, spinning. A Hazard
export function createAsteroidController(id: string, props: {
  from: Vector // Centres it travels between
  to: Vector
  size?: number
  speed?: number // Fraction of the trip per frame
}) {
  const size = props.size ?? 110 // The width
  const speed = props.speed ?? 0.006
  const spin = (Math.random() - 0.5) * 4
  // Takes turns between the images so every one shows up
  const look = asteroidLooks[asteroidN++ % asteroidLooks.length]
  const height = size * look.aspect

  return createController({
    frames: [look.asset],
    init() {
      return {
        id,
        type: 'asteroid',
        ...createObjectSignal(props.from.x - size / 2, 'x'),
        ...createObjectSignal(props.from.y - height / 2, 'y'),
        ...createObjectSignal(Math.random() * 360, 'rotation'),
        ...createObjectSignal(Math.random() * Math.PI * 2, 'phase'),
        width: () => size,
        height: () => height,
      }
    },
    onEnterFrame({ $, $scene }) {
      $.setPhase($.phase() + speed * Math.PI * 2)
      const t = (1 - Math.cos($.phase())) / 2
      const x = props.from.x + (props.to.x - props.from.x) * t
      const y = props.from.y + (props.to.y - props.from.y) * t
      $.setX(x - size / 2)
      $.setY(y - height / 2)
      $.setRotation($.rotation() + spin)
      hitDiverIfTouching($scene, x, y, (size + height) / 2 * 0.42)
    },
  })
}

// All near enough square to draw square
const urchinAssets = [spaceUrchin1Asset, spaceUrchin2Asset, spaceUrchin3Asset]
let urchinN = 0

// Sits still, pulsing. A Hazard
export function createSpaceUrchinController(id: string, props: Vector & { size?: number }) {
  const size = props.size ?? 80
  // Takes turns between the images so every one shows up
  const asset = urchinAssets[urchinN++ % urchinAssets.length]
  return createController({
    frames: [asset],
    init() {
      const pulse = createObjectSignal(1, 'pulse')
      return {
        id,
        type: 'space-urchin',
        x: () => props.x - size / 2,
        y: () => props.y - size / 2,
        width: () => size,
        height: () => size,
        ...pulse,
        xScale: pulse.pulse,
        yScale: pulse.pulse,
        ...createObjectSignal(Math.random() * 360, 'rotation'),
      }
    },
    onEnterFrame({ $, $scene, $age }) {
      $.setPulse(1 + Math.sin($age / 8 + props.x) * 0.06)
      $.setRotation($.rotation() + 0.5)
      hitDiverIfTouching($scene, props.x, props.y, size * 0.38)
    },
  })
}

// Bobs up and down around where it starts. A Hazard
export function createSpaceJellyfishController(id: string, props: Vector & { range?: number }) {
  const width = 60
  const height = 85
  const range = props.range ?? 120
  const phase = Math.random() * Math.PI * 2

  return createController({
    frames: [spaceJellyfishAsset],
    init() {
      return {
        id,
        type: 'space-jellyfish',
        ...createObjectSignal(props.x - width / 2, 'x'),
        ...createObjectSignal(props.y - height / 2, 'y'),
        ...createObjectSignal(1, 'yScale'),
        width: () => width,
        height: () => height,
      }
    },
    onEnterFrame({ $, $scene, $age }) {
      const y = props.y + Math.sin($age / 40 + phase) * range
      const x = props.x + Math.sin($age / 70 + phase) * 30
      $.setX(x - width / 2)
      $.setY(y - height / 2)
      $.setYScale(1 + Math.sin($age / 6 + phase) * 0.08)
      hitDiverIfTouching($scene, x, y - 10, 26)
    },
  })
}

// Harmless scenery floating across the realm, wrapping around at its edges
export function createDrifterController(id: string, props: Vector & {
  frames: string[]
  width: number
  height: number
  bounds: Rect
  speed?: Vector
  spin?: number
  frameInterval?: number
}) {
  const speed = props.speed ?? { x: 1, y: 0 }
  const spin = props.spin ?? 0
  const { bounds } = props

  return createController({
    frames: props.frames,
    randomStartFrame: true,
    init() {
      return {
        id,
        type: 'drifter',
        ...createObjectSignal(props.x, 'x'),
        ...createObjectSignal(props.y, 'y'),
        ...createObjectSignal(0, 'rotation'),
        xScale: () => speed.x < 0 ? -1 : 1,
        width: () => props.width,
        height: () => props.height,
        state: () => 'play' as const,
        frameInterval: () => props.frameInterval ?? 200,
      }
    },
    onEnterFrame({ $, $age }) {
      let x = $.x() + speed.x
      let y = $.y() + speed.y + Math.sin($age / 20 + props.x) * 0.5
      if (x > bounds.x + bounds.width) x = bounds.x - props.width
      if (x < bounds.x - props.width) x = bounds.x + bounds.width
      if (y > bounds.y + bounds.height) y = bounds.y - props.height
      if (y < bounds.y - props.height) y = bounds.y + bounds.height
      $.setX(x)
      $.setY(y)
      $.setRotation($.rotation() + spin)
    },
  })
}

// Swims one way for a few seconds, then turns to a new random direction. Scenery, like the
// octopi in the ocean, and turns back before it leaves the realm
export function createSpaceOctopusController(id: string, props: Vector & { bounds: Rect }) {
  const { bounds } = props
  const size = Math.random() * 1.2 + 0.6
  const turnSpeed = 2 // Degrees a frame
  const edge = 150 // How close to the edge of the realm before it heads back in
  const randomHeading = () => Math.random() * 360 - 180

  return createController({
    frames: generateFrames(octopusAsset, 300, 340, 33, 10),
    randomStartFrame: true,
    init() {
      const heading = createObjectSignal(randomHeading(), 'heading') // Degrees clockwise from right, where the sprite faces
      const headingLeft = () => Math.abs(heading.heading()) > 90
      const hue = Math.random() * 360
      return {
        id,
        type: 'space-octopus',
        ...createObjectSignal(props.x, 'x'),
        ...createObjectSignal(props.y, 'y'),
        ...heading,
        ...createObjectSignal(heading.heading(), 'targetHeading'),
        ...createObjectSignal(0, 'nextTurn'),
        width: () => 33, // The sheet's 300×340 frames, with the octopus the same size as before
        height: () => 37.4,
        // Flipped when heading left, so it never swims upside down
        xScale: () => headingLeft() ? -size : size,
        yScale: () => size,
        rotation: () => headingLeft() ? heading.heading() - 180 : heading.heading(),
        style: () => ({ filter: `hue-rotate(${hue}deg)` }),
        state: () => 'play' as const,
      }
    },
    onEnterFrame({ $, $age, $currentFrame }) {
      const x = $.x()
      const y = $.y()
      if (x < bounds.x + edge || x > bounds.x + bounds.width - edge || y < bounds.y + edge || y > bounds.y + bounds.height - edge) {
        const middle = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }
        $.setTargetHeading(Math.atan2(middle.y - y, middle.x - x) * 180 / Math.PI)
      } else if ($age >= $.nextTurn()) {
        $.setTargetHeading(randomHeading())
        $.setNextTurn($age + 50 + Math.random() * 75) // 2 to 5 seconds
      }

      // Turn the short way round towards the target
      const difference = (($.targetHeading() - $.heading() + 540) % 360) - 180
      const turn = Math.max(-turnSpeed, Math.min(turnSpeed, difference))
      $.setHeading((($.heading() + turn + 540) % 360) - 180)

      // A push with the tentacles, then a glide, as in the ocean
      const push = [7, 8].includes($currentFrame) ? 5 : [6, 9].includes($currentFrame) ? 4 : [5, 0].includes($currentFrame) ? 2 : 1
      const angle = $.heading() * Math.PI / 180
      $.setX(x + Math.cos(angle) * push * size)
      $.setY(y + Math.sin(angle) * push * size)
    },
  })
}
