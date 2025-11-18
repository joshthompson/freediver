import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import boat from '@assets/sprites/boat.png'
import { css } from '@style/css'

export function createBoatController(id: string) {
  const baseY = 300
  return createController({
    frames: [boat],
    init() {
      const [y, setY] = createSignal<number>(baseY)
      return {
        id,
        type: 'boat',
        x: () => 250,
        y,
        setY,
        width: () => 200,
        class: () => css({
          _after: {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(0deg, #399cdcEE 20%, #399cdc00 30%)',
          },
        }),
      }
    },
    onEnterFrame({ $, $age }) {
      const float = Math.cos(10 + $age / 10) * 2
      $.setY(baseY + float)
    }
  })
}
