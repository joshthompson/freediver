import { bubbleAsset, emptyAsset } from '@/assets'
import { createController, Scene } from '@/engine'
import { createObjectSignal } from '@/engine/utils'
import { getDiver, touchesDiver } from './Hazard'

export type AirPocketController = ReturnType<typeof createAirPocketController>

// A space you stay inside to breathe. Whatever owns the breathing rules asks `contains` each frame
export function createAirPocketController(id: string, props: { x: number, y: number, radius: number }) {
  return createController({
    frames: [emptyAsset],
    init() {
      const wobble = createObjectSignal(1, 'wobble')
      return {
        id,
        type: 'air-pocket',
        x: () => props.x - props.radius,
        y: () => props.y - props.radius,
        width: () => props.radius * 2,
        height: () => props.radius * 2,
        ...wobble,
        xScale: wobble.wobble,
        yScale: () => 2 - wobble.wobble(),
        // A glassy bubble drawn in CSS, so it stays crisp however big it is
        style: () => ({
          'border-radius': '50%',
          background: `radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.22), transparent 14%),
            radial-gradient(circle, rgba(170, 225, 255, 0.07) 0 62%, rgba(200, 240, 255, 0.35) 70%, rgba(200, 240, 255, 0) 71%)`,
          'box-shadow': '0 0 30px rgba(170, 225, 255, 0.25)',
        }),
        contains: (point: Vector) => Math.hypot(point.x - props.x, point.y - props.y) < props.radius,
      }
    },
    onEnterFrame({ $, $age }) {
      $.setWobble(1 + Math.sin($age / 20 + props.x) * 0.02)
    },
  })
}

// Whether the diver's middle is inside any air pocket
export function isInAirPocket(pockets: AirPocketController[], $scene: Scene) {
  const diver = getDiver($scene)
  if (!diver) return false
  const center = diver.data.center()
  return pockets.some(pocket => pocket.data.contains(center))
}

// A pickup that gives back a fixed amount of oxygen once, then floats back after a while
export function createAirBubbleController(id: string, props: {
  x: number
  y: number
  amount?: number
  respawnSeconds?: number
}) {
  const size = 44
  const amount = props.amount ?? 25
  const respawnFrames = (props.respawnSeconds ?? 10) * 25

  return createController({
    frames: [bubbleAsset],
    init() {
      const gone = createObjectSignal(0, 'gone') // Frames until it floats back
      return {
        id,
        type: 'air-bubble',
        x: () => props.x - size / 2,
        ...createObjectSignal(props.y - size / 2, 'y'),
        ...gone,
        width: () => size,
        height: () => size,
        style: () => ({
          opacity: gone.gone() > 0 ? 0 : 0.9,
          filter: 'drop-shadow(0 0 6px rgba(200, 255, 255, 0.9))',
        }),
      }
    },
    onEnterFrame({ $, $scene, $age }) {
      $.setY(props.y - size / 2 + Math.sin($age / 10 + props.x) * 5)
      if ($.gone() > 0) {
        $.setGone($.gone() - 1)
        return
      }
      if (touchesDiver($scene, props.x, props.y, size / 2)) {
        $scene.gameStateActions.heal(amount)
        $.setGone(respawnFrames)
      }
    },
  })
}
