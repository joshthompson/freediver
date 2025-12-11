import { createController } from '@/engine'
import { createSignal } from 'solid-js'
import { DiverController } from '../main/DiverController'
import { createIndicatorController } from '../utils/IndicatorController'
import { triggerFishAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'

export function createTriggerFishController(
  id: string,
  props: {
    x: number
  },
) {

  const base = {
    x: props.x,
    y: 350,
  }

  const chooseTarget = (): Vector => {
    return {
      x: base.x - (Math.random() * 1000 + 500),
      y: base.y + (Math.random() * 400 - 200),
    }
  }

  const triggerFishController = createController({
    frames: [triggerFishAsset],
    init() {
      const [jitter, setJitter] = createSignal({ x: 0, y: 0 })
      return {
        id,
        type: 'triggerfish',
        ...createObjectSignal(props.x, 'x'),
        ...createObjectSignal(base.y, 'y'),
        ...createObjectSignal(chooseTarget(), 'target'),
        ...createObjectSignal(1, 'xScale'),
        ...createObjectSignal(5, 'speed'),
        ...createObjectSignal(0, 'rotation'),
        ...createObjectSignal(1, 'yScale'),
        ...createObjectSignal(false, 'attack'),
        width: () => 80,
        height: () => 44,
        setJitter,
        style: () => ({
          translate: `${jitter().x}px ${jitter().y}px`,
          transition: 'translate 0.1s linear',
        }),
      }
    },
    onEnterFrame({ $, $scene }) {
      const diver = $scene.getControllerById('diver') as DiverController
      if (!diver) return

      // Get target/diver position
      let targetX = $.target().x
      let targetY = $.target().y
      const attackX = diver.data.x()
      const attackY = diver.data.y() + 80
      const attackDistance = Math.hypot($.x() - attackX, $.y() - attackY)

      // Decide whether to attack diver or go to target
      if (attackDistance < 300) {
        $.setAttack(true)
        targetX = attackX
        targetY = attackY
        $.setSpeed((attackDistance < 200 ? 8 : 5) * (Math.random() * 0.4 + 0.8))
      } else {
        $.setSpeed(1.5)
        if ($.attack()) {
          $.setAttack(false)
          $scene.gameStateActions.achievement('surviveTitanTriggerFish')
        }
      }

      // Move to target/diver
      const direction = Math.atan2($.y() - targetY, $.x() - targetX)
      $.setRotation((direction * 180 / Math.PI) + 180)
      $.setYScale($.rotation() > 90 && $.rotation() < 270 ? -1 : 1)
      $.setX($.x() - $.speed() * Math.cos(direction))
      $.setY($.y() - $.speed() * Math.sin(direction))
      $.setJitter({
        x: Math.random() * $.speed() - $.speed() / 2,
        y: Math.random() * $.speed() - $.speed() / 2,
      })

      // If reached target, set new target. If targetting the diver - attack!
      if (attackDistance < 10) {
        if ($.attack()) {
          $scene.gameStateActions.damage(5)
          $scene.playSound('thud', { unique: true })
          $.setX($.x() + 10 * $.speed() * Math.cos(direction))
          $.setY($.y() + 10 * $.speed() * Math.sin(direction))
        } else {
          $.setTarget(chooseTarget())
        }
      }
    },
  })
  return [triggerFishController, createIndicatorController(triggerFishController, 'enemy')]
}
