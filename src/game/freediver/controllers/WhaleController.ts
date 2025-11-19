import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import whale from '@assets/sprites/whale.png'

export function createWhaleController(id: string) {
  const width = 800
  const frames = [whale]

  return createController({
    frames,
    randomStartFrame: true,
    init() {
      const [x, setX] = createSignal<number>(2000)
      return {
        id,
        type: 'whale',
        x,
        setX,
        y: () => 90,
        speed: () => 1,
        width: () => width,
        style: () => ({ filter: `brightness(0.3)`, opacity: 0.2 }),
        parallax: () => 1 / 3.5,
      }
    },
    onEnterFrame({ $, $game, $controller }) {
      $.setX($.x() - $.speed())
      if ($game.getController('diver')?.hitTest($controller)) {
        $game.gameStateActions.achievement('whale')
      }
    },
  })
}
