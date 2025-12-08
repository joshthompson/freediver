import { createController } from '@/utils/game'
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
  const triggerFishController = createController({
    frames: [triggerFishAsset],
    init() {
      const [jitter, setJitter] = createSignal({ x: 0, y: 0 })
      return {
        id,
        type: 'triggerfish',
        ...createObjectSignal(props.x, 'x'),
        ...createObjectSignal(Math.random() * 500 + 100, 'y'),
        ...createObjectSignal(1, 'xScale'),
        ...createObjectSignal(5, 'speed'),
        ...createObjectSignal(0, 'rotation'),
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

      const targetX = diver.data.x() + 0
      const targetY = diver.data.y() + 80
      
      const distance = Math.hypot($.x() - targetX, $.y() - targetY)
      const direction = Math.atan2($.y() - targetY, $.x() - targetX)

      if (distance < 300) {
        $.setAttack(true)
        $.setSpeed((distance < 200 ? 8 : 5) * (Math.random() * 0.4 + 0.8))
        $.setRotation((direction * 180 / Math.PI) + 180)
        $.setXScale(1)
      } else {
        $.setSpeed(1.5)
        if ($.attack()) {
          $.setAttack(false)
          $scene.gameStateActions.achievement('surviveTitanTriggerFish')
        }
      }

      $.setX($.x() - $.speed() * Math.cos(direction))
      $.setY($.y() - $.speed() * Math.sin(direction))
      $.setJitter({
        x: Math.random() * $.speed() - $.speed() / 2,
        y: Math.random() * $.speed() - $.speed() / 2,
      })

      if (distance < 10) {
        $scene.gameStateActions.damage(5)
        $scene.playSound('thud', { unique: true })
        $.setX($.x() + 10 * $.speed() * Math.cos(direction))
        $.setY($.y() + 10 * $.speed() * Math.sin(direction))
      }
    },
  })
  return [triggerFishController, createIndicatorController(triggerFishController, 'enemy')]
}
