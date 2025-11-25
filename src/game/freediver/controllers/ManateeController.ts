import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import { manatee0Asset, manateeAsset } from '@/assets'
import { generateFrames } from '@/utils'
import { Sprite } from '@/game/core/Sprite'

export type ManateeController = ReturnType<typeof createManateeController>

export function createManateeController(id: string, props: { x: number, y: number }) {
  const width = 200
  return createController({
    // frames: [manateeAsset],
    frames: generateFrames(manatee0Asset, 244, 141, width, 4),
    init() {
      const [x, setX] = createSignal(props.x)
      const [y, setY] = createSignal(props.y)
      const [xScale, setXScale] = createSignal(-1)
      const [target, setTarget] = createSignal({
        x: Math.random() * 20000 - 10000,
        y: Math.random() * 400 + 100
      })
      const [state, setState] = createSignal<Sprite['state']>('pause')
      return {
        id,
        type: 'manatee',
        x, setX,
        y, setY,
        width: () => width,
        xScale,
        setXScale,
        speed: () => 5,
        target,
        setTarget,
        state,
        setState,
      }
    },
    onEnterFrame({ $, $age, $game }) {
      const float = Math.cos($age / 10 - 0.2)
      $.setY($.y() + float)

      if ($game.gameState.questState.cow?.state === 'reunited') {
        $.setState('play')
        const direction = Math.atan2($.y() - $.target().y, $.x() - $.target().x)
        const distance = Math.hypot($.x() - $.target().x, $.y() - $.target().y)
        $.setX($.x() - $.speed() * Math.cos(direction))
        $.setY($.y() - $.speed() * Math.sin(direction))
        $.setXScale($.x() < $.target().x ? 1 : -1)
        $game.setGameState('questState', 'cow', 'x', $.x())
        console.log({ target: $.target().x })
        if (distance < 20) {
          $.setTarget({
            x: Math.random() * 20000 - 10000,
            y: Math.random() * 400 + 100
          })
        } 
      } else {
        $.setState('pause')
      }
    }
  })
}
