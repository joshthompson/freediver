import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import shark from '@assets/sprites/shark.png'

export function createSharkController(id: string) {
  const width = 300
  const frames = [shark]

  return createController({
    frames,
    init() {
      const [x, setX] = createSignal<number>(5000)
      return {
        id,
        type: 'whale-shark',
        x,
        setX,
        y: () => 90,
        speed: () => 2,
        width: () => width,
        parallax: () => 1 / 2.5,
      }
    },
    onEnterFrame({ $, $game, $controller }) {
      $.setX($.x() - $.speed())
      if ($game.getControllerById('diver')?.hitTest($controller)) {
        $game.gameStateActions.achievement('shark')
      }
    },
  })
}
