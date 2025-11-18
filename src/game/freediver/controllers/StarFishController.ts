import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import starfish from '@assets/sprites/starfish.png'
import { DiverArmController } from './DiverController'

export function createStarfishController(
  id: string,
) {
  return createController({
    frames: [starfish],
    init() {
      const [x, setX] = createSignal<number>(100)
      const [y, setY] = createSignal<number>(200)
      const [rotation, setRotation] = createSignal<number>(200)
      const [age, setAge] = createSignal<number>(0)
      const [hue, setHue] = createSignal(Math.random() * 360)
      const [width, setWidth] = createSignal<number>(Math.random() * 24 + 24)
      return {
        id,
        type: 'starfish',
        x,
        setX,
        y,
        setY,
        rotation,
        setRotation,
        setAge,
        width,
        setWidth,
        setHue,
        origin: () => ({ x: width() / 2, y: width() }),
        style: () => ({
          filter: `
            drop-shadow(0 0 ${(Math.sin(age() / 5) + 1.5) * 5}px #FFFFFF88)
            brightness(${Math.sin(age() / 5) / 4 + 1.5})
            hue-rotate(${hue()}deg)
          `,  
        }),
      }
    },
    onEnterFrame({ $, $game, $age, $controller }) {
      $.setAge($age)
      $.setY(200 + Math.sin($age / 3) * 5)
      $.setRotation(0 + Math.sin($age / 12) * 10)

      const diverArmLeft = $game.getController('diver-arm-left') as DiverArmController
      const diverArmRight = $game.getController('diver-arm-left') as DiverArmController
      const caught = diverArmLeft?.hitTest($controller) || diverArmRight?.hitTest($controller)

      if (caught) {
        $game.playSound('starfish', { volume: 0.5, unique: true })
        $.setX(Math.random() * $game.canvas().width)
        $.setY(Math.random() * $game.canvas().height * 0.35 + $game.canvas().height * 0.6)
        $.setHue(Math.random() * 360)
        $.setWidth(Math.random() * 24 + 24)

        // Increase score
        $game.gameStateActions.score(1)
      }
    },
  })
}
