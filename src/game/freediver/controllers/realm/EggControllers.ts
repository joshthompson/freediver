import { eggBulletAsset, friedEggAsset, scrambledEggMonsterAsset, scrambledEggMonsterHappyAsset } from '@/assets'
import { createController } from '@/engine'
import { createObjectSignal } from '@/engine/utils'
import { hitDiverIfTouching, touchesDiver } from './Hazard'

// Generous, since the diver is long and only their middle is checked
const grabRadius = 50
const corgiGrabRadius = 45

// A Fried Egg floating about, collected by the diver or Linkosha swimming into it
export function createFriedEggController(id: string, props: Vector & { onCollect: () => void }) {
  const width = 52
  const height = 44
  const phase = Math.random() * Math.PI * 2

  return createController({
    frames: [friedEggAsset],
    init() {
      return {
        id,
        type: 'fried-egg',
        ...createObjectSignal(props.x - width / 2, 'x'),
        ...createObjectSignal(props.y - height / 2, 'y'),
        ...createObjectSignal(0, 'rotation'),
        width: () => width,
        height: () => height,
      }
    },
    onEnterFrame({ $, $scene, $age }) {
      const y = props.y + Math.sin($age / 18 + phase) * 10
      $.setY(y - height / 2)
      $.setRotation(Math.sin($age / 30 + phase) * 20)
      const corgi = $scene.getControllerById('corgi')
      const corgiNear = corgi && Math.hypot(corgi.data.x() + 35 - props.x, corgi.data.y() + 22 - y) < corgiGrabRadius
      if (touchesDiver($scene, props.x, y, grabRadius) || corgiNear) {
        props.onCollect()
        $scene.removeController($.id)
      }
    },
  })
}

// A Fried Egg flying from the diver into the monster's mouth once the Egg-o-meter is full
export function createFlyingEggController(id: string, props: { from: Vector, to: () => Vector, delay: number }) {
  const size = 40
  return createController({
    frames: [friedEggAsset],
    init() {
      return {
        id,
        type: 'fried-egg',
        ...createObjectSignal(props.from.x, 'x'),
        ...createObjectSignal(props.from.y, 'y'),
        ...createObjectSignal(0, 'rotation'),
        width: () => size,
        height: () => size * 0.85,
      }
    },
    onEnterFrame({ $, $scene, $age }) {
      if ($age < props.delay) return
      const to = props.to()
      const direction = Math.atan2(to.y - $.y(), to.x - $.x())
      $.setX($.x() + Math.cos(direction) * 14)
      $.setY($.y() + Math.sin(direction) * 14)
      $.setRotation($.rotation() + 12)
      if (Math.hypot(to.x - $.x(), to.y - $.y()) < 20) $scene.removeController($.id)
    },
  })
}

// An egg fired by the Scrambled Egg Monster. A Hazard
export function createEggBulletController(id: string, props: Vector & { velocity: Vector, bounds: Rect }) {
  const width = 22
  const height = 28
  const { bounds } = props

  return createController({
    frames: [eggBulletAsset],
    init() {
      return {
        id,
        type: 'egg-bullet',
        ...createObjectSignal(props.x - width / 2, 'x'),
        ...createObjectSignal(props.y - height / 2, 'y'),
        rotation: () => Math.atan2(props.velocity.y, props.velocity.x) * 180 / Math.PI + 90,
        width: () => width,
        height: () => height,
      }
    },
    onEnterFrame({ $, $scene, $age }) {
      $.setX($.x() + props.velocity.x)
      $.setY($.y() + props.velocity.y)
      const x = $.x() + width / 2
      const y = $.y() + height / 2
      const outside = x < bounds.x - 100 || x > bounds.x + bounds.width + 100
        || y < bounds.y - 100 || y > bounds.y + bounds.height + 100
      if (hitDiverIfTouching($scene, x, y, 11) || outside || $age > 250) {
        $scene.removeController($.id)
      }
    },
  })
}

export type ScrambledEggMonsterController = ReturnType<typeof createScrambledEggMonsterController>

// The Fried Egg realm's boss. The level moves it about with goTo and sets its size and mood
export function createScrambledEggMonsterController(id: string, props: Vector) {
  const baseWidth = 160
  const baseHeight = 144

  return createController({
    frames: [scrambledEggMonsterAsset, scrambledEggMonsterHappyAsset],
    init() {
      const size = createObjectSignal(1, 'size')
      const happy = createObjectSignal(false, 'happy')
      // Positioned by its centre
      const centerX = createObjectSignal(props.x, 'centerX')
      const centerY = createObjectSignal(props.y, 'centerY')
      const bob = createObjectSignal(0, 'bob')
      return {
        id,
        type: 'egg-monster',
        ...centerX,
        ...centerY,
        ...bob,
        ...createObjectSignal({ ...props } as Vector, 'target'),
        ...createObjectSignal(4, 'speed'),
        ...size,
        ...happy,
        x: () => centerX.centerX() - baseWidth * size.size() / 2,
        y: () => centerY.centerY() - baseHeight * size.size() / 2 + bob.bob(),
        width: () => baseWidth * size.size(),
        height: () => baseHeight * size.size(),
        frame: () => happy.happy() ? 1 : 0,
        state: () => 'pause' as const,
      }
    },
    onEnterFrame({ $, $age }) {
      const target = $.target()
      const distance = Math.hypot(target.x - $.centerX(), target.y - $.centerY())
      if (distance > $.speed()) {
        const direction = Math.atan2(target.y - $.centerY(), target.x - $.centerX())
        $.setCenterX($.centerX() + Math.cos(direction) * $.speed())
        $.setCenterY($.centerY() + Math.sin(direction) * $.speed())
      }
      $.setBob(Math.sin($age / 10) * 4)
    },
  })
}
