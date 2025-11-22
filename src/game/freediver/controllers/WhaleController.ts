import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import { whaleAsset } from '@/assets'

export function createWhaleController(id: string) {
  const width = 800
  const frames = [whaleAsset]

  return createController({
    frames,
    init() {
      const [x, setX] = createSignal<number>(2000)
      return {
        id,
        type: 'whale',
        x,
        setX,
        y: () => 100,
        speed: () => 1,
        width: () => width,
        parallax: () => 1 / 3.5,
        style: () => ({ filter: 'brightness(0.6)' }),
      }
    },
    onEnterFrame({ $, $game, $controller }) {
      $.setX($.x() - $.speed())
      if ($game.getControllerById('diver')?.hitTest($controller)) {
        $game.gameStateActions.achievement('whale')
      }
    },
  })
}
