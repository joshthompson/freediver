import { css } from '@style/css'
import { emptyAsset } from '@/assets'
import { createController } from '@/engine'
import { createObjectSignal, Key } from '@/engine/utils'
import { Locale, Translations } from '../../data/Translations'

const pauseGap = 120 // ms between frames that means gameplay was paused in between

type Translation = typeof Translations[Locale]

// "SPACE: <action>", shown above something you can use while you're close enough, like a Portal or
// the shop. Call freshPress every frame to find out whether SPACE was just pressed
export function createSpacePrompt(id: string, props: {
  type: string
  x: number
  y: number
  width: number
  action: (t: Translation) => string
}) {
  let spaceWasDown = true // Only a fresh press counts, not one already held when it appears
  let lastFrame = 0

  const controller = createController({
    frames: [emptyAsset],
    init() {
      const shownIn = createObjectSignal(undefined as Locale | undefined, 'shownIn') // The language to show it in
      return {
        id,
        type: props.type,
        x: () => props.x,
        y: () => props.y,
        width: () => props.width,
        height: () => 30,
        ...shownIn,
        children: () => {
          const locale = shownIn.shownIn()
          if (!locale) return null
          const t = Translations[locale]
          return <div class={styles.prompt}>
            <em>{t.instructions.spacebar}</em> {props.action(t)}
          </div>
        },
      }
    },
  })

  return {
    controller,
    // Shows the prompt in this language, or hides it
    show: (locale: Locale | undefined) => controller.data.setShownIn(locale),
    // Whether SPACE went down since the last frame. A SPACE held over from while gameplay was
    // paused, like the one that closed a dialog, isn't a fresh press
    freshPress: () => {
      const now = Date.now()
      const spaceDown = Key.isDown(' ')
      const pressed = spaceDown && !spaceWasDown && now - lastFrame < pauseGap
      spaceWasDown = spaceDown
      lastFrame = now
      return pressed
    },
  }
}

const styles = {
  prompt: css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    width: '100%',
    height: '100%',
    color: 'white',
    fontSize: '1.2rem',
    whiteSpace: 'nowrap',
    textShadow: '1px 1px 3px #000',
    animation: 'fadeIn 0.3s ease-in-out',
    '& em': {
      fontStyle: 'normal',
      background: 'white',
      color: 'black',
      p: '0 8px',
      borderRadius: '4px',
      textShadow: 'none',
    },
  }),
}
