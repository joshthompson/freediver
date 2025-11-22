import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import { whaleSharkAsset } from '@/assets'

export function createWhaleSharkController(id: string) {
  const width = 600
  const frames = [whaleSharkAsset]

  return createController({
    frames,
    init() {
      const [x, setX] = createSignal<number>(-2000)
      return {
        id,
        type: 'whale-shark',
        x,
        setX,
        y: () => 90,
        speed: () => 1,
        width: () => width,
        parallax: () => 1 / 3.5,
        style: () => ({ filter: 'brightness(0.8)' }),
      }
    },
    onEnterFrame({ $, $game, $controller }) {
      $.setX($.x() + $.speed())
      if ($game.getControllerById('diver')?.hitTest($controller)) {
        $game.gameStateActions.achievement('whaleShark')
      }
    },
  })
}
