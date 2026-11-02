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
  kingdomPortalAsset,
  kingdomPortalVortexAsset,
  kingdomThroneAsset,
  kingdomWallAsset,
} from '@/assets'
import { createConnectedController, createController } from '@/engine'
import { createObjectSignal } from '@/engine/utils'
import { Sprite } from '@/engine/components/Sprite'
import { generateFrames } from '@/utils'
import { DiverController } from '../main/DiverController'
import { KingQuest } from '../../data/Dialogs'
import { useGameState } from '@/utils/GameStateContext'

const floorY = 690
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
        height: () => 600,
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
        y: () => floorY - 40 - height,
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

// Stone ring behind the throne. The vortex inside spins open once the king's quest is accepted
export function createKingdomPortalControllers(id: string, props: { x: number, y: number }) {
  const size = 280
  const vortexSize = 200
  const { gameState } = useGameState()!
  const isOpen = () => gameState.questState.king.state === 'accepted'

  const vortex = createController({
    frames: [kingdomPortalVortexAsset],
    init() {
      const open = createObjectSignal(isOpen() ? 1 : 0, 'open')
      const eased = () => 1 - (1 - open.open()) ** 3
      return {
        id: id + '-vortex',
        type: 'kingdom-portal-vortex',
        x: () => props.x + (size - vortexSize) / 2,
        y: () => props.y + (size - vortexSize) / 2,
        width: () => vortexSize,
        height: () => vortexSize,
        ...open,
        xScale: eased,
        yScale: eased,
        rotation: () => (1 - eased()) * 360,
        style: () => ({ opacity: eased() }),
      }
    },
    onEnterFrame({ $ }) {
      if (isOpen() && $.open() < 1) $.setOpen(Math.min(1, $.open() + 0.015))
    },
  })

  const ring = createController({
    frames: [kingdomPortalAsset],
    init() {
      return {
        id,
        type: 'kingdom-portal',
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

  return [ring, vortex]
}

// The corgi king, sitting on his throne. He paddles happily when the diver visits,
// gives them his quest, and reminds them about it on later visits
export function createCorgiKingController(id: string, props: { x: number, y: number }) {
  const talkDistance = 220
  const leaveDistance = 400

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
    onEnterFrame({ $, $scene, $age }) {
      $.setY(props.y + Math.sin($age / 12) * 2)
      const diver = $scene.getControllerById<DiverController>('diver')
      if (!diver) return
      const distance = diver.distanceTo(props.x + width / 2, props.y)
      $.setState(distance < 300 ? 'play' : 'pause')

      if (distance < talkDistance && !$.talkedThisVisit()) {
        $.setTalkedThisVisit(true)
        const questState = $scene.gameState.questState.king.state
        $scene.startDialog({
          messages: questState === 'new' ? KingQuest.intro : KingQuest.reminder,
          onComplete: () => $scene.setGameState('questState', 'king', 'state', 'accepted'),
          pauseGameplay: true,
        })
      } else if (distance > leaveDistance) {
        $.setTalkedThisVisit(false)
      }
    },
  })

  king.attach(createConnectedController({
    type: 'crown',
    base: king,
    frames: [kingdomCrownAsset],
    offset: { x: 78, y: -20 },
    width: () => 34,
    height: () => 26,
  }))

  return king
}

// Corgis going about their day, paddling back and forth between `from` and `to`
export function createCorgiCitizenController(id: string, props: {
  from: number,
  to: number,
  y: number,
  scale?: number,
  speed?: number,
  breed?: 'pembroke' | 'cardigan',
}) {
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
    onEnterFrame({ $, $age }) {
      $.setX($.x() + $.xScale() * speed)
      if ($.x() > props.to) $.setXScale(-1)
      if ($.x() < props.from) $.setXScale(1)
      $.setY(props.y + Math.sin($age / 15 + props.from) * 6)
    },
  })
}
