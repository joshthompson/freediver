import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import eggfish from '@assets/sprites/fish/egg.png'
import { DiverController } from './DiverController'
import { createBubbleController } from './BubbleController'

let bubbleN = 0

export function createFriedEggFishController(
  id: string,
  props: {
    x: number
  },
) {
  return createController({
    frames: [eggfish],
    init() {
      const [x, setX] = createSignal<number>(props.x)
      const [y, setY] = createSignal<number>(Math.random() * 500 + 100)
      const [xScale, setXScale] = createSignal<number>(1)
      const [speed, setSpeed] = createSignal(5)
      const [jitter, setJitter] = createSignal({ x: 0, y: 0 })
      const [rotation, setRotation] = createSignal<number>(0)
      const [canGiveHealth, setCanGiveHealth] = createSignal(true)
      return {
        id,
        type: 'friedeggfish',
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
        canGiveHealth,
        setCanGiveHealth,
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

      if (distance < 300 && $.canGiveHealth()) {
        $.setSpeed(4)
        $.setRotation((direction * 180 / Math.PI) + 180)
        $.setX($.x() - $.speed() * Math.cos(direction))
        $.setY($.y() - $.speed() * Math.sin(direction))
      } else {
        $.setSpeed(1)
        $.setX($.x() + $.speed())
        $.setRotation(0)
      }

      $.setJitter({
        x: Math.random() * $.speed() - $.speed() / 2,
        y: Math.random() * $.speed() - $.speed() / 2,
      })

      if (distance < 10 && $.canGiveHealth()) {
        $game.gameStateActions.heal(50)
        $game.gameStateActions.achievement('eggFishKiss')
        $.setCanGiveHealth(false)
        $game.addController(createBubbleController('egg-fish-kiss-' + bubbleN++, {
          x: $.x(),
          y: $.y(),
          type: 'kiss',
        }))
      }
    },
  })
}
