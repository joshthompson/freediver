import { createController } from '@/engine'
import { createSignal } from 'solid-js'
import { DiverArmController, DiverController } from '../main/DiverController'
import { starfishAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'

export function createStarfishController(
  id: string,
  props: { x: number }
) {
  const randomY = () => Math.random() * 500 + 150
  return createController({
    frames: [starfishAsset],
    init() {
      const baseY = createObjectSignal(randomY(), 'baseY')
      const [age, setAge] = createSignal(0)
      const [hue, setHue] = createSignal(Math.random() * 360)
      const [width, setWidth] = createSignal(Math.random() * 24 + 24)
      const [hidden, setHidden] = createSignal(false)
      return {
        id,
        type: 'starfish',
        ...createObjectSignal(props.x, 'x'),
        ...baseY,
        ...createObjectSignal(baseY.baseY(), 'y'),
        ...createObjectSignal(200, 'rotation'),
        setAge,
        width,
        setWidth,
        height: () => width() * 0.94,
        setHue,
        hidden,
        setHidden,
        origin: () => ({ x: width() / 2, y: width() }),
        style: () => ({
          display: hidden() ? 'none' : 'block',
          filter: `
            drop-shadow(0 0 ${(Math.sin(age() / 5) + 1.5) * 5}px #FFFFFF88)
            brightness(${Math.sin(age() / 5) / 4 + 1.5})
            hue-rotate(${hue()}deg)
          `,  
        }),
      }
    },
    onEnterFrame({ $, $scene, $age, $controller }) {
      if ($.hidden()) {
        const diver = $scene.getControllerById('diver') as DiverController
        const distance = Math.hypot($.x() - diver.data.x(), $.y() - diver.data.y())
        if (distance > 1000) {
          $.setHidden(false)
        }
      } else {
        $.setAge($age)
        $.setY($.baseY() + Math.sin($age / 3) * 5)
        $.setRotation(0 + Math.sin($age / 12) * 10)

        const diverArmFront = $scene.getControllerById('diver-arm-front') as DiverArmController
        const diverArmBack = $scene.getControllerById('diver-arm-back') as DiverArmController
        const caught = diverArmFront?.hitTest($controller) || diverArmBack?.hitTest($controller)

        if (caught) {
          $scene.playSound('starfish', { volume: 0.5, unique: true })
  
          $.setX($.x() + Math.random() * 400 - 200)
          $.setBaseY(randomY())
          $.setHue(Math.random() * 360)
          $.setWidth(Math.random() * 24 + 24)
          $.setHidden(true)
  
          // Increase score
          $scene.gameStateActions.score(1)
        }
      }

      
    },
  })
}
