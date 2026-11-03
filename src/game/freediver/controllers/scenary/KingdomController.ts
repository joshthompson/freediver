import {
  kingdomBannerAsset,
  kingdomColumnAsset,
  kingdomCorgiAsset,
  kingdomCorgiCardiganAsset,
  kingdomCorgiKingAsset,
  kingdomCrownAsset,
  kingdomGlowCoralAsset,
  kingdomLanternAsset,
  kingdomOpeningAsset,
  plinthAsset,
  kingdomThroneAsset,
  kingdomWallAsset,
} from '@/assets'
import { createConnectedController, createController } from '@/engine'
import { createObjectSignal } from '@/engine/utils'
import { Sprite } from '@/engine/components/Sprite'
import { generateFrames } from '@/utils'
import { DiverController } from '../main/DiverController'
import { CorgiCitizenBackgroundDialogLines, KingQuest, KingReminderBackgroundDialogLines, OldKingBackgroundDialogLines } from '../../data/Dialogs'
import { createBackgroundDialogTrigger } from '../utils/BackgroundDialogTrigger'

export const floorY = 625
const ceilingY = 92

export function createKingdomOpeningController(id: string, props: { x: number }) {
  return createController({
    frames: [kingdomOpeningAsset],
    init() {
      return {
        id,
        type: 'kingdom-opening',
        x: () => props.x,
        y: () => 0,
        width: () => 300,
        height: () => 620,
      }
    },
  })
}

// The castle wall sits 205px into the sprite, so `edge` is where the diver is stopped
export function createKingdomWallController(id: string, props: { edge: number, side: 'left' | 'right' }) {
  const width = 260
  const wallWidth = 205
  const x = props.side === 'left' ? props.edge - wallWidth : props.edge - (width - wallWidth)

  return createController({
    frames: [kingdomWallAsset],
    solid: props.side === 'left'
      ? { x: wallWidth - 1000, y: -1000, width: 1000, height: 3000 }
      : { x: width - wallWidth, y: -1000, width: 1000, height: 3000 },
    init() {
      return {
        id,
        type: 'kingdom-wall',
        x: () => x,
        y: () => 0,
        xScale: () => props.side === 'left' ? 1 : -1,
        width: () => width,
        height: () => 700,
      }
    },
  })
}

export function createKingdomColumnController(id: string, props: { x: number }) {
  return createController({
    frames: [kingdomColumnAsset],
    init() {
      return {
        id,
        type: 'kingdom-column',
        x: () => props.x,
        y: () => 100,
        width: () => 90,
        height: () => floorY - 90,
      }
    },
  })
}

export function createKingdomBannerController(id: string, props: { x: number, color: 'red' | 'purple' }) {
  return createController({
    frames: [kingdomBannerAsset],
    init() {
      return {
        id,
        type: 'kingdom-banner',
        x: () => props.x,
        y: () => ceilingY,
        width: () => 70,
        height: () => 190,
        style: () => props.color === 'purple' ? { filter: 'hue-rotate(250deg)' } : {},
      }
    },
  })
}

export function createKingdomLanternController(id: string, props: { x: number }) {
  return createController({
    frames: [kingdomLanternAsset],
    init() {
      return {
        id,
        type: 'kingdom-lantern',
        x: () => props.x,
        y: () => ceilingY,
        width: () => 60,
        height: () => 150,
      }
    },
  })
}

export function createGlowCoralController(id: string, props: { x: number, scale?: number, hue?: number }) {
  const scale = props.scale ?? 1
  const height = 80 * scale

  return createController({
    frames: [kingdomGlowCoralAsset],
    init() {
      return {
        id,
        type: 'glow-coral',
        x: () => props.x,
        y: () => floorY - 10 - height,
        width: () => 90 * scale,
        height: () => height,
        style: () => ({ filter: `hue-rotate(${props.hue ?? 0}deg)` }),
      }
    },
  })
}

export const throneSize = { width: 200, height: 230, seatY: 116 }

export function createKingdomThroneController(id: string, props: { x: number }) {
  return createController({
    frames: [kingdomThroneAsset],
    init() {
      return {
        id,
        type: 'kingdom-throne',
        x: () => props.x,
        y: () => floorY - throneSize.height,
        width: () => throneSize.width,
        height: () => throneSize.height,
      }
    },
  })
}

// The corgi king, sitting on his throne. He paddles happily when the diver visits and gives them his quest.
// After that he only reminds them about it in passing, and once he's given Linkosha his crown he makes small talk
export function createCorgiKingController(id: string, props: {
  x: number
  y: number
  crowned: boolean
}) {
  const talkDistance = 220
  const leaveDistance = 400
  const backgroundDialog = createBackgroundDialogTrigger(
    props.crowned ? OldKingBackgroundDialogLines : KingReminderBackgroundDialogLines,
  )
  let quietFrames = 0 // So he doesn't ask about the quest the moment he's handed it out

  const width = 120
  const height = 75

  const king = createController({
    frames: generateFrames(kingdomCorgiKingAsset, 634, 394, width, 3, true),
    init() {
      return {
        id,
        type: 'corgi-king',
        x: () => props.x,
        ...createObjectSignal(props.y, 'y'),
        ...createObjectSignal('pause' as Sprite['state'], 'state'),
        ...createObjectSignal(false, 'talkedThisVisit'),
        xScale: () => -1,
        width: () => width,
        height: () => height,
        frameInterval: () => 150,
      }
    },
    onEnterFrame({ $, $scene, $age, $controller }) {
      $.setY(props.y + Math.sin($age / 12) * 2)
      const diver = $scene.getControllerById<DiverController>('diver')
      if (!diver) return
      const distance = diver.distanceTo(props.x + width / 2, props.y)
      $.setState(distance < 300 ? 'play' : 'pause')

      if ($scene.gameState.questState.king.state !== 'new') {
        if (quietFrames > 0) quietFrames--
        else backgroundDialog($scene, $controller)
        return
      }

      if (distance < talkDistance && !$.talkedThisVisit() && !$scene.dialog.data()) {
        $.setTalkedThisVisit(true)
        $scene.startDialog({
          messages: KingQuest.intro,
          onComplete: () => {
            $scene.setGameState('questState', 'king', 'state', 'accepted')
            quietFrames = 500 // About 20 seconds
          },
          pauseGameplay: true,
        })
      } else if (distance > leaveDistance) {
        $.setTalkedThisVisit(false)
      }
    },
  })

  if (!props.crowned) {
    king.attach(createConnectedController({
      type: 'crown',
      base: king,
      frames: [kingdomCrownAsset],
      offset: { x: 78, y: -21 },
      width: () => 34,
      height: () => 27,
    }))
  }

  return king
}

export const plinthSize = { width: 84, height: 70 }

// A stand behind the throne for one Crystal Corgi
export function createPlinthController(id: string, props: { x: number }) {
  return createController({
    frames: [plinthAsset],
    init() {
      return {
        id,
        type: 'plinth',
        x: () => props.x - plinthSize.width / 2,
        y: () => floorY - 10 - plinthSize.height,
        width: () => plinthSize.width,
        height: () => plinthSize.height,
      }
    },
  })
}

// Where a Crystal Corgi stands on top of the plinth centred on x
export const plinthTop = (x: number): Vector => ({ x, y: floorY - 10 - plinthSize.height + 6 })

// Corgis going about their day, paddling back and forth between `from` and `to`.
// Now and then they say something to Linkosha, and hail their new king once crowned
export function createCorgiCitizenController(id: string, props: {
  from: number,
  to: number,
  y: number,
  scale?: number,
  speed?: number,
  breed?: 'pembroke' | 'cardigan',
  crowned: boolean,
}) {
  const backgroundDialog = createBackgroundDialogTrigger(
    props.crowned ? CorgiCitizenBackgroundDialogLines.king : CorgiCitizenBackgroundDialogLines.visitor,
  )
  const scale = props.scale ?? 1
  const speed = props.speed ?? 1.2
  const asset = props.breed === 'cardigan' ? kingdomCorgiCardiganAsset : kingdomCorgiAsset

  return createController({
    frames: generateFrames(asset, 634, 394, 70 * scale, 3, true),
    randomStartFrame: true,
    init() {
      return {
        id,
        type: 'corgi-citizen',
        ...createObjectSignal(props.from + Math.random() * (props.to - props.from), 'x'),
        ...createObjectSignal(props.y, 'y'),
        ...createObjectSignal(Math.random() > 0.5 ? 1 : -1, 'xScale'),
        width: () => 70 * scale,
        height: () => 44 * scale,
        state: () => 'play' as const,
        frameInterval: () => 220,
      }
    },
    onEnterFrame({ $, $scene, $age, $controller }) {
      backgroundDialog($scene, $controller)
      $.setX($.x() + $.xScale() * speed)
      if ($.x() > props.to) $.setXScale(-1)
      if ($.x() < props.from) $.setXScale(1)
      $.setY(props.y + Math.sin($age / 15 + props.from) * 6)
    },
  })
}
