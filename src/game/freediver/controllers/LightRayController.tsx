import { css } from '@style/css'
import light from '@assets/sprites/light.png'
import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'

export function createLightRayController(
  id: string,
  props: {
    x: number
  },
) {
  return createController({
    frames: [light],
    init() {
      const [x, setX] = createSignal<number>(props.x + Math.random() * 20 - 10)
      return {
        id,
        type: 'light',
        x,
        setX,
        y: () => 0,
        width: () => Math.random() * 30 + 70,
        height: () => 400,
        class: () => styles.ray,
        rotation: () => -10,
        style: () => ({ "animation-delay": `${-Math.random() * 5}s` })
      }
    },
    onEnterFrame({ $, $game }) {
      const offset = $.x() - $game.canvas().x()
      if (offset < -100) $.setX($.x() + $game.canvas().width + 200)
      if (offset > $game.canvas().width + 100) $.setX($.x() - $game.canvas().width - 200)
      console.log()
    },
  })
}

const styles = {
  ray: css({
    position: 'absolute',
    left: 'calc(var(--ray) * (100% / var(--total)))',
    width: '10px',
    height: '600px',
    top: '-10px',
    background: 'linear-gradient(0deg, #FFFFFF00 0%, #FFFFFFFF 100%)',
    filter: 'blur(10px)',
    transformOrigin: 'top',
    animation: 'lightRay 5s linear infinite',
  }),
}