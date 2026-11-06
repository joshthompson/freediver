import { Accessor } from 'solid-js'
import { kingdomPortalAsset, kingdomPortalVortexAsset } from '@/assets'
import { createController } from '@/engine'
import { createObjectSignal } from '@/engine/utils'
import { getDiver } from './Hazard'
import { effects } from '../../music/effects'
import { createSpacePrompt } from '../utils/SpacePrompt'

const spaceDistance = 40 // How far past the vortex's edge SPACE still takes you through
const spinSpeed = 3 // Degrees an open vortex turns each frame
const hearingDistance = 900 // A Portal opening further from the Diver than this is silent
const openSpeed = 0.015 // How much further open the vortex gets each frame
const openTime = 1 / openSpeed / 25 // Seconds, at 25 frames a second
const pausedAfter = 200 // ms without a frame that means gameplay has been paused

// The sound of a Portal opening, from start to finish, for the Portal menu opening too
export const playPortalSound = () => effects.portalOpen(openTime)

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
  let heard = false // Whether the Diver was close enough to hear it start opening
  let openingSound: ReturnType<typeof effects.portalOpen> | undefined
  let pausedTimer: ReturnType<typeof setTimeout> | undefined
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
      if (isOpen() && $.open() < 1) {
        // Starting to open, rather than already open when it appeared
        if ($.open() === 0) {
          const diver = getDiver($scene)?.data.center()
          heard = !!diver && Math.hypot(diver.x - center.x, diver.y - center.y) < hearingDistance
        }
        // The sound follows the vortex: frames stop while gameplay is paused, like for a dialog, so it
        // stops too, and starts again from however far open it is when they carry on
        if (heard && !openingSound) openingSound = effects.portalOpen(openTime, $.open())
        clearTimeout(pausedTimer)
        pausedTimer = setTimeout(() => {
          openingSound?.stop()
          openingSound = undefined
        }, pausedAfter)

        $.setOpen(Math.min(1, $.open() + openSpeed))
        if ($.open() >= 1) {
          clearTimeout(pausedTimer) // Open, so the sound plays on to its sparkles
          openingSound = undefined
        }
      }
      if (!isOpen() && $.open() > 0) {
        clearTimeout(pausedTimer)
        openingSound?.stop()
        openingSound = undefined
        $.setOpen(Math.max(0, $.open() - 0.03))
      }
      // Keeps turning while open. Frames stop while paused, so it does too
      if ($.open() > 0) $.setSpin(($.spin() + spinSpeed) % 360)

      const spacePressed = prompt.freshPress()

      const diver = getDiver($scene)
      if (!diver || !props.onEnter) return
      const diverCenter = diver.data.center()
      const distance = Math.hypot(diverCenter.x - center.x, diverCenter.y - center.y)
      const ready = isOpen() && $.open() >= 1
      const near = ready && distance < vortexSize / 2 + spaceDistance
      prompt.show(near ? $scene.gameState.options.locale : undefined)

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
  const prompt = createSpacePrompt(id + '-prompt', {
    type: 'portal-prompt',
    x: props.x,
    y: props.y - 34,
    width: size,
    action: t => t.realms.enterPortal,
  })

  return [ring, vortex, prompt.controller] as const
}

