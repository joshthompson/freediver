import { css } from '@style/css'
import { createController } from '@/utils/game'
import { lightAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'

export function createLightRayController(
  id: string,
  props: {
    x: number
  },
) {
  return createController({
    frames: [lightAsset],
    init() {
      return {
        id,
        type: 'light',
        ...createObjectSignal(props.x + Math.random() * 20 - 10, 'x'),
        y: () => 0,
        width: () => Math.random() * 30 + 70,
        height: () => 400,
        class: () => styles.ray,
        rotation: () => -10,
        style: () => ({ "animation-delay": `${-Math.random() * 5}s` })
      }
    },
    onEnterFrame({ $, $scene }) {
      const offset = $.x() - $scene.canvas.get().x()
      if (offset < -100) $.setX($.x() + $scene.canvas.get().width + 200)
      if (offset > $scene.canvas.get().width + 100) $.setX($.x() - $scene.canvas.get().width - 200)
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