import { asteroidAsset, spaceJellyfishAsset, spaceUrchinAsset } from '@/assets'
import { createController } from '@/engine'
import { createObjectSignal } from '@/engine/utils'
import { hitDiverIfTouching } from './Hazard'

// Drifts back and forth between two points, spinning. A Hazard
export function createAsteroidController(id: string, props: {
  from: Vector // Centres it travels between
  to: Vector
  size?: number
  speed?: number // Fraction of the trip per frame
}) {
  const size = props.size ?? 110
  const speed = props.speed ?? 0.006
  const spin = (Math.random() - 0.5) * 4

  return createController({
    frames: [asteroidAsset],
    init() {
      return {
        id,
        type: 'asteroid',
        ...createObjectSignal(props.from.x - size / 2, 'x'),
        ...createObjectSignal(props.from.y - size / 2, 'y'),
        ...createObjectSignal(Math.random() * 360, 'rotation'),
        ...createObjectSignal(Math.random() * Math.PI * 2, 'phase'),
        width: () => size,
        height: () => size,
      }
    },
    onEnterFrame({ $, $scene }) {
      $.setPhase($.phase() + speed * Math.PI * 2)
      const t = (1 - Math.cos($.phase())) / 2
      const x = props.from.x + (props.to.x - props.from.x) * t
      const y = props.from.y + (props.to.y - props.from.y) * t
      $.setX(x - size / 2)
      $.setY(y - size / 2)
      $.setRotation($.rotation() + spin)
      hitDiverIfTouching($scene, x, y, size * 0.42)
    },
  })
}

// Sits still, pulsing. A Hazard
export function createSpaceUrchinController(id: string, props: Vector & { size?: number }) {
  const size = props.size ?? 80
  return createController({
    frames: [spaceUrchinAsset],
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
