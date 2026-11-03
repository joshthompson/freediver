import { Accessor } from 'solid-js'
import { css } from '@style/css'
import { emptyAsset, kingdomPortalAsset, kingdomPortalVortexAsset } from '@/assets'
import { createController } from '@/engine'
import { createObjectSignal, Key } from '@/engine/utils'
import { Locale, Translations } from '../../data/Translations'
import { getDiver } from './Hazard'

const spaceDistance = 40 // How far past the vortex's edge SPACE still takes you through
const pauseGap = 120 // ms between frames that means gameplay was paused in between
const spinSpeed = 3 // Degrees an open vortex turns each frame

// A stone ring whose vortex spins open while `open` is true. Pressing SPACE on or beside an open portal
// calls `onEnter`. Swimming into it does nothing on its own
export function createPortalControllers(id: string, props: {
  x: number
  y: number
  size?: number
  open?: Accessor<boolean>
  closeAfter?: number // Frames an Entry Portal stays open after you arrive
  onEnter?: () => void
}) {
  const size = props.size ?? 200
  const vortexSize = size * 200 / 280
  const center = { x: props.x + size / 2, y: props.y + size / 2 }
  let age = 0
  let spaceWasDown = true // Only a fresh press counts, not one already held when the portal appears
  let lastFrame = 0
  const isOpen = () => props.closeAfter !== undefined ? age < props.closeAfter : props.open?.() ?? false

  const vortex = createController({
    frames: [kingdomPortalVortexAsset],
    init() {
      const open = createObjectSignal(isOpen() ? 1 : 0, 'open')
      const spin = createObjectSignal(0, 'spin')
      const eased = () => 1 - (1 - open.open()) ** 3
      return {
        id: id + '-vortex',
        type: 'portal-vortex',
        x: () => props.x + (size - vortexSize) / 2,
        y: () => props.y + (size - vortexSize) / 2,
        width: () => vortexSize,
        height: () => vortexSize,
        ...open,
        ...spin,
        xScale: eased,
        yScale: eased,
        rotation: () => spin.spin() + (1 - eased()) * 360,
        style: () => ({ opacity: eased() }),
      }
    },
    onEnterFrame({ $, $scene }) {
      age++
      if (isOpen() && $.open() < 1) $.setOpen(Math.min(1, $.open() + 0.015))
      if (!isOpen() && $.open() > 0) $.setOpen(Math.max(0, $.open() - 0.03))
      // Keeps turning while open. Frames stop while paused, so it does too
      if ($.open() > 0) $.setSpin(($.spin() + spinSpeed) % 360)

      // A SPACE held over from while gameplay was paused, like the one that closed a dialog, isn't a fresh press
      const now = Date.now()
      const spaceDown = Key.isDown(' ')
      const spacePressed = spaceDown && !spaceWasDown && now - lastFrame < pauseGap
      spaceWasDown = spaceDown
      lastFrame = now

      const diver = getDiver($scene)
      if (!diver || !props.onEnter) return
      const diverCenter = diver.data.center()
      const distance = Math.hypot(diverCenter.x - center.x, diverCenter.y - center.y)
      const ready = isOpen() && $.open() >= 1
      const near = ready && distance < vortexSize / 2 + spaceDistance
      prompt.data.setShownIn(near ? $scene.gameState.options.locale : undefined)

      if (near && spacePressed) props.onEnter()
    },
  })

  const ring = createController({
    frames: [kingdomPortalAsset],
    init() {
      return {
        id,
        type: 'portal',
        x: () => props.x,
        y: () => props.y,
        width: () => size,
        height: () => size,
        style: () => vortex.data.open() > 0
          ? { filter: `drop-shadow(0 0 14px rgba(150, 240, 255, ${0.8 * vortex.data.open()}))` }
          : {},
      }
    },
  })

  // "SPACE: Enter the Portal", shown while you're close enough to use it
  const prompt = createController({
    frames: [emptyAsset],
    init() {
      const shownIn = createObjectSignal(undefined as Locale | undefined, 'shownIn') // The language to show it in
      return {
        id: id + '-prompt',
        type: 'portal-prompt',
        x: () => props.x,
        y: () => props.y - 34,
        width: () => size,
        height: () => 30,
        ...shownIn,
        children: () => {
          const locale = shownIn.shownIn()
          if (!locale) return null
          const t = Translations[locale]
          return <div class={styles.prompt}>
            <em>{t.instructions.spacebar}</em> {t.realms.enterPortal}
          </div>
        },
      }
    },
  })

  return [ring, vortex, prompt] as const
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
