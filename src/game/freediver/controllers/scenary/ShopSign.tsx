import { css } from '@style/css'
import { emptyAsset } from '@/assets'
import { createController } from '@/engine'
import { createObjectSignal } from '@/engine/utils'
import { Locale, Translations } from '../../data/Translations'

type Translation = typeof Translations[Locale]

// A little wooden board with a shop's name on it, centred in `width`, in the game's language
export function createShopSignController(id: string, props: {
  x: number
  y: number
  width: number
  name: (t: Translation) => string
}) {
  return createController({
    frames: [emptyAsset],
    init() {
      const locale = createObjectSignal(undefined as Locale | undefined, 'locale')
      return {
        id,
        type: 'shop-sign',
        x: () => props.x,
        y: () => props.y,
        width: () => props.width,
        height: () => 26,
        ...locale,
        children: () => {
          const current = locale.locale()
          if (!current) return null
          return <div class={styles.sign}><span>{props.name(Translations[current])}</span></div>
        },
      }
    },
    onEnterFrame({ $, $scene }) {
      $.setLocale($scene.gameState.options.locale)
    },
  })
}

const styles = {
  sign: css({
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    '& span': {
      p: '1px 12px 0',
      background: '#9A6640',
      border: '2px solid #5C3A24',
      borderRadius: '5px',
      boxShadow: '0 2px 4px #00000066, inset 0 1px 0 #C08A5C',
      color: '#F3E3C3',
      fontSize: '15px',
      lineHeight: '20px',
      whiteSpace: 'nowrap',
      textShadow: '1px 1px 0 #4A2E1C',
    },
  }),
}
