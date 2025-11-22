import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import { DiverController } from './DiverController'
import { createIndicatorController } from './IndicatorController'
import { triggerFishAsset } from '@/assets'

export function createTriggerFishController(
  id: string,
  props: {
    x: number
  },
) {
  const triggerFishController = createController({
    frames: [triggerFishAsset],
    init() {
      const [x, setX] = createSignal<number>(props.x)
      const [y, setY] = createSignal<number>(Math.random() * 500 + 100)
      const [xScale, setXScale] = createSignal<number>(1)
      const [speed, setSpeed] = createSignal(5)
      const [jitter, setJitter] = createSignal({ x: 0, y: 0 })
      const [rotation, setRotation] = createSignal<number>(0)
      const [attack, setAttack] = createSignal(false)
      return {
        id,
        type: 'triggerfish',
        x,
        setX,
        y,
        setY,
        speed,
        setSpeed,
        width: () => 80,
        xScale,
        setXScale,
        setJitter,
        attack,
        setAttack,
        rotation,
        setRotation,
        style: () => ({
          translate: `${jitter().x}px ${jitter().y}px`,
          transition: 'translate 0.1s linear',
        }),
      }
    },
    onEnterFrame({ $, $game }) {
      const diver = $game.getControllerById('diver') as DiverController
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
          $game.gameStateActions.achievement('surviveTitanTriggerFish')
        }
      }

      $.setX($.x() - $.speed() * Math.cos(direction))
      $.setY($.y() - $.speed() * Math.sin(direction))
      $.setJitter({
        x: Math.random() * $.speed() - $.speed() / 2,
        y: Math.random() * $.speed() - $.speed() / 2,
      })

      if (distance < 10) {
        $game.gameStateActions.damage(5)
        $game.playSound('thud', { unique: true })
        $.setX($.x() + 10 * $.speed() * Math.cos(direction))
        $.setY($.y() + 10 * $.speed() * Math.sin(direction))
      }
    },
  })
  return [triggerFishController, createIndicatorController(triggerFishController, 'enemy')]
}
