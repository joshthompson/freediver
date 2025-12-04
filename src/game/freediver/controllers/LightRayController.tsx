import { cva } from '@style/css'
import { createController } from '@/utils/game'
import { lightAsset, lightGreenAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'

export function createLightRayController(
  id: string,
  props: {
    x: number
    type?: 'white' | 'green'
  },
) {

  const type = props.type ?? 'white'

  return createController({
    frames: [type === 'white' ? lightAsset : lightGreenAsset],
    init() {
      return {
        id,
        type: 'light',
        ...createObjectSignal(props.x + Math.random() * 20 - 10, 'x'),
        ...createObjectSignal(type === 'white' ? -10 : Math.random() * 30 - 15, 'rotation'),
        y: () => 0,
        width: () => Math.random() * 30 + 70,
        height: () => 400,
        class: () => styles.ray({ type }),
        style: () => ({ 'animation-delay': `${-Math.random() * 5}s` })
      }
    },
    onMount({ $, $ref }) {
      // if (type === 'green') {
      //   $ref?.addEventListener('animationiteration', () => {
      //     $.setRotation(Math.random() * 30 - 15)
      //   })
      // }
    },
    onEnterFrame({ $, $scene }) {
      const offset = $.x() - $scene.canvas.get().x()
      if (offset < -100) {
        $.setX($.x() + $scene.canvas.get().width + 200)
        if (type === 'green') $.setRotation(Math.random() * 30 - 15)
      }
      if (offset > $scene.canvas.get().width + 100) {
        $.setX($.x() - $scene.canvas.get().width - 200)
        if (type === 'green') $.setRotation(Math.random() * 30 - 15)
      }
    },
  })
}

const styles = {
  ray: cva({
    base: {
      position: 'absolute',
      left: 'calc(var(--ray) * (100% / var(--total)))',
      width: '10px',
      height: '600px',
      top: '-10px',
      filter: 'blur(10px)',
      transformOrigin: 'top',
      animation: 'lightRay 5s linear infinite',
      opacity: 0,
    },
    variants: {
      type: {
        white: {
          background: 'linear-gradient(0deg, #FFFFFF00 0%, #FFFFFFFF 100%)',
        },
        green: {
          width: '3px',
          filter: 'blur(20px)',
          '--fade-opacity': '0.2',

          top: '-100px',
          height: '450px',
          // background: 'linear-gradient(0deg, #AAFFAA00 0%, #AAFFAAFF 100%)',
        },
      },
    }
  }),
}