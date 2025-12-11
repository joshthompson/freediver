import { createController } from '@/engine'
import { createSignal } from 'solid-js'
import { DiverController } from '../main/DiverController'
import { createBubbleController } from '../scenary/BubbleController'
import { createIndicatorController } from '../utils/IndicatorController'
import { eggFishAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'

let bubbleN = 0
const minSpeed = 1
const maxSpeed = 4

export function createFriedEggFishController(
  id: string,
  props: {
    x: number
  },
) {
  const friedEggFishController = createController({
    frames: [eggFishAsset],
    init() {
      const [jitter, setJitter] = createSignal({ x: 0, y: 0 })
      return {
        id,
        type: 'friedeggfish',
        ...createObjectSignal(props.x, 'x'),
        ...createObjectSignal(Math.random() * 500 + 100, 'y'),
        ...createObjectSignal(1, 'xScale'),
        ...createObjectSignal(maxSpeed, 'speed'),
        ...createObjectSignal(0, 'rotation'),
        ...createObjectSignal(true, 'canGiveHealth'),
        width: () => 80,
        height: () => 75,
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

      if (distance < 300 && $.canGiveHealth()) {
        $.setSpeed(maxSpeed)
        $.setRotation((direction * 180 / Math.PI) + 180)
        $.setX($.x() - $.speed() * Math.cos(direction))
        $.setY($.y() - $.speed() * Math.sin(direction))
      } else {
        $.setSpeed(minSpeed)
        $.setX($.x() + $.speed())
        $.setRotation(0)
      }

      $.setJitter({
        x: Math.random() * $.speed() - $.speed() / 2,
        y: Math.random() * $.speed() - $.speed() / 2,
      })

      if (distance < 10 && $.canGiveHealth()) {
        $scene.gameStateActions.heal(50)
        $scene.gameStateActions.achievement('eggFishKiss')
        $.setCanGiveHealth(false)
        $scene.addController(createBubbleController('egg-fish-kiss-' + bubbleN++, {
          x: $.x(),
          y: $.y(),
          type: 'kiss',
        }))
      }
    },
  })
  return [friedEggFishController, createIndicatorController(friedEggFishController, 'friend')]
}
